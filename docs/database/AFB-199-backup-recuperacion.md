# AFB-199 — Procedimiento de respaldo y recuperación

## Proyecto: ALFI BOT

### Objetivo
Documentar el procedimiento de respaldo y recuperación de la base de datos PostgreSQL utilizada por ALFI BOT, con el fin de disponer de una copia recuperable ante pérdida o falla de información.

## Estrategia de respaldo

- Motor de base de datos: PostgreSQL.
- Base de datos: `alfi_bot_db_final`.
- Tipo de respaldo: respaldo completo.
- Periodicidad definida: un respaldo diario.
- Retención propuesta: conservar los últimos 7 respaldos.
- Ubicación utilizada durante la prueba: `C:\Backups_ALFI`.
- Los respaldos no deben almacenarse en el repositorio Git ni junto con credenciales del sistema.

## RPO y RTO

- **RPO: 24 horas.** La pérdida máxima aceptada corresponde al intervalo entre los respaldos diarios.
- **RTO: 2 horas.** Es el tiempo objetivo establecido para identificar la falla, restaurar el último respaldo válido, verificar los datos y restablecer el servicio.

## Procedimiento de respaldo

El respaldo fue generado mediante `pg_dump`:

```bat
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -d alfi_bot_db_final -F c -f "C:\Backups_ALFI\alfi_bot_backup.backup"
```

Como resultado se generó correctamente el archivo:

```text
C:\Backups_ALFI\alfi_bot_backup.backup
```

## Procedimiento de recuperación

### 1. Crear una base de datos para la prueba

```sql
CREATE DATABASE alfi_bot_restore_test;
```

### 2. Restaurar el respaldo

```bat
"C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" -U postgres -d alfi_bot_restore_test "C:\Backups_ALFI\alfi_bot_backup.backup"
```

### 3. Verificar las tablas restauradas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'alfi'
ORDER BY table_name;
```

Durante la comprobación se verificó la recuperación de los objetos del esquema `alfi`, incluyendo las tablas de usuarios, análisis, auditoría, recomendaciones, roles y señales de alerta.

### 4. Verificar los datos

```sql
SELECT COUNT(*) AS usuarios
FROM alfi.usuarios;

SELECT COUNT(*) AS analisis
FROM alfi.analisis;
```

La prueba permitió comprobar que los registros fueron recuperados en la base restaurada.

## Responsables

El equipo de desarrollo de ALFI BOT es responsable de generar y verificar los respaldos y realizar las pruebas de recuperación. Estas operaciones deben ser realizadas únicamente por integrantes autorizados con acceso administrativo a PostgreSQL.

## Criterios de continuidad

- Comprobar que el archivo de respaldo se genere correctamente.
- Realizar pruebas de restauración antes de considerar válido un respaldo.
- Confirmar la existencia del esquema `alfi`, sus tablas y sus registros.
- Realizar las pruebas sobre una base independiente para no modificar la base principal.
- Mantener los archivos de respaldo fuera del repositorio Git.

## Resultado de la prueba

El procedimiento fue comprobado en el entorno del proyecto. Se generó el archivo `alfi_bot_backup.backup`, se creó la base `alfi_bot_restore_test`, se restauró el respaldo y se verificaron las tablas y registros recuperados.

## Pendiente

Como mejora para un entorno de producción queda pendiente automatizar la ejecución diaria del respaldo y mantener copias externas de acuerdo con la política de retención establecida.
