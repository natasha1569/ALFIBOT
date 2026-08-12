# AFB-189 — Estrategia de respaldo y restauración

## Objetivo

Definir una estrategia reproducible para respaldar y restaurar la base PostgreSQL de ALFI BOT sin versionar contraseñas, dumps ni credenciales.

## Objetivos de continuidad

- **RPO objetivo:** máximo 24 horas.
- **RTO objetivo:** máximo 2 horas.
- **Frecuencia de respaldo:** diaria.
- **Retención local predeterminada:** 14 días.
- **Formato:** `pg_dump` en formato custom (`.dump`).
- **Destino predeterminado:** `%LOCALAPPDATA%\ALFIBOT\backups`.

El RPO de 24 horas se alinea con una copia diaria. El RTO de 2 horas es el objetivo operativo para disponer de PostgreSQL, crear una base limpia, restaurar el dump y ejecutar las validaciones de integridad previstas.

## Seguridad

Los scripts leen `backend/.env` en tiempo de ejecución. Ninguna contraseña se imprime ni se escribe en los archivos versionados. `PGPASSWORD` se establece solo durante la ejecución del comando PostgreSQL y se restaura/elimina al terminar.

Los respaldos se generan fuera del repositorio para evitar que un dump con información real termine accidentalmente en Git.

## Generar un respaldo manual

Desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-backup\backup.ps1
```

Un respaldo válido debe finalizar con:

```text
AFB-189 BACKUP OK
```

El script verifica:

1. que `pg_dump` termine correctamente;
2. que el archivo exista;
3. que su tamaño sea mayor a cero;
4. que `pg_restore --list` pueda leer su catálogo;
5. que se aplique la retención configurada.

## Programar el respaldo diario

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-backup\setup-scheduled-backup.ps1
```

La hora predeterminada es 02:00. Para establecer otra hora:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-backup\setup-scheduled-backup.ps1 -DailyAt "23:00"
```

Después puede verificarse en **Programador de tareas de Windows** la tarea `ALFIBOT PostgreSQL Backup`.

## Prueba de restauración

La restauración se realiza únicamente sobre una base cuyo nombre termine en `_restore_test`. El script rechaza expresamente el nombre de la base configurada en `DB_NAME`.

Ejemplo:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-backup\restore-test.ps1 `
  -BackupFile "$env:LOCALAPPDATA\ALFIBOT\backups\NOMBRE_DEL_BACKUP.dump"
```

El script:

1. finaliza conexiones únicamente contra la base de prueba;
2. elimina la base de prueba previa si existe;
3. crea una base limpia;
4. ejecuta `pg_restore --exit-on-error`;
5. compara origen y restauración para cantidad de tablas, vistas y restricciones del esquema `alfi`.

Una prueba satisfactoria termina con:

```text
AFB-189 RESTORE TEST OK
```

## Evidencia académica

La implementación en el repositorio deja preparado el procedimiento reproducible. La evidencia de ejecución debe generarse sobre el entorno usado para la demostración.

Capturas recomendadas:

- salida `AFB-189 BACKUP OK`;
- archivo `.dump` creado y su tamaño;
- tarea `ALFIBOT PostgreSQL Backup` en el Programador de tareas;
- ejecución de `restore-test.ps1`;
- tabla de métricas con `Coincide = True`;
- salida `AFB-189 RESTORE TEST OK`;
- consulta en pgAdmin mostrando la base restaurada y objetos del esquema `alfi`.

No debe registrarse como prueba exitosa una restauración que no haya sido ejecutada realmente.
