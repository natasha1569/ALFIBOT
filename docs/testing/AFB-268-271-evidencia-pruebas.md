# AFB-268 y AFB-271 — Evidencia de pruebas funcionales

Fecha de ejecución: 12 de agosto de 2026.

## Objetivo

Verificar el historial personal y las opciones para compartir un resultado mediante WhatsApp Web, PDF y portapapeles.

## Casos automatizados

| ID | Jira | Funcionalidad | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|
| PF-HIS-001 | AFB-268 | Vista previa desde PostgreSQL | Mostrar el campo `preview` devuelto por la API | El normalizador conserva y presenta `preview` | Aprobada | `frontend/test/history.test.js` |
| PF-HIS-002 | AFB-268 | Compatibilidad histórica | Aceptar registros con `inputPreview` | El valor histórico se usa como respaldo | Aprobada | `frontend/test/history.test.js` |
| PF-HIS-003 | AFB-268 | Respuesta inválida | Convertir una respuesta no iterable en una lista vacía | Se devuelve `[]` sin romper la interfaz | Aprobada | `frontend/test/history.test.js` |
| PF-COM-001 | AFB-271 | Resumen compartible | Incluir riesgo, fecha, tipo, resumen, señales, recomendaciones, fuente y advertencia | El texto contiene todas las secciones | Aprobada | `frontend/test/shareReport.test.js` |
| PF-COM-002 | AFB-271 | WhatsApp Web | Codificar el informe completo en `https://web.whatsapp.com/send` | La URL recupera exactamente el mismo resumen | Aprobada | `frontend/test/shareReport.test.js` |
| PF-COM-003 | AFB-271 | Ventana de WhatsApp | Reutilizar la ventana ya abierta o abrirla con aislamiento | Se asigna la URL y se usan `noopener,noreferrer` | Aprobada | `frontend/test/shareReport.test.js` |
| PF-COM-004 | AFB-271 | Portapapeles | Copiar exactamente el informe preventivo | El texto escrito coincide con el resumen | Aprobada | `frontend/test/shareReport.test.js` |
| PF-COM-005 | AFB-271 | Archivo PDF | Generar un nombre `.pdf` seguro y reproducible | Se obtiene `alfi-bot-<riesgo>-AAAA-MM-DD.pdf` | Aprobada | `frontend/test/shareReport.test.js` |
| PF-COM-006 | AFB-271 | Generación PDF | Completar la construcción lógica y solicitar la descarga | El generador retorna modo `pdf` y guarda un archivo con nombre válido | Aprobada | `frontend/test/shareReport.test.js` |

## Ejecución reproducible

```bash
cd frontend
npm ci
npm test
npm run build
```

Resultado obtenido en esta implementación:

- 18 pruebas frontend aprobadas.
- 0 pruebas fallidas.
- compilación Vite de producción aprobada.

## Alcance de la evidencia

Las pruebas verifican la lógica que genera el contenido, la URL, la escritura al portapapeles y el archivo PDF. El envío final de un mensaje depende de una sesión de WhatsApp Web y de la confirmación del usuario; ALFI BOT no envía mensajes automáticamente.

La descarga física puede variar según los permisos y configuración del navegador. Si jsPDF no puede cargarse, el sistema conserva el respaldo de impresión para guardar el informe como PDF.
