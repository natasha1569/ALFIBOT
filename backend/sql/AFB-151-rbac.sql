/*
===============================================================================
ALFI BOT — AFB-151
RBAC PostgreSQL y Principio de Mínimo Privilegio
===============================================================================

Objetivo
--------
Implementar de forma segura y reproducible el esquema RBAC definitivo de
ALFI BOT, sin reconstruir el esquema `alfi`, sin eliminar datos y sin almacenar
contraseñas en el repositorio.

Modelo funcional definitivo
----------------------------
- Administrador
- Auditor
- Usuario

Roles PostgreSQL NOLOGIN
------------------------
- rol_alfi_admin
- rol_alfi_auditor
- rol_alfi_usuario

Cuentas LOGIN técnicas existentes, cuando estén presentes
----------------------------------------------------------
- alfi_admin
- alfi_auditor
- alfi_usuario

Notas de seguridad
------------------
1. Este script NO contiene contraseñas.
2. Si existen las cuentas históricas terminadas en `_final`, se renombran para
   conservar membresías y dependencias en lugar de eliminarlas/recrearlas.
3. El antiguo perfil `analista` se migra nominalmente a `usuario`; sus permisos
   NO se copian a ciegas: se revocan y se reconstruyen mediante una matriz
   explícita de mínimo privilegio.
4. El script NO ejecuta DROP ROLE.
5. La cuenta normal de la aplicación NO es un usuario PostgreSQL entregado al
   cliente final. React continúa comunicándose con Express; la autorización por
   propietario/rol funcional se controla en el backend.
6. La tabla `auditoria` se mantiene en solo lectura para los tres perfiles RBAC;
   su escritura debe producirse mediante el mecanismo de auditoría ya definido.
===============================================================================
*/

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- ============================================================================
-- 0. PRECONDICIONES: FALLAR ANTES DE MODIFICAR SI EL ESTADO ES INESPERADO
-- ============================================================================

DO $$
DECLARE
    objeto text;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'alfi') THEN
        RAISE EXCEPTION 'AFB-151: no existe el esquema alfi. No se realizó ningún cambio.';
    END IF;

    FOREACH objeto IN ARRAY ARRAY[
        'alfi.analisis',
        'alfi.auditoria',
        'alfi.recomendaciones',
        'alfi.roles',
        'alfi.senales_alerta',
        'alfi.usuarios'
    ]
    LOOP
        IF to_regclass(objeto) IS NULL THEN
            RAISE EXCEPTION 'AFB-151: falta el objeto requerido %. No se realizó ningún cambio.', objeto;
        END IF;
    END LOOP;

    IF current_user IN (
        'alfi_admin_final',
        'alfi_analista_final',
        'alfi_auditor_final'
    ) THEN
        RAISE EXCEPTION
            'AFB-151: la sesión está conectada con una cuenta que debe renombrarse (%). Reconecte con la cuenta propietaria/administrativa y vuelva a ejecutar.',
            current_user;
    END IF;
END
$$;

-- Detectar colisiones de nombres. Nunca se elige automáticamente entre dos
-- identidades que ya existan simultáneamente.
DO $$
DECLARE
    par text[];
BEGIN
    FOREACH par SLICE 1 IN ARRAY ARRAY[
        ARRAY['rol_alfi_admin_final', 'rol_alfi_admin'],
        ARRAY['rol_alfi_analista_final', 'rol_alfi_usuario'],
        ARRAY['rol_alfi_auditor_final', 'rol_alfi_auditor'],
        ARRAY['alfi_admin_final', 'alfi_admin'],
        ARRAY['alfi_analista_final', 'alfi_usuario'],
        ARRAY['alfi_auditor_final', 'alfi_auditor']
    ]
    LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = par[1])
           AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = par[2]) THEN
            RAISE EXCEPTION
                'AFB-151: existen simultáneamente los roles % y %. Se requiere revisión manual antes de continuar.',
                par[1], par[2];
        END IF;
    END LOOP;
END
$$;

-- ============================================================================
-- 1. NORMALIZACIÓN SEGURA DE NOMBRES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_admin_final')
       AND NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_admin') THEN
        ALTER ROLE rol_alfi_admin_final RENAME TO rol_alfi_admin;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_analista_final')
       AND NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_usuario') THEN
        ALTER ROLE rol_alfi_analista_final RENAME TO rol_alfi_usuario;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_auditor_final')
       AND NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_auditor') THEN
        ALTER ROLE rol_alfi_auditor_final RENAME TO rol_alfi_auditor;
    END IF;

    -- Las cuentas LOGIN existentes se renombran, no se recrean, para no
    -- versionar ni inventar contraseñas.
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_admin_final')
       AND NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_admin') THEN
        ALTER ROLE alfi_admin_final RENAME TO alfi_admin;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_analista_final')
       AND NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_usuario') THEN
        ALTER ROLE alfi_analista_final RENAME TO alfi_usuario;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_auditor_final')
       AND NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_auditor') THEN
        ALTER ROLE alfi_auditor_final RENAME TO alfi_auditor;
    END IF;
END
$$;

-- Crear únicamente los roles de permisos NOLOGIN si no existían previamente.
-- Las cuentas LOGIN no se crean automáticamente porque sus credenciales deben
-- gestionarse fuera del repositorio.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_admin') THEN
        CREATE ROLE rol_alfi_admin NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_auditor') THEN
        CREATE ROLE rol_alfi_auditor NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_usuario') THEN
        CREATE ROLE rol_alfi_usuario NOLOGIN;
    END IF;
END
$$;

-- Atributos de seguridad de los roles de permisos.
ALTER ROLE rol_alfi_admin
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
ALTER ROLE rol_alfi_auditor
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
ALTER ROLE rol_alfi_usuario
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;

-- Endurecer las cuentas LOGIN existentes sin alterar sus contraseñas.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_admin') THEN
        ALTER ROLE alfi_admin
            LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_auditor') THEN
        ALTER ROLE alfi_auditor
            LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_usuario') THEN
        ALTER ROLE alfi_usuario
            LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
    END IF;
END
$$;

-- ============================================================================
-- 2. MEMBRESÍAS LOGIN -> NOLOGIN
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_admin') THEN
        GRANT rol_alfi_admin TO alfi_admin;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_auditor') THEN
        GRANT rol_alfi_auditor TO alfi_auditor;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_usuario') THEN
        GRANT rol_alfi_usuario TO alfi_usuario;
    END IF;
END
$$;

-- ============================================================================
-- 3. PRINCIPIO DE MÍNIMO PRIVILEGIO
-- ============================================================================

-- El esquema no queda abierto a PUBLIC.
REVOKE ALL ON SCHEMA alfi FROM PUBLIC;

-- Retirar permisos directos previos de los perfiles RBAC. Luego se reconstruye
-- la matriz explícitamente. Esto evita conservar privilegios heredados del
-- antiguo rol `analista` o del sufijo `_final`.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA alfi
    FROM rol_alfi_admin, rol_alfi_auditor, rol_alfi_usuario;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA alfi
    FROM rol_alfi_admin, rol_alfi_auditor, rol_alfi_usuario;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_admin') THEN
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA alfi FROM alfi_admin;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA alfi FROM alfi_admin;
        REVOKE ALL ON SCHEMA alfi FROM alfi_admin;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_auditor') THEN
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA alfi FROM alfi_auditor;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA alfi FROM alfi_auditor;
        REVOKE ALL ON SCHEMA alfi FROM alfi_auditor;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_usuario') THEN
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA alfi FROM alfi_usuario;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA alfi FROM alfi_usuario;
        REVOKE ALL ON SCHEMA alfi FROM alfi_usuario;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA alfi
    TO rol_alfi_admin, rol_alfi_auditor, rol_alfi_usuario;

-- ----------------------------------------------------------------------------
-- 3.1 ADMINISTRADOR
-- Administración funcional de ALFI BOT, sin privilegios del motor.
-- La evidencia de auditoría permanece protegida contra modificación.
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    alfi.analisis,
    alfi.recomendaciones,
    alfi.roles,
    alfi.senales_alerta,
    alfi.usuarios
TO rol_alfi_admin;

GRANT SELECT ON TABLE alfi.auditoria TO rol_alfi_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA alfi TO rol_alfi_admin;

-- ----------------------------------------------------------------------------
-- 3.2 AUDITOR
-- Lectura de trazabilidad y reportería. Sin capacidad de escritura.
-- ----------------------------------------------------------------------------
GRANT SELECT ON TABLE alfi.auditoria TO rol_alfi_auditor;

-- ----------------------------------------------------------------------------
-- 3.3 USUARIO / OPERACIÓN NORMAL DE ALFI
-- Este rol representa las operaciones de un usuario normal ejecutadas por el
-- backend; no se entrega una conexión PostgreSQL al navegador.
-- La autorización por propietario de registro corresponde al backend.
-- ----------------------------------------------------------------------------
GRANT SELECT ON TABLE alfi.roles TO rol_alfi_usuario;
GRANT SELECT, INSERT, UPDATE ON TABLE alfi.usuarios TO rol_alfi_usuario;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    alfi.analisis,
    alfi.recomendaciones,
    alfi.senales_alerta
TO rol_alfi_usuario;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA alfi TO rol_alfi_usuario;

-- Vistas de reportería actuales: únicamente administrador y auditor.
DO $$
BEGIN
    IF to_regclass('alfi.vw_reporte_actividad_usuarios') IS NOT NULL THEN
        GRANT SELECT ON TABLE alfi.vw_reporte_actividad_usuarios
            TO rol_alfi_admin, rol_alfi_auditor;
    END IF;

    IF to_regclass('alfi.vw_reporte_riesgos_mensual') IS NOT NULL THEN
        GRANT SELECT ON TABLE alfi.vw_reporte_riesgos_mensual
            TO rol_alfi_admin, rol_alfi_auditor;
    END IF;
END
$$;

-- ============================================================================
-- 4. VALIDACIONES AUTOMÁTICAS ANTES DE COMMIT
-- ============================================================================

DO $$
DECLARE
    rol text;
BEGIN
    FOREACH rol IN ARRAY ARRAY['rol_alfi_admin', 'rol_alfi_auditor', 'rol_alfi_usuario']
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = rol
              AND rolsuper = false
              AND rolcreatedb = false
              AND rolcreaterole = false
              AND rolcanlogin = false
        ) THEN
            RAISE EXCEPTION 'AFB-151: el rol % no cumple los atributos de mínimo privilegio esperados.', rol;
        END IF;
    END LOOP;

    -- Auditor: nunca debe escribir en evidencia.
    IF has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'INSERT')
       OR has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'UPDATE')
       OR has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'DELETE') THEN
        RAISE EXCEPTION 'AFB-151: rol_alfi_auditor tiene permisos de escritura sobre auditoria.';
    END IF;

    -- Usuario: nunca debe consultar la auditoría.
    IF has_table_privilege('rol_alfi_usuario', 'alfi.auditoria', 'SELECT') THEN
        RAISE EXCEPTION 'AFB-151: rol_alfi_usuario tiene acceso indebido a auditoria.';
    END IF;

    -- Usuario: debe poder ejecutar el flujo operacional principal.
    IF NOT has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'SELECT')
       OR NOT has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'INSERT')
       OR NOT has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'DELETE') THEN
        RAISE EXCEPTION 'AFB-151: rol_alfi_usuario no dispone del conjunto operacional requerido sobre analisis.';
    END IF;
END
$$;

COMMIT;

-- ============================================================================
-- 5. EVIDENCIA REPRODUCIBLE POSTERIOR A LA EJECUCIÓN
-- ============================================================================

-- 5.1 Roles finales y atributos.
SELECT
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles
WHERE rolname IN (
    'rol_alfi_admin', 'rol_alfi_auditor', 'rol_alfi_usuario',
    'alfi_admin', 'alfi_auditor', 'alfi_usuario'
)
ORDER BY rolcanlogin, rolname;

-- 5.2 Debe devolver 0 filas: no deben sobrevivir nombres históricos.
SELECT rolname
FROM pg_roles
WHERE rolname ILIKE 'alfi%analista%'
   OR rolname ILIKE 'rol_alfi%analista%'
   OR rolname IN (
       'rol_alfi_admin_final', 'rol_alfi_auditor_final',
       'alfi_admin_final', 'alfi_auditor_final'
   )
ORDER BY rolname;

-- 5.3 Membresías.
SELECT
    miembro.rolname AS cuenta_login,
    concedido.rolname AS rol_no_login
FROM pg_auth_members m
JOIN pg_roles concedido ON concedido.oid = m.roleid
JOIN pg_roles miembro ON miembro.oid = m.member
WHERE miembro.rolname IN ('alfi_admin', 'alfi_auditor', 'alfi_usuario')
ORDER BY miembro.rolname, concedido.rolname;

-- 5.4 Matriz real de privilegios.
SELECT
    grantee,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permisos
FROM information_schema.role_table_grants
WHERE table_schema = 'alfi'
  AND grantee IN ('rol_alfi_admin', 'rol_alfi_auditor', 'rol_alfi_usuario')
GROUP BY grantee, table_name
ORDER BY grantee, table_name;

-- 5.5 Pruebas positivas y negativas en una sola matriz defendible.
SELECT *
FROM (
    VALUES
        ('admin_lee_usuarios',
            has_table_privilege('rol_alfi_admin', 'alfi.usuarios', 'SELECT'), true),
        ('admin_modifica_usuarios',
            has_table_privilege('rol_alfi_admin', 'alfi.usuarios', 'UPDATE'), true),
        ('admin_lee_auditoria',
            has_table_privilege('rol_alfi_admin', 'alfi.auditoria', 'SELECT'), true),
        ('admin_no_modifica_auditoria',
            has_table_privilege('rol_alfi_admin', 'alfi.auditoria', 'UPDATE'), false),
        ('auditor_lee_auditoria',
            has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'SELECT'), true),
        ('auditor_no_inserta_auditoria',
            has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'INSERT'), false),
        ('auditor_no_modifica_usuarios',
            has_table_privilege('rol_alfi_auditor', 'alfi.usuarios', 'UPDATE'), false),
        ('usuario_crea_analisis',
            has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'INSERT'), true),
        ('usuario_borra_analisis',
            has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'DELETE'), true),
        ('usuario_no_lee_auditoria',
            has_table_privilege('rol_alfi_usuario', 'alfi.auditoria', 'SELECT'), false)
) AS pruebas(prueba, resultado_real, resultado_esperado)
ORDER BY prueba;

-- El criterio de prueba se satisface cuando todas las filas devuelven cumple=true.
SELECT
    prueba,
    resultado_real,
    resultado_esperado,
    (resultado_real = resultado_esperado) AS cumple
FROM (
    VALUES
        ('admin_lee_usuarios',
            has_table_privilege('rol_alfi_admin', 'alfi.usuarios', 'SELECT'), true),
        ('admin_modifica_usuarios',
            has_table_privilege('rol_alfi_admin', 'alfi.usuarios', 'UPDATE'), true),
        ('admin_lee_auditoria',
            has_table_privilege('rol_alfi_admin', 'alfi.auditoria', 'SELECT'), true),
        ('admin_no_modifica_auditoria',
            has_table_privilege('rol_alfi_admin', 'alfi.auditoria', 'UPDATE'), false),
        ('auditor_lee_auditoria',
            has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'SELECT'), true),
        ('auditor_no_inserta_auditoria',
            has_table_privilege('rol_alfi_auditor', 'alfi.auditoria', 'INSERT'), false),
        ('auditor_no_modifica_usuarios',
            has_table_privilege('rol_alfi_auditor', 'alfi.usuarios', 'UPDATE'), false),
        ('usuario_crea_analisis',
            has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'INSERT'), true),
        ('usuario_borra_analisis',
            has_table_privilege('rol_alfi_usuario', 'alfi.analisis', 'DELETE'), true),
        ('usuario_no_lee_auditoria',
            has_table_privilege('rol_alfi_usuario', 'alfi.auditoria', 'SELECT'), false)
) AS matriz(prueba, resultado_real, resultado_esperado)
ORDER BY prueba;

-- ============================================================================
-- FIN AFB-151
-- ============================================================================
