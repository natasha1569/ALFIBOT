# SQL de ALFI BOT

Este directorio contiene el instalador canónico de PostgreSQL y scripts históricos/especializados del proyecto.

## Instalación oficial — T-24 / AFB-383

La fuente única del modelo PostgreSQL es:

`backend/sql/ALFI_BOT_DATABASE.sql`

El instalador canónico crea el esquema `alfi`, tablas, restricciones, índices, datos semilla indispensables, funciones, triggers de auditoría, vistas BI y roles PostgreSQL RBAC. Su ejecución fue validada sobre una base vacía y sobre una base ya instalada, conservando los datos de negocio y sin duplicar semillas.

### Opción recomendada: instalación asistida

Desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-setup\setup-database.ps1
```

El script:

1. Lee la configuración PostgreSQL desde `backend/.env`.
2. Detecta `psql` y `createdb`.
3. Comprueba la conexión al servidor.
4. Crea la base indicada por `DB_NAME` si todavía no existe.
5. Conserva la base y sus datos cuando ya existe.
6. Ejecuta `ALFI_BOT_DATABASE.sql` con `ON_ERROR_STOP=1`.
7. Verifica tablas, vistas, roles funcionales y roles PostgreSQL RBAC.
8. Finaliza con `ALFI BOT DATABASE SETUP OK` únicamente si la instalación quedó válida.

Para instalar o probar sobre otra base sin modificar `backend/.env`:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-setup\setup-database.ps1 -DatabaseName alfi_bot_prueba
```

### Opción manual con pgAdmin

También puede ejecutarse directamente `backend/sql/ALFI_BOT_DATABASE.sql` desde Query Tool conectado a la base objetivo con un usuario PostgreSQL administrador.

El SQL canónico es transaccional y contiene sus propias comprobaciones estructurales. No se almacenan contraseñas ni secretos en SQL versionado y no se crean cuentas PostgreSQL `LOGIN`.

## Scripts históricos y especializados

Los archivos `AFB-*.sql` se conservan como trazabilidad de actividades y migraciones anteriores. No son necesarios para una instalación limpia cuando se utiliza `ALFI_BOT_DATABASE.sql`.

## Seguridad — AFB-371

`AFB-371-seguridad.sql` conserva consultas de inspección y evidencia del Plan de Políticas de Seguridad en Bases de Datos. No reemplaza al instalador canónico.

La matriz de evidencia relacionada se encuentra en:

`docs/security/AFB-370-evidencias-rbac-auditoria-respaldos.md`

La documentación técnica y funcional general del proyecto se mantiene también en Confluence.
