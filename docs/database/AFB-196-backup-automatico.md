# AFB-196 - Respaldo automático de PostgreSQL

## Implementación

Se configuró la ejecución automática de respaldos de la base de datos PostgreSQL utilizada por ALFI BOT.

El respaldo utiliza los scripts ubicados en:

- `backend/scripts/database-backup/backup.ps1`
- `backend/scripts/database-backup/setup-scheduled-backup.ps1`

## Configuración

La tarea programada creada en Windows se denomina:

`ALFIBOT PostgreSQL Backup`

La ejecución está configurada con frecuencia diaria a las 02:00.

El sistema utiliza `pg_dump` para generar el respaldo de la base de datos.

Los archivos de respaldo se almacenan en el directorio local de backups de ALFI BOT y se mantiene una retención de 14 días.

## Verificación

Se ejecutó manualmente el script de respaldo y se obtuvo el mensaje:

`AFB-189 BACKUP OK`

También se verificó la tarea automática mediante PowerShell:

`Get-ScheduledTask | Where-Object {$_.TaskName -like "*ALFI*"}`

Resultado:

- Tarea: `ALFIBOT PostgreSQL Backup`
- Estado: `Ready`
- Frecuencia: diaria a las 02:00

## Resultado

El mecanismo de respaldo automático quedó configurado y operativo para la base de datos PostgreSQL de ALFI BOT.