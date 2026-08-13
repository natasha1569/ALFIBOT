# AFB-283 — Ensayo de sustentación

## Objetivo

Preparar la sustentación final de ALFI BOT, distribuyendo los temas técnicos entre los integrantes y definiendo el recorrido de demostración del sistema.

## Distribución

### Natasha Erazo

- Frontend desarrollado con React.
- Experiencia de usuario.
- Validaciones del frontend.
- Navegación.
- Vistas y funcionalidades según rol.
- Integración del frontend con la API.
- Evidencias registradas en Jira y Confluence.
- Explicación general del flujo de ALFI BOT.

### Danny Baquero

- Backend desarrollado con Node.js y Express.
- API REST.
- Endpoints principales.
- Autenticación y autorización.
- Integración con OpenAI.
- Manejo de errores.
- Pruebas automatizadas.
- Integración entre frontend y backend.

### Romel Arévalo

- PostgreSQL.
- Modelo de base de datos.
- Claves primarias y foráneas.
- Restricciones de integridad.
- Auditoría.
- Vistas de reportería.
- Control de acceso basado en roles (RBAC).
- Respaldo y restauración.

## Demostración

Durante la sustentación se realizará el siguiente recorrido:

1. Presentar el problema que resuelve ALFI BOT.
2. Explicar el objetivo y alcance del proyecto.
3. Mostrar la arquitectura general.
4. Explicar frontend, backend y PostgreSQL.
5. Iniciar sesión en el sistema.
6. Ejecutar un caso de riesgo bajo.
7. Ejecutar un caso de riesgo medio.
8. Ejecutar un caso de riesgo alto.
9. Explicar el nivel de riesgo obtenido.
10. Mostrar resumen, señales y recomendaciones.
11. Mostrar el historial.
12. Mostrar las funciones para compartir/generar resultados.
13. Mostrar reportería y auditoría según el rol.
14. Explicar PostgreSQL, restricciones, RBAC y seguridad.
15. Mostrar las evidencias de pruebas.
16. Mostrar Jira, Scrum, Confluence y GitHub.
17. Explicar la visión futura y monetización de ALFI BOT.

## Casos preparados

### Riesgo bajo

Contenido financiero informativo, sin solicitud de dinero ni credenciales y con información verificable.

**Resultado esperado:** el sistema debe identificar pocas o ninguna señal de fraude y presentar un nivel de riesgo bajo.

### Riesgo medio

Oferta llamativa con urgencia comercial y datos incompletos, sin solicitud directa de pago inmediato.

**Resultado esperado:** el sistema debe identificar señales preventivas y presentar un nivel de riesgo medio.

### Riesgo alto

Promesa de ganancias garantizadas acompañada de solicitud urgente de transferencia a un contacto o cuenta no verificada.

**Resultado esperado:** el sistema debe detectar múltiples señales de alerta y presentar un nivel de riesgo alto junto con recomendaciones preventivas.

## Evidencia técnica disponible

Antes del ensayo final se ejecutaron las pruebas automatizadas del proyecto:

- Backend: 31 de 31 pruebas aprobadas.
- Frontend: 24 de 24 pruebas aprobadas.
- Total: 55 de 55 pruebas aprobadas.
- Pruebas fallidas: 0.
- Build de producción del frontend: aprobado.
- PostgreSQL: conexión correcta durante las pruebas del backend.

## Visión de monetización

ALFI BOT se plantea como una solución gratuita para los usuarios finales.

Como visión de monetización a mediano plazo, el proyecto podrá incorporar publicidad relevante basada en tendencias agregadas de uso y riesgo.

La estrategia deberá preservar la privacidad de los usuarios y no implicará la exposición o venta de contraseñas, credenciales ni información personal sensible.

## Preguntas técnicas para practicar

Durante el ensayo el equipo debe estar preparado para responder:

1. ¿Por qué se utilizó React?
2. ¿Por qué se utilizó Node.js y Express?
3. ¿Por qué se eligió PostgreSQL?
4. ¿Cómo se comunica el frontend con el backend?
5. ¿Cómo funciona la autenticación?
6. ¿Qué función cumple JWT?
7. ¿Cómo funciona el control de acceso por roles?
8. ¿Cómo se protegen las contraseñas?
9. ¿Cómo se almacenan los análisis?
10. ¿Cómo funciona la auditoría?
11. ¿Qué restricciones existen en PostgreSQL?
12. ¿Cómo se realizan los respaldos y restauraciones?
13. ¿Cómo se comprobó el funcionamiento del sistema?
14. ¿Qué pruebas automatizadas existen?
15. ¿Cómo se gestionó el proyecto mediante Scrum?
16. ¿Cómo podría monetizarse ALFI BOT en el futuro?

## Control del ensayo

| Punto | Estado |
|---|---|
| Todos conocen el flujo general | Pendiente de ensayo |
| Frontend explicado | Pendiente de ensayo |
| Backend explicado | Pendiente de ensayo |
| Base de datos explicada | Pendiente de ensayo |
| Demostración de riesgo bajo | Pendiente de ensayo |
| Demostración de riesgo medio | Pendiente de ensayo |
| Demostración de riesgo alto | Pendiente de ensayo |
| Historial demostrado | Pendiente de ensayo |
| Roles demostrados | Pendiente de ensayo |
| Reportería/auditoría demostrada | Pendiente de ensayo |
| Evidencias de pruebas presentadas | Pendiente de ensayo |
| Jira y Confluence explicados | Pendiente de ensayo |
| Monetización explicada | Pendiente de ensayo |
| Preguntas técnicas practicadas | Pendiente de ensayo |
| Demostración completa | Pendiente de ensayo |

## Criterio de cierre

AFB-283 podrá marcarse como completada únicamente después de realizar el ensayo real de la sustentación.

Después del ensayo se deberán actualizar los estados de la tabla anterior y registrar cualquier observación o corrección detectada.

> No marcar como completados los puntos que todavía no hayan sido demostrados durante el ensayo real.