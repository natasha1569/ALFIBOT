/*
===============================================================================
ALFI BOT — AFB-253
Reportería / BI sobre análisis preventivos de fraude
===============================================================================

Separación conceptual
---------------------
- Análisis IA: riesgo y categoría de fraude del contenido.
- Reportería / BI: patrones agregados.
- Auditoría técnica: quién modificó qué y cuándo.

Taxonomía vigente
-----------------
- credito_falso
- ponzi
- piramidal
- inversion_fraudulenta

Los análisis que no corresponden a una categoría soportada conservan su
nivel de riesgo, pero categoria_fraude permanece NULL.
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
            'AFB-253: no existe el esquema alfi. No se realizó ningún cambio.';
    END IF;

    IF to_regclass('alfi.analisis') IS NULL
       OR to_regclass('alfi.usuarios') IS NULL
       OR to_regclass('alfi.senales_alerta') IS NULL
       OR to_regclass('alfi.recomendaciones') IS NULL
       OR to_regclass('alfi.intereses_financieros') IS NULL
       OR to_regclass('alfi.usuario_intereses_financieros') IS NULL THEN
        RAISE EXCEPTION
            'AFB-253: faltan tablas requeridas para reportería. No se realizó ningún cambio.';
    END IF;
END
$$;

-- ============================================================================
-- 1. PERSISTENCIA DE CATEGORÍA DE FRAUDE
-- ============================================================================

ALTER TABLE alfi.analisis
    ADD COLUMN IF NOT EXISTS categoria_fraude varchar(40);

ALTER TABLE alfi.analisis
    ALTER COLUMN categoria_fraude DROP DEFAULT,
    ALTER COLUMN categoria_fraude DROP NOT NULL;

DO $$
DECLARE
    constraint_record record;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'alfi.analisis'::regclass
          AND conname = 'chk_analisis_categoria_fraude'
    LOOP
        EXECUTE format(
            'ALTER TABLE alfi.analisis DROP CONSTRAINT %I',
            constraint_record.conname
        );
    END LOOP;

    ALTER TABLE alfi.analisis
        ADD CONSTRAINT chk_analisis_categoria_fraude
        CHECK (
            categoria_fraude IS NULL
            OR categoria_fraude IN (
                'credito_falso',
                'ponzi',
                'piramidal',
                'inversion_fraudulenta'
            )
        );
END
$$;

COMMENT ON COLUMN alfi.analisis.categoria_fraude IS
    'Categoría de fraude soportada por ALFI BOT; NULL cuando el contenido no corresponde a la taxonomía vigente.';

CREATE INDEX IF NOT EXISTS idx_analisis_categoria_riesgo_fecha
    ON alfi.analisis (
        categoria_fraude,
        nivel_riesgo,
        fecha_creacion
    );

CREATE INDEX IF NOT EXISTS idx_analisis_tipo_fecha
    ON alfi.analisis (
        tipo,
        fecha_creacion
    );

-- ============================================================================
-- 2. VISTA BI: RIESGO + CATEGORÍA + TIPO DE CONTENIDO
-- ============================================================================

CREATE OR REPLACE VIEW alfi.vw_reporte_fraude_riesgo AS
WITH analisis_detalle AS (
    SELECT
        a.analisis_id,
        date_trunc('month', a.fecha_creacion)::date AS mes,
        a.categoria_fraude,
        a.nivel_riesgo,
        a.tipo,
        count(DISTINCT s.senal_id) AS total_senales,
        count(DISTINCT r.recomendacion_id) AS total_recomendaciones
    FROM alfi.analisis a
    LEFT JOIN alfi.senales_alerta s
        ON s.analisis_id = a.analisis_id
    LEFT JOIN alfi.recomendaciones r
        ON r.analisis_id = a.analisis_id
    WHERE a.permitido = true
    GROUP BY
        a.analisis_id,
        date_trunc('month', a.fecha_creacion),
        a.categoria_fraude,
        a.nivel_riesgo,
        a.tipo
)
SELECT
    mes,
    categoria_fraude,
    nivel_riesgo,
    tipo,
    count(*) AS total_analisis,
    sum(total_senales)::bigint AS total_senales,
    sum(total_recomendaciones)::bigint AS total_recomendaciones,
    round(
        count(*) * 100.0
        / NULLIF(
            sum(count(*)) OVER (PARTITION BY mes),
            0
        ),
        2
    ) AS porcentaje_mensual
FROM analisis_detalle
GROUP BY
    mes,
    categoria_fraude,
    nivel_riesgo,
    tipo;

COMMENT ON VIEW alfi.vw_reporte_fraude_riesgo IS
    'BI agregado por mes, categoría soportada, riesgo y tipo de contenido; NULL indica análisis sin categoría de fraude soportada.';

-- ============================================================================
-- 3. VISTA BI: TIPO DE CONTENIDO + PERFIL AGREGADO
-- ============================================================================

CREATE OR REPLACE VIEW alfi.vw_reporte_contenido_perfil AS
WITH intereses_por_usuario AS (
    SELECT
        ui.usuario_id,
        string_agg(
            DISTINCT i.codigo,
            ', '
            ORDER BY i.codigo
        ) AS intereses_financieros
    FROM alfi.usuario_intereses_financieros ui
    INNER JOIN alfi.intereses_financieros i
        ON i.interes_id = ui.interes_id
       AND i.activo = true
    GROUP BY ui.usuario_id
)
SELECT
    date_trunc('month', a.fecha_creacion)::date AS mes,
    a.tipo,
    a.nivel_riesgo,
    a.categoria_fraude,
    COALESCE(u.provincia, 'No informado') AS provincia,
    COALESCE(u.rango_edad, 'No informado') AS rango_edad,
    COALESCE(
        ipu.intereses_financieros,
        'Sin intereses registrados'
    ) AS intereses_financieros,
    count(DISTINCT a.analisis_id) AS total_analisis,
    count(DISTINCT a.usuario_id) AS usuarios_distintos,
    count(DISTINCT s.senal_id) AS total_senales
FROM alfi.analisis a
INNER JOIN alfi.usuarios u
    ON u.usuario_id = a.usuario_id
LEFT JOIN intereses_por_usuario ipu
    ON ipu.usuario_id = u.usuario_id
LEFT JOIN alfi.senales_alerta s
    ON s.analisis_id = a.analisis_id
WHERE a.permitido = true
GROUP BY
    date_trunc('month', a.fecha_creacion),
    a.tipo,
    a.nivel_riesgo,
    a.categoria_fraude,
    COALESCE(u.provincia, 'No informado'),
    COALESCE(u.rango_edad, 'No informado'),
    COALESCE(
        ipu.intereses_financieros,
        'Sin intereses registrados'
    );

COMMENT ON VIEW alfi.vw_reporte_contenido_perfil IS
    'BI agregado por contenido, riesgo, categoría soportada y atributos generales de perfil; no expone identidad individual.';

-- Alinea la propiedad de las vistas con el propietario real del esquema alfi.
-- Esto evita que ejecutar la migración con un usuario administrativo (por
-- ejemplo postgres) deje objetos aislados del usuario propietario del esquema.
DO $$
DECLARE
    propietario_esquema name;
BEGIN
    SELECT r.rolname
    INTO propietario_esquema
    FROM pg_namespace n
    INNER JOIN pg_roles r
        ON r.oid = n.nspowner
    WHERE n.nspname = 'alfi';

    IF propietario_esquema IS NULL THEN
        RAISE EXCEPTION
            'AFB-253: no se pudo determinar el propietario del esquema alfi.';
    END IF;

    EXECUTE format(
        'ALTER VIEW alfi.vw_reporte_fraude_riesgo OWNER TO %I',
        propietario_esquema
    );

    EXECUTE format(
        'ALTER VIEW alfi.vw_reporte_contenido_perfil OWNER TO %I',
        propietario_esquema
    );
END
$$;

-- ============================================================================
-- 4. RBAC DE REPORTERÍA
-- ============================================================================

REVOKE ALL ON TABLE
    alfi.vw_reporte_fraude_riesgo,
    alfi.vw_reporte_contenido_perfil
FROM PUBLIC;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'rol_alfi_admin'
    ) THEN
        GRANT SELECT ON TABLE
            alfi.vw_reporte_fraude_riesgo,
            alfi.vw_reporte_contenido_perfil
        TO rol_alfi_admin;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'rol_alfi_auditor'
    ) THEN
        GRANT SELECT ON TABLE
            alfi.vw_reporte_fraude_riesgo,
            alfi.vw_reporte_contenido_perfil
        TO rol_alfi_auditor;

        IF to_regclass('alfi.vw_reporte_actividad_usuarios') IS NOT NULL THEN
            REVOKE SELECT
                ON TABLE alfi.vw_reporte_actividad_usuarios
                FROM rol_alfi_auditor;
        END IF;
    END IF;
END
$$;

-- ============================================================================
-- 5. VALIDACIONES ANTES DE COMMIT
-- ============================================================================

DO $$
DECLARE
    columnas_sensibles integer;
BEGIN
    IF to_regclass('alfi.vw_reporte_fraude_riesgo') IS NULL
       OR to_regclass('alfi.vw_reporte_contenido_perfil') IS NULL THEN
        RAISE EXCEPTION
            'AFB-253: no se crearon las dos vistas BI requeridas.';
    END IF;

    SELECT count(*)
    INTO columnas_sensibles
    FROM information_schema.columns
    WHERE table_schema = 'alfi'
      AND table_name IN (
          'vw_reporte_fraude_riesgo',
          'vw_reporte_contenido_perfil'
      )
      AND column_name IN (
          'nombre',
          'usuario',
          'correo',
          'celular',
          'password_hash',
          'contenido',
          'vista_previa'
      );

    IF columnas_sensibles <> 0 THEN
        RAISE EXCEPTION
            'AFB-253: una vista BI expone columnas identificables o contenido no necesario.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM alfi.analisis
        WHERE categoria_fraude IS NOT NULL
          AND categoria_fraude NOT IN (
              'credito_falso',
              'ponzi',
              'piramidal',
              'inversion_fraudulenta'
          )
    ) THEN
        RAISE EXCEPTION
            'AFB-253: existen categorías fuera de la taxonomía vigente de ALFI BOT.';
    END IF;
END
$$;

COMMIT;

-- ============================================================================
-- 6. EVIDENCIA REPRODUCIBLE PARA PGADMIN / SUSTENTACIÓN
-- ============================================================================

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'alfi'
  AND table_name = 'analisis'
  AND column_name = 'categoria_fraude';

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid = 'alfi.analisis'::regclass
  AND conname = 'chk_analisis_categoria_fraude';

SELECT *
FROM alfi.vw_reporte_fraude_riesgo
ORDER BY mes DESC, total_analisis DESC, categoria_fraude NULLS LAST;

SELECT *
FROM alfi.vw_reporte_contenido_perfil
ORDER BY mes DESC, total_analisis DESC, provincia, rango_edad;

SELECT
    categoria_fraude,
    count(*) AS total
FROM alfi.analisis
GROUP BY categoria_fraude
ORDER BY categoria_fraude NULLS LAST;

SELECT
    grantee,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS permisos
FROM information_schema.role_table_grants
WHERE table_schema = 'alfi'
  AND table_name IN (
      'vw_reporte_fraude_riesgo',
      'vw_reporte_contenido_perfil'
  )
  AND grantee IN (
      'rol_alfi_admin',
      'rol_alfi_auditor',
      'rol_alfi_usuario'
  )
GROUP BY grantee, table_name
ORDER BY grantee, table_name;

-- ============================================================================
-- FIN AFB-253
-- ============================================================================
