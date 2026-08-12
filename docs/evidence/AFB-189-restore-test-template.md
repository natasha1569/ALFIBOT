# Evidencia AFB-189 — Respaldo y restauración

> Plantilla para completar durante la validación final. No afirmar resultados que no hayan sido ejecutados.

## Datos de la prueba

- Fecha:
- Responsable:
- Base origen:
- Archivo de respaldo:
- Tamaño del respaldo:
- Base de restauración:
- Hora inicio:
- Hora fin:
- Tiempo total:
- RPO objetivo: 24 horas
- RTO objetivo: 2 horas

## Evidencia de backup

Captura de la ejecución de:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-backup\backup.ps1
```

Resultado observado:

## Evidencia de automatización

Captura del Programador de tareas mostrando `ALFIBOT PostgreSQL Backup`.

Resultado observado:

## Evidencia de restauración

Comando utilizado:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\database-backup\restore-test.ps1 -BackupFile "RUTA_REAL_DEL_DUMP"
```

Resultado observado:

## Validación de integridad

Registrar la comparación mostrada por el script:

| Métrica | Origen | Restaurada | Coincide |
|---|---:|---:|---|
| Tablas `alfi` | | | |
| Vistas `alfi` | | | |
| Restricciones `alfi` | | | |

## Capturas de pgAdmin

Agregar evidencia de la base restaurada y del esquema `alfi`.

## Conclusión

- Backup generado correctamente: Pendiente
- Restauración completada: Pendiente
- Validación estructural coincidente: Pendiente
- RTO cumplido: Pendiente
- Incidencias:
