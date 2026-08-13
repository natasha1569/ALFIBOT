# AFB-146 — Estándar de manejo de errores

## Objetivo

ALFI BOT devuelve errores previsibles, seguros y consumibles por el frontend. Los detalles técnicos se registran únicamente en el backend y nunca forman parte de la respuesta HTTP.

## Contrato HTTP

Las respuestas de error conservan el campo `error` para compatibilidad y añaden un código estable:

```json
{
  "error": "Mensaje seguro y accionable para el usuario.",
  "code": "ERROR_CODE"
}
```

El frontend transforma este contrato en `ApiError`, preservando `message`, `code` y `status`. Las pantallas existentes continúan mostrando `error.message`.

## Catálogo principal

| Caso | Código | HTTP |
|---|---|---:|
| Solicitud o contenido inválido | `INVALID_REQUEST`, `INVALID_CONTENT_TYPE`, `CONTENT_REQUIRED`, `INVALID_LINK`, `INVALID_IMAGE` | 400 |
| JSON inválido | `INVALID_JSON` | 400 |
| Autenticación requerida o sesión inválida | `AUTHENTICATION_REQUIRED`, `INVALID_SESSION`, `INVALID_CREDENTIALS` | 401 |
| Operación no autorizada | `FORBIDDEN` | 403 |
| Recurso no encontrado | `NOT_FOUND` | 404 |
| Conflicto de estado o duplicado | `CONFLICT` | 409 |
| Payload mayor al límite | `PAYLOAD_TOO_LARGE` | 413 |
| Proveedor de IA no disponible | `AI_SERVICE_UNAVAILABLE` | 502 |
| API key de OpenAI faltante | `OPENAI_API_KEY_MISSING` | 503 |
| PostgreSQL no disponible | `DATABASE_UNAVAILABLE` | 503 |
| Timeout del análisis | `AI_TIMEOUT` | 504 |
| Fallo inesperado | `INTERNAL_ERROR` | 500 |

La fuente de verdad está en `backend/src/errors/errorCatalog.js`.

## Reglas de seguridad

- No devolver `error.message` de librerías, PostgreSQL u OpenAI al navegador.
- No incluir SQLSTATE, nombres de tablas, consultas, trazas, modelos, cuentas ni credenciales en el JSON de respuesta.
- Registrar la causa técnica mediante `logServerError`, que redacta cadenas de conexión, API keys y asignaciones de secretos frecuentes.
- Conservar la causa técnica en `AppError.cause` únicamente para diagnóstico del servidor.
- Convertir errores desconocidos en un mensaje genérico seguro.

## Comportamiento esperado

- Si falta `OPENAI_API_KEY`, la API responde `503` con `OPENAI_API_KEY_MISSING`.
- Si OpenAI agota el tiempo, la API responde `504` con `AI_TIMEOUT`.
- Si el payload o el contenido es inválido, la API responde `400` con un mensaje de corrección.
- Si PostgreSQL falla, el frontend recibe `DATABASE_UNAVAILABLE`, sin detalles internos.
- Si el token falta o no es válido, la API responde `401`; si el rol no tiene permiso, responde `403`.

## Verificación

```bash
cd backend
npm test
node test-rbac.js

cd ../frontend
npm test
npm run build
```
