# AFB-265 — Plan de prueba integral final

## Objetivo
Validar el flujo completo de ALFI BOT antes de la sustentación.

## Flujo a verificar
1. Registro e inicio de sesión.
2. Acceso según rol.
3. Análisis de texto.
4. Análisis de enlace.
5. Análisis de imagen.
6. Persistencia y consulta del historial.
7. Visualización del nivel de riesgo, resumen, señales y recomendaciones.
8. Compartir resultado mediante WhatsApp Web, PDF y portapapeles.
9. Acceso de auditor a reportería.
10. Acceso de administrador a gestión de usuarios y auditoría.

## Evidencia automatizada ya disponible
- Pruebas de frontend.
- Pruebas de backend.
- Pruebas RBAC.
- Pruebas de reportería.
- Pruebas de historial y funciones de compartir.
- Compilación Vite.

## Evidencia manual pendiente de ejecución
La prueba integral debe ejecutarse con frontend, backend y PostgreSQL activos. No se registra como aprobada una acción manual que no haya sido ejecutada.

## Criterio de cierre
AFB-265 puede finalizarse cuando el flujo integral se ejecute sin errores críticos y se conserve evidencia de la ejecución.

## Resultado de pruebas automatizadas finales

Las pruebas automatizadas finales fueron ejecutadas correctamente antes de la entrega.

- Backend: 31 de 31 pruebas aprobadas.
- Frontend: 24 de 24 pruebas aprobadas.
- Total: 55 de 55 pruebas aprobadas.
- Errores detectados: 0.
- PostgreSQL: conexión correcta durante las pruebas del backend.
- Build de producción del frontend: completado correctamente con Vite.
- Módulos transformados durante el build: 58.

### Resultado

La suite automatizada del proyecto finalizó sin errores y el frontend generó correctamente la versión de producción.

Las pruebas manuales que dependan de interacción visual se registran de forma separada y no se consideran ejecutadas únicamente por esta suite.