/*
===============================================================================
ALFI BOT — AFB-371
Consolidación SQL de seguridad
===============================================================================

Objetivo:
- Concentrar consultas reproducibles de seguridad para PostgreSQL.
- No eliminar ni reconstruir el esquema alfi.
- No crear credenciales ni almacenar contraseñas.
- Mantener explícitamente separados los controles VERIFICABLES de los PENDIENTES.

Dependencias de evidencia:
- AFB-151 — RBAC PostgreSQL: PENDIENTE.
- AFB-248 — Auditoría mediante triggers: FINALIZADO EN JIRA / POR REVALIDAR.
- AFB-189 — Backup y restauración: PENDIENTE.

Este archivo puede ejecutarse en su estado actual porque las secciones activas son
consultas de inspección. Los bloques que modificarán privilegios o roles permanecen
comentados hasta completar y validar las tareas de origen.
===============================================================================
*/

-- ============================================================================
-- 0. CONTEXTO DE EJECUCIÓN
-- ============================================================================

SELECT
    current_database() AS base_actual,
    current_user AS usuario_actual,
    current_schema() AS esquema_actual,
    version() AS version_postgresql;

-- ============================================================================
-- 1. INVENTARIO DEL ESQUEMA ALFI
-- ============================================================================

SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'alfi'
ORDER BY table_name;

-- ============================================================================
-- 2. AFB-151 — RBAC Y MÍNIMO PRIVILEGIO
-- ESTADO: PENDIENTE
-- ============================================================================

-- Evidencia reproducible del estado actual de roles técnicos ALFI.
SELECT
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles
WHERE rolname LIKE 'rol_alfi%'
ORDER BY rolname;

-- Privilegios existentes sobre el esquema alfi.
SELECT
    grantee,
    privilege_type
FROM information_schema.usage_privileges
WHERE object_type = 'SCHEMA'
  AND object_schema = 'alfi'
ORDER BY grantee, privilege_type;

-- Privilegios sobre tablas del esquema alfi.
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'alfi'
ORDER BY grantee, table_name, privilege_type;

/*
------------------------------------------------------------------------------
PENDIENTE AFB-151
No ejecutar este bloque hasta cerrar el diseño de RBAC y validar la BD real.

Modelo objetivo documentado en AFB-370:

    rol_alfi_admin
    rol_alfi_app
    rol_alfi_reporting

La implementación definitiva deberá:
1. Crear roles técnicos sin LOGIN cuando corresponda.
2. Revocar privilegios heredados no necesarios.
3. Otorgar solo USAGE/SELECT/INSERT/UPDATE/DELETE según función.
4. Probar operaciones permitidas.
5. Probar operaciones denegadas.
6. Documentar resultados.

PLANTILLA — NO ACTIVA:

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_admin') THEN
        CREATE ROLE rol_alfi_admin NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_app') THEN
        CREATE ROLE rol_alfi_app NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_reporting') THEN
        CREATE ROLE rol_alfi_reporting NOLOGIN;
    END IF;
END
$$;

REVOKE ALL ON SCHEMA alfi FROM PUBLIC;

GRANT USAGE ON SCHEMA alfi TO rol_alfi_app;
GRANT USAGE ON SCHEMA alfi TO rol_alfi_reporting;

-- Los GRANT por tabla se definirán únicamente después de validar las tablas
-- y necesidades reales de cada rol.
------------------------------------------------------------------------------
*/

-- ============================================================================
-- 3. AFB-248 — AUDITORÍA MEDIANTE TRIGGERS
-- ESTADO: FINALIZADO EN JIRA / POR REVALIDAR TÉCNICAMENTE
-- ============================================================================

-- Inventario de triggers instalados en el esquema alfi.
SELECT
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'alfi'
ORDER BY event_object_table, trigger_name, event_manipulation;

-- Funciones potencialmente relacionadas con triggers/auditoría.
SELECT
    n.nspname AS esquema,
    p.proname AS funcion,
    pg_get_function_identity_arguments(p.oid) AS argumentos
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'alfi'
ORDER BY p.proname;

/*
PENDIENTE DE REVALIDACIÓN AFB-248:

Después de confirmar el nombre real de la tabla de auditoría se incorporará aquí
una consulta explícita que demuestre registros producidos por al menos tres
entidades.

No se supone el nombre de la tabla porque AFB-370 exige evidencia real de la BD.
*/

-- ============================================================================
-- 4. PRUEBAS DE PRIVILEGIOS
-- ESTADO: PENDIENTE AFB-151
-- ============================================================================

/*
Estas consultas se habilitarán cuando existan los roles definitivos.

Ejemplos:

SELECT
    has_schema_privilege('rol_alfi_app', 'alfi', 'USAGE')
        AS app_puede_usar_schema;

SELECT
    has_schema_privilege('rol_alfi_reporting', 'alfi', 'USAGE')
        AS reporting_puede_usar_schema;

Para cada tabla crítica se deberán añadir pruebas con:

    has_table_privilege('ROL', 'alfi.TABLA', 'SELECT')
    has_table_privilege('ROL', 'alfi.TABLA', 'INSERT')
    has_table_privilege('ROL', 'alfi.TABLA', 'UPDATE')
    has_table_privilege('ROL', 'alfi.TABLA', 'DELETE')

La matriz final debe demostrar tanto permisos permitidos como denegados.
*/

-- ============================================================================
-- 5. AFB-189 — RESPALDO, RESTAURACIÓN, RPO Y RTO
-- ESTADO: PENDIENTE
-- ============================================================================

/*
El backup y la restauración se ejecutan con herramientas PostgreSQL externas
(pg_dump / pg_restore), no mediante sentencias destructivas dentro de este SQL.

AFB-189 deberá aportar:

- RPO definido.
- RTO definido.
- script/job de respaldo.
- archivo de backup generado.
- restauración sobre una base de prueba.
- tiempos medidos.
- validación de objetos y datos.

Referencia conceptual, NO ejecutar como SQL:

    pg_dump -Fc -d BASE_ORIGEN -f respaldo.dump
    pg_restore -d BASE_PRUEBA respaldo.dump

No versionar contraseñas, cadenas de conexión sensibles ni archivos de backup
que contengan datos reales.
*/

-- Consulta de verificación posterior a una futura restauración.
SELECT current_database() AS base_validada;

SELECT
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema = 'alfi'
ORDER BY table_name;

-- ============================================================================
-- 6. CHECKLIST DE ESTADO
-- ============================================================================

SELECT *
FROM (
    VALUES
        ('AFB-151', 'Roles PostgreSQL definitivos', 'PENDIENTE'),
        ('AFB-151', 'GRANT/REVOKE mínimo privilegio', 'PENDIENTE'),
        ('AFB-151', 'Pruebas positivas y negativas', 'PENDIENTE'),
        ('AFB-248', 'Triggers de auditoría', 'POR REVALIDAR'),
        ('AFB-248', 'Auditoría de al menos tres entidades', 'POR REVALIDAR'),
        ('AFB-189', 'RPO', 'PENDIENTE'),
        ('AFB-189', 'RTO', 'PENDIENTE'),
        ('AFB-189', 'Backup y restauración de prueba', 'PENDIENTE')
) AS estado(afiliada_jira, evidencia, estado)
ORDER BY afiliada_jira, evidencia;

-- ============================================================================
-- FIN AFB-371
-- ============================================================================
