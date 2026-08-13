# AFB-260 — Casos de prueba para análisis por texto

## Objetivo
Documentar las pruebas funcionales del flujo de análisis por texto.

| ID | Escenario | Resultado esperado | Evidencia | Estado |
|---|---|---|---|---|
| TXT-001 | Texto financiero válido | Riesgo, resumen, señales y recomendaciones | Servicio de análisis | Aprobada |
| TXT-002 | Texto vacío | HTTP 400 | `CONTENT_REQUIRED` | Aprobada |
| TXT-003 | Texto > 5000 caracteres | HTTP 400 | Controlador de análisis | Aprobada |
| TXT-004 | Esquema Ponzi | Categoría `ponzi` | `backend/test/aiPolicy.test.js` | Aprobada |
| TXT-005 | Categoría no catalogada | `fraudCategory = null` | `backend/test/aiPolicy.test.js` | Aprobada |
| TXT-006 | Contenido no financiero | Aplicar política sin guardar historial cuando corresponda | Controlador | Aprobada |

## Resultado
Se cubren entradas válidas, inválidas, límites y categorización.
