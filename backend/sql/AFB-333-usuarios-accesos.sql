/*
===============================================================================
ALFI BOT — AFB-333 / HU-17
Administración de usuarios y accesos
===============================================================================

Objetivos:
- retirar el rol funcional histórico `analista` del catálogo de aplicación;
- migrar usuarios `analista` a `usuario` sin perder referencias;
- conservar únicamente administrador, auditor y usuario;
- validar integridad de la migración de forma transaccional e idempotente.

Nota de alcance:
ALFI BOT es gratuito para usuarios finales y se monetiza mediante publicidad.
HU-17 no implementa licencias, planes ni restricciones comerciales de acceso.
===============================================================================
*/

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

DO $$
BEGIN
    IF to_regclass('alfi.usuarios') IS NULL
       OR to_regclass('alfi.roles') IS NULL THEN
        RAISE EXCEPTION
            'AFB-333: faltan alfi.usuarios o alfi.roles. No se realizó ningún cambio.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM alfi.roles
        WHERE nombre = 'usuario'
    ) THEN
        RAISE EXCEPTION
            'AFB-333: no existe el rol funcional usuario requerido para migrar analista.';
    END IF;
END
$$;

-- 1. Migrar usuarios históricos analista -> usuario.
WITH roles AS (
    SELECT rol_id AS analista_id
    FROM alfi.roles
    WHERE nombre = 'analista'
),
destino AS (
    SELECT rol_id AS usuario_id
    FROM alfi.roles
    WHERE nombre = 'usuario'
)
UPDATE alfi.usuarios u
SET
    rol_id = d.usuario_id,
    fecha_actualizacion = CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN destino d
WHERE u.rol_id = r.analista_id;

-- 2. Retirar el rol funcional obsoleto.
DELETE FROM alfi.roles
WHERE nombre = 'analista';

-- 3. Validar catálogo final e integridad referencial antes de COMMIT.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM alfi.roles
        WHERE nombre = 'analista'
    ) THEN
        RAISE EXCEPTION
            'AFB-333: el rol analista continúa en el catálogo.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM alfi.usuarios u
        LEFT JOIN alfi.roles r
            ON r.rol_id = u.rol_id
        WHERE r.rol_id IS NULL
           OR r.nombre NOT IN ('administrador', 'auditor', 'usuario')
    ) THEN
        RAISE EXCEPTION
            'AFB-333: existen usuarios vinculados a roles fuera del catálogo final.';
    END IF;
END
$$;

COMMIT;

-- 4. Evidencia reproducible.
SELECT rol_id, nombre
FROM alfi.roles
ORDER BY rol_id;

SELECT
    r.nombre AS rol,
    COUNT(*) AS usuarios
FROM alfi.usuarios u
INNER JOIN alfi.roles r
    ON r.rol_id = u.rol_id
GROUP BY r.nombre
ORDER BY r.nombre;

-- FIN AFB-333
