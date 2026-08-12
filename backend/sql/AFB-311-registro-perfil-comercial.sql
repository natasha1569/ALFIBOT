/*
===============================================================================
ALFI BOT — AFB-311
Extender modelo de usuarios en PostgreSQL para registro
===============================================================================

Objetivo
--------
Extender de forma aditiva e idempotente el modelo de registro de usuarios para
incorporar:

- provincia;
- rango de edad;
- aceptación de Términos y Condiciones / Política de Privacidad;
- fecha y versión de aceptación;
- intereses financieros normalizados en una relación N:M.

Principios
----------
- No eliminar ni reconstruir tablas existentes.
- No inventar aceptación retroactiva para usuarios existentes.
- Mantener compatibilidad con registros históricos.
- Aplicar validaciones en la capa de datos.
- Mantener RBAC y mínimo privilegio sobre los nuevos objetos.
- No almacenar secretos ni credenciales.
===============================================================================
*/

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- ============================================================================
-- 0. PRECONDICIONES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_namespace
        WHERE nspname = 'alfi'
    ) THEN
        RAISE EXCEPTION
            'AFB-311: no existe el esquema alfi. No se realizó ningún cambio.';
    END IF;

    IF to_regclass('alfi.usuarios') IS NULL THEN
        RAISE EXCEPTION
            'AFB-311: no existe alfi.usuarios. No se realizó ningún cambio.';
    END IF;
END
$$;

-- ============================================================================
-- 1. EXTENSIÓN ADITIVA DE alfi.usuarios
-- ============================================================================

ALTER TABLE alfi.usuarios
    ADD COLUMN IF NOT EXISTS provincia varchar(40),
    ADD COLUMN IF NOT EXISTS rango_edad varchar(10),
    ADD COLUMN IF NOT EXISTS terminos_aceptados boolean,
    ADD COLUMN IF NOT EXISTS terminos_aceptados_en timestamp without time zone,
    ADD COLUMN IF NOT EXISTS terminos_version varchar(20);

COMMENT ON COLUMN alfi.usuarios.provincia IS
    'Provincia de residencia declarada por el usuario para perfil general y analítica agregada.';

COMMENT ON COLUMN alfi.usuarios.rango_edad IS
    'Rango etario declarado por el usuario; evita almacenar fecha de nacimiento cuando no es necesaria.';

COMMENT ON COLUMN alfi.usuarios.terminos_aceptados IS
    'Aceptación expresa de Términos y Condiciones / Política de Privacidad para nuevos registros.';

COMMENT ON COLUMN alfi.usuarios.terminos_aceptados_en IS
    'Fecha y hora en que el usuario aceptó la versión vigente de los términos.';

COMMENT ON COLUMN alfi.usuarios.terminos_version IS
    'Versión de los Términos y Condiciones / Política de Privacidad aceptada por el usuario.';

-- ============================================================================
-- 2. VALIDACIONES DE DATOS
--    Los usuarios históricos permanecen con NULL: no se simula consentimiento.
--    Los nuevos registros deberán completar estos campos desde backend.
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_usuario_provincia'
          AND conrelid = 'alfi.usuarios'::regclass
    ) THEN
        ALTER TABLE alfi.usuarios
            ADD CONSTRAINT chk_usuario_provincia
            CHECK (
                provincia IS NULL
                OR provincia IN (
                    'Azuay',
                    'Bolívar',
                    'Cañar',
                    'Carchi',
                    'Chimborazo',
                    'Cotopaxi',
                    'El Oro',
                    'Esmeraldas',
                    'Galápagos',
                    'Guayas',
                    'Imbabura',
                    'Loja',
                    'Los Ríos',
                    'Manabí',
                    'Morona Santiago',
                    'Napo',
                    'Orellana',
                    'Pastaza',
                    'Pichincha',
                    'Santa Elena',
                    'Santo Domingo de los Tsáchilas',
                    'Sucumbíos',
                    'Tungurahua',
                    'Zamora Chinchipe'
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_usuario_rango_edad'
          AND conrelid = 'alfi.usuarios'::regclass
    ) THEN
        ALTER TABLE alfi.usuarios
            ADD CONSTRAINT chk_usuario_rango_edad
            CHECK (
                rango_edad IS NULL
                OR rango_edad IN (
                    '18-24',
                    '25-34',
                    '35-44',
                    '45-54',
                    '55-64',
                    '65+'
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_usuario_terminos_coherencia'
          AND conrelid = 'alfi.usuarios'::regclass
    ) THEN
        ALTER TABLE alfi.usuarios
            ADD CONSTRAINT chk_usuario_terminos_coherencia
            CHECK (
                (
                    terminos_aceptados IS NULL
                    AND terminos_aceptados_en IS NULL
                    AND terminos_version IS NULL
                )
                OR
                (
                    terminos_aceptados IS TRUE
                    AND terminos_aceptados_en IS NOT NULL
                    AND nullif(btrim(terminos_version), '') IS NOT NULL
                )
            );
    END IF;
END
$$;

-- ============================================================================
-- 3. CATÁLOGO NORMALIZADO DE INTERESES FINANCIEROS
-- ============================================================================

CREATE TABLE IF NOT EXISTS alfi.intereses_financieros (
    interes_id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    codigo varchar(40) NOT NULL,
    nombre varchar(80) NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    fecha_creacion timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_intereses_financieros_codigo UNIQUE (codigo),
    CONSTRAINT uq_intereses_financieros_nombre UNIQUE (nombre),
    CONSTRAINT chk_intereses_financieros_codigo
        CHECK (codigo ~ '^[a-z0-9_]+$'),
    CONSTRAINT chk_intereses_financieros_nombre
        CHECK (char_length(btrim(nombre)) BETWEEN 3 AND 80)
);

COMMENT ON TABLE alfi.intereses_financieros IS
    'Catálogo de intereses financieros generales usados para perfil y analítica agregada.';

INSERT INTO alfi.intereses_financieros (codigo, nombre)
VALUES
    ('ahorro', 'Ahorro'),
    ('creditos_financiamiento', 'Créditos y financiamiento'),
    ('inversiones', 'Inversiones'),
    ('seguros', 'Seguros'),
    ('emprendimiento', 'Emprendimiento'),
    ('educacion_financiera', 'Educación financiera')
ON CONFLICT (codigo)
DO UPDATE SET
    nombre = EXCLUDED.nombre,
    activo = true;

-- ============================================================================
-- 4. RELACIÓN N:M USUARIO <-> INTERÉS
-- ============================================================================

CREATE TABLE IF NOT EXISTS alfi.usuario_intereses_financieros (
    usuario_id integer NOT NULL,
    interes_id integer NOT NULL,
    fecha_registro timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuario_intereses_financieros
        PRIMARY KEY (usuario_id, interes_id),
    CONSTRAINT fk_usuario_interes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES alfi.usuarios(usuario_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_interes_interes
        FOREIGN KEY (interes_id)
        REFERENCES alfi.intereses_financieros(interes_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON TABLE alfi.usuario_intereses_financieros IS
    'Relación normalizada entre usuarios e intereses financieros declarados.';

CREATE INDEX IF NOT EXISTS idx_usuario_intereses_interes
    ON alfi.usuario_intereses_financieros(interes_id);

-- ============================================================================
-- 5. RBAC SOBRE LOS NUEVOS OBJETOS
--    Mantiene la política ya implementada en AFB-151 y neutraliza privilegios
--    automáticos heredados de ALTER DEFAULT PRIVILEGES del propietario.
-- ============================================================================

REVOKE ALL
    ON TABLE alfi.intereses_financieros,
             alfi.usuario_intereses_financieros
    FROM PUBLIC;

DO $$
DECLARE
    interes_sequence text;
BEGIN
    interes_sequence := pg_get_serial_sequence(
        'alfi.intereses_financieros',
        'interes_id'
    );

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_admin') THEN
        REVOKE ALL
            ON TABLE alfi.intereses_financieros,
                     alfi.usuario_intereses_financieros
            FROM rol_alfi_admin;

        GRANT SELECT, INSERT, UPDATE, DELETE
            ON TABLE alfi.intereses_financieros,
                     alfi.usuario_intereses_financieros
            TO rol_alfi_admin;

        IF interes_sequence IS NOT NULL THEN
            EXECUTE format(
                'REVOKE ALL ON SEQUENCE %s FROM rol_alfi_admin',
                interes_sequence
            );
            EXECUTE format(
                'GRANT USAGE, SELECT ON SEQUENCE %s TO rol_alfi_admin',
                interes_sequence
            );
        END IF;

        -- Evita que tablas/secuencias futuras creadas por el ejecutor de esta
        -- migración vuelvan a otorgar privilegios amplios automáticamente.
        ALTER DEFAULT PRIVILEGES IN SCHEMA alfi
            REVOKE ALL ON TABLES FROM rol_alfi_admin;

        ALTER DEFAULT PRIVILEGES IN SCHEMA alfi
            REVOKE ALL ON SEQUENCES FROM rol_alfi_admin;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_auditor') THEN
        REVOKE ALL
            ON TABLE alfi.intereses_financieros,
                     alfi.usuario_intereses_financieros
            FROM rol_alfi_auditor;

        GRANT SELECT
            ON TABLE alfi.intereses_financieros
            TO rol_alfi_auditor;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_usuario') THEN
        REVOKE ALL
            ON TABLE alfi.intereses_financieros,
                     alfi.usuario_intereses_financieros
            FROM rol_alfi_usuario;

        GRANT SELECT
            ON TABLE alfi.intereses_financieros
            TO rol_alfi_usuario;

        GRANT SELECT, INSERT, DELETE
            ON TABLE alfi.usuario_intereses_financieros
            TO rol_alfi_usuario;
    END IF;
END
$$;

-- ============================================================================
-- 6. VALIDACIONES PREVIAS AL COMMIT
-- ============================================================================

DO $$
DECLARE
    intereses_activos integer;
BEGIN
    SELECT count(*)
    INTO intereses_activos
    FROM alfi.intereses_financieros
    WHERE activo = true;

    IF intereses_activos < 6 THEN
        RAISE EXCEPTION
            'AFB-311: catálogo incompleto; se esperaban al menos 6 intereses activos.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'alfi'
          AND table_name = 'usuarios'
          AND column_name = 'provincia'
    ) THEN
        RAISE EXCEPTION
            'AFB-311: no se creó alfi.usuarios.provincia.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'alfi'
          AND table_name = 'usuarios'
          AND column_name = 'rango_edad'
    ) THEN
        RAISE EXCEPTION
            'AFB-311: no se creó alfi.usuarios.rango_edad.';
    END IF;

    IF to_regclass('alfi.usuario_intereses_financieros') IS NULL THEN
        RAISE EXCEPTION
            'AFB-311: no se creó la relación normalizada de intereses.';
    END IF;

    IF has_table_privilege(
        'rol_alfi_admin',
        'alfi.intereses_financieros',
        'TRUNCATE'
    ) OR has_table_privilege(
        'rol_alfi_admin',
        'alfi.intereses_financieros',
        'REFERENCES'
    ) OR has_table_privilege(
        'rol_alfi_admin',
        'alfi.intereses_financieros',
        'TRIGGER'
    ) THEN
        RAISE EXCEPTION
            'AFB-311: rol_alfi_admin conserva privilegios de tabla fuera de la matriz mínima.';
    END IF;

    IF has_table_privilege(
        'rol_alfi_auditor',
        'alfi.usuario_intereses_financieros',
        'SELECT'
    ) THEN
        RAISE EXCEPTION
            'AFB-311: rol_alfi_auditor no debe leer relaciones individuales usuario-interés.';
    END IF;
END
$$;

COMMIT;

-- ============================================================================
-- 7. EVIDENCIA REPRODUCIBLE
-- ============================================================================

SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'alfi'
  AND table_name = 'usuarios'
  AND column_name IN (
      'provincia',
      'rango_edad',
      'terminos_aceptados',
      'terminos_aceptados_en',
      'terminos_version'
  )
ORDER BY ordinal_position;

SELECT
    interes_id,
    codigo,
    nombre,
    activo
FROM alfi.intereses_financieros
ORDER BY interes_id;

SELECT
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'alfi'
  AND tc.table_name = 'usuario_intereses_financieros'
ORDER BY tc.constraint_type, tc.constraint_name;

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid = 'alfi.usuarios'::regclass
  AND conname IN (
      'chk_usuario_provincia',
      'chk_usuario_rango_edad',
      'chk_usuario_terminos_coherencia'
  )
ORDER BY conname;

SELECT
    grantee,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permisos
FROM information_schema.role_table_grants
WHERE table_schema = 'alfi'
  AND table_name IN (
      'intereses_financieros',
      'usuario_intereses_financieros'
  )
  AND grantee IN (
      'rol_alfi_admin',
      'rol_alfi_auditor',
      'rol_alfi_usuario'
  )
GROUP BY grantee, table_name
ORDER BY grantee, table_name;

-- ============================================================================
-- FIN AFB-311
-- ============================================================================
