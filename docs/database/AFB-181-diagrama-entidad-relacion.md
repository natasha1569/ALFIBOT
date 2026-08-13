# AFB-181 — Elaborar el diagrama entidad-relación

## Objetivo
Representar visualmente las entidades, atributos principales, claves primarias, claves foráneas y cardinalidades del modelo de ALFI BOT.

## Diagrama ER

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : asigna
    USUARIOS ||--o{ ANALISIS : realiza
    ANALISIS ||--o{ SENALES_ALERTA : genera
    ANALISIS ||--o{ RECOMENDACIONES : genera
    USUARIOS ||--o{ USUARIO_INTERESES_FINANCIEROS : posee
    INTERESES_FINANCIEROS ||--o{ USUARIO_INTERESES_FINANCIEROS : clasifica

    ROLES {
        int rol_id PK
        varchar nombre
        varchar descripcion
    }

    USUARIOS {
        int usuario_id PK
        int rol_id FK
        varchar nombre
        varchar correo
        varchar password_hash
        boolean activo
        timestamp fecha_registro
        varchar celular
        timestamp fecha_actualizacion
        varchar provincia
        varchar rango_edad
        boolean terminos_aceptados
        timestamp terminos_aceptados_en
        varchar terminos_version
    }

    ANALISIS {
        int analisis_id PK
        int usuario_id FK
        varchar tipo
        text contenido
        varchar vista_previa
        varchar nivel_riesgo
        text resumen
        boolean permitido
        timestamp fecha_creacion
        varchar categoria_fraude
    }

    SENALES_ALERTA {
        int senal_id PK
        int analisis_id FK
        varchar descripcion
        int orden
    }

    RECOMENDACIONES {
        int recomendacion_id PK
        int analisis_id FK
        varchar descripcion
        int orden
    }

    AUDITORIA {
        bigint auditoria_id PK
        varchar tabla
        varchar operacion
        varchar registro_id
        varchar usuario_bd
        timestamp fecha_operacion
        jsonb datos_anteriores
        jsonb datos_nuevos
    }

    INTERESES_FINANCIEROS {
        int interes_id PK
        varchar codigo
        varchar nombre
        boolean activo
        timestamp fecha_creacion
    }

    USUARIO_INTERESES_FINANCIEROS {
        int usuario_id PK, FK
        int interes_id PK, FK
        timestamp fecha_registro
    }
```

## Cardinalidades

- `roles` 1 — N `usuarios`
- `usuarios` 1 — N `analisis`
- `analisis` 1 — N `senales_alerta`
- `analisis` 1 — N `recomendaciones`
- `usuarios` N — M `intereses_financieros`, resuelta mediante `usuario_intereses_financieros`

## Justificación de relaciones

### Roles — Usuarios
Un rol puede asignarse a varios usuarios, pero cada usuario mantiene un rol dentro del sistema.

### Usuarios — Análisis
Un usuario puede realizar múltiples análisis. Cada análisis pertenece al usuario que lo generó.

### Análisis — Señales de alerta
Un análisis puede detectar cero o varias señales de alerta. Cada señal corresponde a un solo análisis.

### Análisis — Recomendaciones
Un análisis puede generar varias recomendaciones preventivas. Cada recomendación pertenece a un análisis.

### Usuarios — Intereses financieros
Un usuario puede seleccionar varios intereses y un mismo interés puede pertenecer a varios usuarios. Por ello se utiliza la tabla intermedia `usuario_intereses_financieros`.

### Auditoría
`auditoria` registra cambios realizados sobre información importante. No utiliza una FK directa hacia una sola entidad porque puede registrar operaciones de distintas tablas mediante los campos `tabla` y `registro_id`.

## Resultado
El diagrama representa el modelo relacional implementado en PostgreSQL para ALFI BOT e incluye las entidades, PK, FK y cardinalidades requeridas por AFB-181.
