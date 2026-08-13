# AFB-258 — Casos de prueba para la API REST

## Objetivo
Registrar escenarios de validación de la API REST de ALFI BOT, cubriendo respuestas exitosas, errores y validaciones básicas.

| ID | Escenario | Resultado esperado | Evidencia | Estado |
|---|---|---|---|---|
| API-001 | Tipo de contenido inválido | HTTP 400 | `backend/test/errorHandling.test.js` | Aprobada |
| API-002 | Contenido vacío | HTTP 400 | Validación `CONTENT_REQUIRED` | Aprobada |
| API-003 | Enlace inválido | HTTP 400 | Validación `INVALID_LINK` | Aprobada |
| API-004 | Sin token | HTTP 401 | Middleware de autenticación | Aprobada |
| API-005 | Sin permisos | HTTP 403 | `backend/test-rbac.js` | Aprobada |
| API-006 | Error interno | No exponer SQL ni secretos | `backend/test/errorHandling.test.js` | Aprobada |
| API-007 | Falta OPENAI_API_KEY | HTTP 503 | `backend/test/errorHandling.test.js` | Aprobada |
| API-008 | Timeout IA | HTTP 504 | `backend/test/errorHandling.test.js` | Aprobada |

## Resultado
Los principales escenarios de la API quedan cubiertos y documentados.
