-- ============================================================
-- ALFI BOT - INSTALACIÓN COMPLETA Y REEJECUTABLE
-- Base esperada: alfi_bot_db_final
-- Ejecutar con postgres o un usuario con privilegio CREATEROLE.
-- IMPORTANTE: este script elimina y reconstruye únicamente el esquema alfi.
-- ============================================================

BEGIN;

DO $$
BEGIN
    IF current_database() <> 'alfi_bot_db_final' THEN
        RAISE EXCEPTION
            'Base incorrecta: conectado a %, debe conectarse a alfi_bot_db_final',
            current_database();
    END IF;
END
$$;

-- pgcrypto se utiliza únicamente para generar de forma segura
-- la contraseña del usuario inicial de demostración.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Permite volver a ejecutar todo desde cero sin errores por objetos existentes.
DROP SCHEMA IF EXISTS alfi CASCADE;
CREATE SCHEMA alfi AUTHORIZATION CURRENT_USER;

SET search_path TO alfi, public;

-- ============================================================
-- 1. CREAR EL ESQUEMA
-- ============================================================


-- ============================================================
-- 2. TABLA ROLES
-- ============================================================

CREATE TABLE roles (
    rol_id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NOT NULL,

    CONSTRAINT chk_rol_nombre
        CHECK (char_length(trim(nombre)) >= 3)
);


INSERT INTO roles (
    nombre,
    descripcion
)
VALUES
(
    'administrador',
    'Administra usuarios, análisis y configuraciones'
),
(
    'analista',
    'Realiza análisis de posibles fraudes'
),
(
    'auditor',
    'Consulta auditoría y reportes'
),
(
    'usuario',
    'Usuario registrado de ALFI BOT'
);


-- ============================================================
-- 3. TABLA USUARIOS
-- ============================================================

CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    rol_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    celular VARCHAR(10) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(rol_id),

    CONSTRAINT chk_usuario_nombre
        CHECK (char_length(trim(nombre)) >= 3),

    CONSTRAINT chk_usuario_correo
        CHECK (
            correo = lower(trim(correo))
            AND correo ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        ),

    CONSTRAINT chk_usuario_celular
        CHECK (
            celular ~ '^09[0-9]{8}$'
        ),

    CONSTRAINT chk_usuario_password_hash
        CHECK (
            password_hash ~ '^\$2[aby]\$[0-9]{2}\$'
        )
);


CREATE UNIQUE INDEX uq_usuarios_correo_normalizado
ON usuarios ((lower(trim(correo))));


CREATE FUNCTION fn_actualizar_fecha_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_actualizar_fecha_usuario
BEFORE UPDATE
ON usuarios
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_usuario();


-- Usuario inicial para conservar el acceso de demostración existente.
-- PostgreSQL genera un hash bcrypt; la contraseña nunca se almacena en texto plano.
INSERT INTO usuarios (
    rol_id,
    nombre,
    correo,
    celular,
    password_hash
)
VALUES (
    1,
    'Romel Santiago Arévalo Vásquez',
    'rsarevalo@puce.edu.ec',
    '0999999999',
    crypt('12345678', gen_salt('bf', 12))
);


-- ============================================================
-- 4. TABLA ANÁLISIS
-- ============================================================

CREATE TABLE analisis (
    analisis_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    contenido TEXT NOT NULL,
    vista_previa VARCHAR(250),
    nivel_riesgo VARCHAR(10) NOT NULL,
    resumen TEXT NOT NULL,
    permitido BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analisis_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(usuario_id),

    CONSTRAINT chk_analisis_tipo
        CHECK (
            tipo IN ('text', 'link', 'image')
        ),

    CONSTRAINT chk_analisis_riesgo
        CHECK (
            nivel_riesgo IN ('bajo', 'medio', 'alto')
        ),

    CONSTRAINT chk_analisis_contenido
        CHECK (
            char_length(trim(contenido)) > 0
        ),

    CONSTRAINT chk_analisis_resumen
        CHECK (
            char_length(trim(resumen)) >= 5
        ),

    CONSTRAINT chk_longitud_texto
        CHECK (
            tipo <> 'text'
            OR char_length(contenido) <= 5000
        ),

    CONSTRAINT chk_longitud_link
        CHECK (
            tipo <> 'link'
            OR char_length(contenido) <= 2000
        ),

    CONSTRAINT chk_formato_link
        CHECK (
            tipo <> 'link'
            OR contenido ~* '^https?://'
        )
);


INSERT INTO analisis (
    usuario_id,
    tipo,
    contenido,
    vista_previa,
    nivel_riesgo,
    resumen
)
VALUES (
    1,
    'text',
    'Invierta 100 dólares y reciba una ganancia del 50 por ciento en una semana.',
    'Oferta de inversión con ganancia rápida',
    'alto',
    'El contenido presenta promesas de rentabilidad exagerada.'
);


-- ============================================================
-- 5. TABLA SEÑALES DE ALERTA
-- ============================================================

CREATE TABLE senales_alerta (
    senal_id SERIAL PRIMARY KEY,
    analisis_id INTEGER NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    orden INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT fk_senal_analisis
        FOREIGN KEY (analisis_id)
        REFERENCES analisis(analisis_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_senal_descripcion
        CHECK (
            char_length(trim(descripcion)) >= 5
        ),

    CONSTRAINT chk_senal_orden
        CHECK (
            orden > 0
        ),

    CONSTRAINT uq_senal_orden
        UNIQUE (analisis_id, orden)
);


INSERT INTO senales_alerta (
    analisis_id,
    descripcion,
    orden
)
VALUES
(
    1,
    'Promesa de rentabilidad demasiado alta',
    1
),
(
    1,
    'Solicitud de inversión inmediata',
    2
),
(
    1,
    'Falta de información sobre la empresa',
    3
);


-- ============================================================
-- 6. TABLA RECOMENDACIONES
-- ============================================================

CREATE TABLE recomendaciones (
    recomendacion_id SERIAL PRIMARY KEY,
    analisis_id INTEGER NOT NULL,
    descripcion VARCHAR(400) NOT NULL,
    orden INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT fk_recomendacion_analisis
        FOREIGN KEY (analisis_id)
        REFERENCES analisis(analisis_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_recomendacion_descripcion
        CHECK (
            char_length(trim(descripcion)) >= 5
        ),

    CONSTRAINT chk_recomendacion_orden
        CHECK (
            orden > 0
        ),

    CONSTRAINT uq_recomendacion_orden
        UNIQUE (analisis_id, orden)
);


INSERT INTO recomendaciones (
    analisis_id,
    descripcion,
    orden
)
VALUES
(
    1,
    'No realizar depósitos hasta verificar la empresa.',
    1
),
(
    1,
    'Consultar si la empresa está registrada legalmente.',
    2
),
(
    1,
    'No entregar información bancaria o personal.',
    3
);


-- ============================================================
-- 7. TABLA CENTRAL DE AUDITORÍA
-- ============================================================

CREATE TABLE auditoria (
    auditoria_id BIGSERIAL PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    registro_id VARCHAR(50) NOT NULL,
    usuario_bd VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,
    fecha_operacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSONB,
    datos_nuevos JSONB,

    CONSTRAINT chk_auditoria_operacion
        CHECK (
            operacion IN ('INSERT', 'UPDATE', 'DELETE')
        )
);


-- ============================================================
-- 8. FUNCIÓN CENTRAL DE AUDITORÍA
-- ============================================================

CREATE FUNCTION fn_registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = alfi, public
AS $$
DECLARE
    id_registro VARCHAR(50);
BEGIN

    IF TG_OP = 'INSERT' THEN

        id_registro := to_jsonb(NEW) ->> TG_ARGV[0];

        INSERT INTO auditoria (
            tabla,
            operacion,
            registro_id,
            usuario_bd,
            fecha_operacion,
            datos_nuevos
        )
        VALUES (
            TG_TABLE_NAME,
            TG_OP,
            id_registro,
            SESSION_USER,
            CURRENT_TIMESTAMP,
            CASE
                WHEN TG_TABLE_NAME = 'usuarios' THEN to_jsonb(NEW) - 'password_hash'
                ELSE to_jsonb(NEW)
            END
        );

        RETURN NEW;


    ELSIF TG_OP = 'UPDATE' THEN

        id_registro := to_jsonb(NEW) ->> TG_ARGV[0];

        INSERT INTO auditoria (
            tabla,
            operacion,
            registro_id,
            usuario_bd,
            fecha_operacion,
            datos_anteriores,
            datos_nuevos
        )
        VALUES (
            TG_TABLE_NAME,
            TG_OP,
            id_registro,
            SESSION_USER,
            CURRENT_TIMESTAMP,
            CASE
                WHEN TG_TABLE_NAME = 'usuarios' THEN to_jsonb(OLD) - 'password_hash'
                ELSE to_jsonb(OLD)
            END,
            CASE
                WHEN TG_TABLE_NAME = 'usuarios' THEN to_jsonb(NEW) - 'password_hash'
                ELSE to_jsonb(NEW)
            END
        );

        RETURN NEW;


    ELSIF TG_OP = 'DELETE' THEN

        id_registro := to_jsonb(OLD) ->> TG_ARGV[0];

        INSERT INTO auditoria (
            tabla,
            operacion,
            registro_id,
            usuario_bd,
            fecha_operacion,
            datos_anteriores
        )
        VALUES (
            TG_TABLE_NAME,
            TG_OP,
            id_registro,
            SESSION_USER,
            CURRENT_TIMESTAMP,
            CASE
                WHEN TG_TABLE_NAME = 'usuarios' THEN to_jsonb(OLD) - 'password_hash'
                ELSE to_jsonb(OLD)
            END
        );

        RETURN OLD;

    END IF;

    RETURN NULL;
END;
$$;


-- ============================================================
-- 9. TRIGGERS DE AUDITORÍA EN TRES ENTIDADES
-- ============================================================

CREATE TRIGGER trg_auditoria_usuarios
AFTER INSERT OR UPDATE OR DELETE
ON usuarios
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_auditoria('usuario_id');


CREATE TRIGGER trg_auditoria_analisis
AFTER INSERT OR UPDATE OR DELETE
ON analisis
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_auditoria('analisis_id');


CREATE TRIGGER trg_auditoria_recomendaciones
AFTER INSERT OR UPDATE OR DELETE
ON recomendaciones
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_auditoria('recomendacion_id');


-- ============================================================
-- 10. VISTA: REPORTE MENSUAL DE RIESGOS
-- ============================================================

CREATE VIEW vw_reporte_riesgos_mensual AS
SELECT
    DATE_TRUNC('month', a.fecha_creacion)::DATE AS mes,
    a.nivel_riesgo,

    COUNT(DISTINCT a.analisis_id)
        AS total_analisis,

    COUNT(DISTINCT s.senal_id)
        AS total_senales,

    COUNT(DISTINCT r.recomendacion_id)
        AS total_recomendaciones,

    ROUND(
        COUNT(DISTINCT a.analisis_id) * 100.0
        /
        SUM(COUNT(DISTINCT a.analisis_id))
        OVER (
            PARTITION BY DATE_TRUNC(
                'month',
                a.fecha_creacion
            )
        ),
        2
    ) AS porcentaje_mensual

FROM analisis a

LEFT JOIN senales_alerta s
    ON a.analisis_id = s.analisis_id

LEFT JOIN recomendaciones r
    ON a.analisis_id = r.analisis_id

GROUP BY
    DATE_TRUNC('month', a.fecha_creacion),
    a.nivel_riesgo;


-- ============================================================
-- 11. VISTA: ACTIVIDAD DE USUARIOS
-- ============================================================

CREATE VIEW vw_reporte_actividad_usuarios AS
SELECT
    u.usuario_id,
    u.nombre AS usuario,
    u.correo,
    u.celular,
    ro.nombre AS rol,

    COUNT(DISTINCT a.analisis_id)
        AS total_analisis,

    COUNT(DISTINCT a.analisis_id)
        FILTER (
            WHERE a.nivel_riesgo = 'alto'
        ) AS riesgos_altos,

    COUNT(DISTINCT a.analisis_id)
        FILTER (
            WHERE a.nivel_riesgo = 'medio'
        ) AS riesgos_medios,

    COUNT(DISTINCT a.analisis_id)
        FILTER (
            WHERE a.nivel_riesgo = 'bajo'
        ) AS riesgos_bajos,

    COUNT(DISTINCT s.senal_id)
        AS total_senales,

    COUNT(DISTINCT rec.recomendacion_id)
        AS total_recomendaciones,

    MAX(a.fecha_creacion)
        AS ultimo_analisis

FROM usuarios u

INNER JOIN roles ro
    ON u.rol_id = ro.rol_id

LEFT JOIN analisis a
    ON u.usuario_id = a.usuario_id

LEFT JOIN senales_alerta s
    ON a.analisis_id = s.analisis_id

LEFT JOIN recomendaciones rec
    ON a.analisis_id = rec.analisis_id

GROUP BY
    u.usuario_id,
    u.nombre,
    u.correo,
    u.celular,
    ro.nombre;


-- ============================================================
-- 12. CREAR ROLES RBAC NUEVOS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_admin_final') THEN
        CREATE ROLE rol_alfi_admin_final NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_analista_final') THEN
        CREATE ROLE rol_alfi_analista_final NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_alfi_auditor_final') THEN
        CREATE ROLE rol_alfi_auditor_final NOLOGIN;
    END IF;
END
$$;


-- Retirar permisos públicos del esquema
REVOKE ALL ON SCHEMA alfi FROM PUBLIC;


-- Autorizar uso del esquema
GRANT USAGE ON SCHEMA alfi
TO
    rol_alfi_admin_final,
    rol_alfi_analista_final,
    rol_alfi_auditor_final;


-- ============================================================
-- 13. PERMISOS DEL ADMINISTRADOR
-- ============================================================

GRANT ALL PRIVILEGES
ON ALL TABLES IN SCHEMA alfi
TO rol_alfi_admin_final;


GRANT ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA alfi
TO rol_alfi_admin_final;


GRANT EXECUTE
ON FUNCTION alfi.fn_registrar_auditoria()
TO rol_alfi_admin_final;


-- Permisos predeterminados para objetos futuros creados por el ejecutor.
ALTER DEFAULT PRIVILEGES IN SCHEMA alfi
GRANT ALL PRIVILEGES ON TABLES TO rol_alfi_admin_final;

ALTER DEFAULT PRIVILEGES IN SCHEMA alfi
GRANT ALL PRIVILEGES ON SEQUENCES TO rol_alfi_admin_final;


-- ============================================================
-- 14. PERMISOS DEL ANALISTA
-- ============================================================

GRANT SELECT
ON
    alfi.roles,
    alfi.usuarios
TO rol_alfi_analista_final;


GRANT SELECT, INSERT, UPDATE
ON
    alfi.analisis,
    alfi.senales_alerta,
    alfi.recomendaciones
TO rol_alfi_analista_final;


GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA alfi
TO rol_alfi_analista_final;


GRANT SELECT
ON
    alfi.vw_reporte_riesgos_mensual,
    alfi.vw_reporte_actividad_usuarios
TO rol_alfi_analista_final;


-- ============================================================
-- 15. PERMISOS DEL AUDITOR
-- ============================================================

GRANT SELECT
ON
    alfi.auditoria,
    alfi.vw_reporte_riesgos_mensual,
    alfi.vw_reporte_actividad_usuarios
TO rol_alfi_auditor_final;


-- ============================================================
-- 16. CREAR USUARIOS DE POSTGRESQL NUEVOS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_admin_final') THEN
        CREATE USER alfi_admin_final WITH PASSWORD 'Admin_Alfi_2026!';
    ELSE
        ALTER ROLE alfi_admin_final LOGIN PASSWORD 'Admin_Alfi_2026!';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_analista_final') THEN
        CREATE USER alfi_analista_final WITH PASSWORD 'Analista_Alfi_2026!';
    ELSE
        ALTER ROLE alfi_analista_final LOGIN PASSWORD 'Analista_Alfi_2026!';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alfi_auditor_final') THEN
        CREATE USER alfi_auditor_final WITH PASSWORD 'Auditor_Alfi_2026!';
    ELSE
        ALTER ROLE alfi_auditor_final LOGIN PASSWORD 'Auditor_Alfi_2026!';
    END IF;
END
$$;


-- Asignar roles a usuarios

GRANT rol_alfi_admin_final
TO alfi_admin_final;


GRANT rol_alfi_analista_final
TO alfi_analista_final;


GRANT rol_alfi_auditor_final
TO alfi_auditor_final;


-- Permitir conexión a la base

GRANT CONNECT
ON DATABASE alfi_bot_db_final
TO
    alfi_admin_final,
    alfi_analista_final,
    alfi_auditor_final;


-- ============================================================
-- 17. PRUEBAS DE AUDITORÍA
-- ============================================================

-- INSERT en análisis

INSERT INTO analisis (
    usuario_id,
    tipo,
    contenido,
    vista_previa,
    nivel_riesgo,
    resumen
)
VALUES (
    1,
    'link',
    'https://ejemplo.com/inversion',
    'Enlace de inversión sospechosa',
    'medio',
    'El enlace debe verificarse antes de ingresar información.'
);


-- UPDATE en análisis

UPDATE analisis
SET nivel_riesgo = 'alto'
WHERE analisis_id = 2;


-- INSERT en recomendaciones

INSERT INTO recomendaciones (
    analisis_id,
    descripcion,
    orden
)
VALUES (
    2,
    'No ingresar información personal en el enlace.',
    1
);


-- UPDATE en usuarios

UPDATE usuarios
SET nombre = 'Administrador ALFI Actualizado'
WHERE usuario_id = 1;


-- INSERT temporal para comprobar DELETE

INSERT INTO recomendaciones (
    analisis_id,
    descripcion,
    orden
)
VALUES (
    2,
    'Recomendación temporal para probar eliminación',
    99
);


-- DELETE de la recomendación temporal

DELETE FROM recomendaciones
WHERE recomendacion_id = (
    SELECT MAX(recomendacion_id)
    FROM recomendaciones
);


COMMIT;


-- ============================================================
-- 18. CONSULTAR AUDITORÍA
-- ============================================================

SELECT
    auditoria_id,
    tabla,
    operacion,
    registro_id,
    usuario_bd,
    fecha_operacion,
    datos_anteriores,
    datos_nuevos
FROM auditoria
ORDER BY auditoria_id DESC;


-- ============================================================
-- 19. CONSULTAR LOS DOS REPORTES
-- ============================================================

SELECT *
FROM vw_reporte_riesgos_mensual;


SELECT *
FROM vw_reporte_actividad_usuarios;


-- ============================================================
-- 20. VERIFICAR TABLAS
-- ============================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'alfi'
ORDER BY table_name;


-- ============================================================
-- 21. VERIFICAR VISTAS
-- ============================================================

SELECT table_name
FROM information_schema.views
WHERE table_schema = 'alfi'
ORDER BY table_name;


-- ============================================================
-- 22. VERIFICAR FUNCIÓN DE AUDITORÍA
-- ============================================================

SELECT
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'alfi'
AND routine_name = 'fn_registrar_auditoria';


-- ============================================================
-- 23. VERIFICAR TRIGGERS
-- ============================================================

SELECT
    trigger_name,
    event_object_table,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'alfi'
ORDER BY event_object_table, trigger_name;


-- ============================================================
-- 24. VERIFICAR ROLES Y USUARIOS
-- ============================================================

SELECT
    rolname,
    rolcanlogin,
    rolsuper
FROM pg_roles
WHERE rolname IN (
    'rol_alfi_admin_final',
    'rol_alfi_analista_final',
    'rol_alfi_auditor_final',
    'alfi_admin_final',
    'alfi_analista_final',
    'alfi_auditor_final'
)
ORDER BY rolname;


SELECT
    current_database() AS base_actual,
    current_user AS usuario_ejecutor,
    'Instalación ALFI completada correctamente' AS resultado;


-- ============================================================
-- FIN DEL SCRIPT PRINCIPAL
-- ============================================================


-- ============================================================
-- PRUEBA DE RESTRICCIÓN CHECK
-- NO SE EJECUTA CON EL SCRIPT PRINCIPAL
-- QUITA /* Y */ PARA PROBARLA POR SEPARADO
-- ============================================================

/*

INSERT INTO alfi.analisis (
    usuario_id,
    tipo,
    contenido,
    nivel_riesgo,
    resumen
)
VALUES (
    1,
    'video',
    'Contenido inválido',
    'extremo',
    'Esta prueba debe fallar.'
);

*/