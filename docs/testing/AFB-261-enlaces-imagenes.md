# AFB-261 — Casos de prueba para enlaces e imágenes

## Enlaces

| ID | Escenario | Resultado esperado | Estado |
|---|---|---|---|
| LNK-001 | URL válida con https | Aceptada | Aprobada |
| LNK-002 | URL sin protocolo | HTTP 400 | Aprobada |
| LNK-003 | URL demasiado larga | HTTP 400 | Aprobada |

## Imágenes

| ID | Escenario | Resultado esperado | Evidencia | Estado |
|---|---|---|---|---|
| IMG-001 | PNG válido | Aceptado | `backend/test/imageAnalysis.service.test.js` | Aprobada |
| IMG-002 | GIF | Rechazado | misma prueba | Aprobada |
| IMG-003 | MIME falsificado | Rechazado | misma prueba | Aprobada |
| IMG-004 | Imagen sobre límite | Rechazado | misma prueba | Aprobada |
| IMG-005 | OCR + análisis | OCR antes del análisis | misma prueba | Aprobada |
| IMG-006 | Falla OCR | No continuar análisis | misma prueba | Aprobada |

## Resultado
Se documentan validaciones, procesamiento y manejo de errores.
