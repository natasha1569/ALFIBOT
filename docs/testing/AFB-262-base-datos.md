# AFB-262 — Casos de prueba para la base de datos

## Objetivo
Verificar restricciones, integridad, reportería y privacidad en PostgreSQL.

| ID | Escenario | Resultado esperado | Evidencia | Estado |
|---|---|---|---|---|
| DB-001 | `categoria_fraude` existe | Columna disponible | `backend/test-reporting.js` | Aprobada |
| DB-002 | Categoría inválida | No persistir valor fuera de taxonomía | `backend/test-reporting.js` | Aprobada |
| DB-003 | Vista `vw_reporte_fraude_riesgo` | Existe y es consultable | `backend/test-reporting.js` | Aprobada |
| DB-004 | Vista `vw_reporte_contenido_perfil` | Existe y es consultable | `backend/test-reporting.js` | Aprobada |
| DB-005 | Privacidad BI | No exponer columnas sensibles | `backend/test-reporting.js` | Aprobada |
| DB-006 | Auditoría | Registrar operaciones críticas | Scripts/documentación del proyecto | Aprobada |
| DB-007 | Integridad | PK/FK/CHECK/UNIQUE aplicadas | Modelo PostgreSQL | Aprobada |
| DB-008 | Migraciones | Mantener estructura consistente | `backend/sql/` | Aprobada documental |

## Resultado
La matriz cubre estructura, taxonomía, vistas BI, privacidad, auditoría e integridad.
