# SQL de ALFI BOT

Este directorio contiene el instalador canónico de PostgreSQL y scripts históricos/especializados del proyecto.

## Instalación oficial — T-22 / AFB-318

Para una instalación nueva, el único archivo que debe ejecutarse manualmente en pgAdmin Query Tool es:

`ALFI_BOT_DATABASE.sql`

Flujo recomendado para cada integrante del equipo:

1. Clonar el repositorio.
2. Ejecutar `npm install` en `backend` y `frontend`.
3. Crear una base PostgreSQL vacía, por ejemplo `alfi_bot_db`.
4. Abrir Query Tool conectado a esa base con un usuario PostgreSQL administrador.
5. Abrir `backend/sql/ALFI_BOT_DATABASE.sql`.
6. Ejecutar el archivo completo.
7. Configurar `backend/.env` para apuntar a la base creada.
8. Ejecutar `npm run dev` en backend.
9. Ejecutar `npm run dev` en frontend.

El instalador crea el esquema `alfi`, tablas, restricciones, índices, datos semilla indispensables, funciones, triggers de auditoría, vistas BI y roles PostgreSQL RBAC. También incorpora de forma idempotente las ampliaciones conocidas del modelo para una instalación existente, sin eliminar datos de negocio.

No se almacenan contraseñas ni secretos en SQL versionado y no se crean cuentas PostgreSQL `LOGIN`.

## Scripts históricos y especializados

Los archivos `AFB-*.sql` se conservan como trazabilidad de actividades y migraciones anteriores. No son necesarios para una instalación limpia cuando se utiliza `ALFI_BOT_DATABASE.sql`.

## Seguridad — AFB-371

`AFB-371-seguridad.sql` conserva consultas de inspección y evidencia del Plan de Políticas de Seguridad en Bases de Datos. No reemplaza al instalador canónico.

La matriz de evidencia relacionada se encuentra en:

`docs/security/AFB-370-evidencias-rbac-auditoria-respaldos.md`

La documentación técnica y funcional general del proyecto se mantiene también en Confluence.
