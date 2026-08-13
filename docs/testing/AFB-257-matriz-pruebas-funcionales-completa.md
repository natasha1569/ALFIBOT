# AFB-257 — T-18 Matriz de Pruebas Funcionales Completa

## Objetivo
Consolidar la matriz funcional final de ALFI BOT.

## Cobertura
- AFB-258: API REST.
- AFB-259: plantilla de matriz.
- AFB-260: análisis por texto.
- AFB-261: enlaces e imágenes.
- AFB-262: base de datos.
- AFB-263: resultados esperados y obtenidos.
- AFB-264: estados y observaciones.
- AFB-331: automatización / GitHub Actions.

## Matriz resumida

| ID | Módulo | Prueba | Resultado esperado | Estado | Evidencia |
|---|---|---|---|---|---|
| PF-001 | API | Entrada inválida | HTTP 400 | Aprobada | `backend/test/errorHandling.test.js` |
| PF-002 | Auth | Registro | HTTP 201 | Aprobada | `backend/test-auth.js` |
| PF-003 | Auth | Login | HTTP 200 + token | Aprobada | `backend/test-auth.js` |
| PF-004 | RBAC | Usuario sin permiso | HTTP 403 | Aprobada | `backend/test-rbac.js` |
| PF-005 | Texto | Ponzi | categoría `ponzi` | Aprobada | `backend/test/aiPolicy.test.js` |
| PF-006 | Texto | Categoría desconocida | `null` | Aprobada | `backend/test/aiPolicy.test.js` |
| PF-007 | Enlace | URL inválida | HTTP 400 | Aprobada | controlador |
| PF-008 | Imagen | PNG válido | aceptado | Aprobada | `backend/test/imageAnalysis.service.test.js` |
| PF-009 | Imagen | MIME falso | rechazado | Aprobada | misma prueba |
| PF-010 | Imagen | Falla OCR | detener flujo | Aprobada | misma prueba |
| PF-011 | BD | Vistas BI | existentes | Aprobada | `backend/test-reporting.js` |
| PF-012 | BD | Privacidad BI | sin columnas sensibles | Aprobada | `backend/test-reporting.js` |
| PF-013 | Historial | Normalización | datos válidos | Aprobada | `frontend/test/history.test.js` |
| PF-014 | Compartir | WhatsApp/PDF/clipboard | contenido generado | Aprobada | `frontend/test/shareReport.test.js` |
| PF-015 | Auth | Recuperar contraseña | flujo funcional | Incidencia/manual | evidencia manual pendiente |
| PF-016 | Admin | CRUD licencias | CRUD correcto | Incidencia/manual | evidencia manual pendiente |

## Conclusión
La matriz usa evidencia existente del repositorio. Los escenarios sin prueba automatizada específica se dejan identificados como validación manual, sin inventar resultados.
