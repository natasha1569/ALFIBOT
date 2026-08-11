# SQL de instalación de ALFI BOT

El archivo `alfi_bot_db_final_instalacion_completa.sql` es el script canónico de instalación de la base de datos del proyecto.

## Uso

1. Crear la base `alfi_bot_db_final` en PostgreSQL.
2. Conectarse a esa base desde pgAdmin con un usuario que tenga privilegio `CREATEROLE`.
3. Abrir Query Tool.
4. Ejecutar el archivo completo.

## Importante

El script es reejecutable, pero comienza eliminando y reconstruyendo únicamente el esquema `alfi`. Por lo tanto, volver a ejecutarlo elimina los datos actuales del esquema.

La tabla `alfi.usuarios` guarda únicamente hashes bcrypt en `password_hash`. El rol de un usuario registrado se asigna internamente y no proviene del formulario del frontend.

## Base existente

Si la base ya está instalada y se desea conservar el historial, no se debe volver a ejecutar el instalador completo. Ejecutar en su lugar:

`migrations/20260810_afb309_registro_usuarios.sql`

Esa migración agrega el soporte de registro sin eliminar el esquema `alfi`.


## Documentación del proyecto

La documentación técnica y funcional de ALFI BOT se mantiene en Confluence.

Incluye:
- Descripción y problemática.
- Objetivo y alcance.
- Arquitectura del sistema.
- Tecnologías utilizadas.
- Funcionalidades implementadas.
- Metodología Scrum.
- Estado actual del proyecto.

