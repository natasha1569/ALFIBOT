
# AFB-265 — Plan de prueba integral final

## Objetivo

Validar el flujo completo de ALFI BOT antes de la sustentación, comprobando el funcionamiento conjunto del frontend, backend y PostgreSQL.

## Flujo integral a verificar

La prueba integral contempla los siguientes flujos funcionales:

1. Registro e inicio de sesión.
2. Acceso al sistema según el rol del usuario.
3. Análisis de contenido de texto.
4. Análisis de enlaces.
5. Análisis de imágenes.
6. Persistencia y consulta del historial de análisis.
7. Visualización del nivel de riesgo, resumen, señales y recomendaciones.
8. Compartir resultados mediante WhatsApp Web, PDF y portapapeles.
9. Acceso del rol auditor a las funciones de reportería.
10. Acceso del rol administrador a la gestión de usuarios y auditoría.

## Evidencia automatizada disponible

El proyecto cuenta con pruebas automatizadas para validar diferentes componentes y funcionalidades de ALFI BOT:

- Pruebas del backend.
- Pruebas del frontend.
- Pruebas de control de acceso basado en roles (RBAC).
- Pruebas de reportería.
- Pruebas relacionadas con historial.
- Pruebas de funciones para compartir resultados.
- Validación de compilación del frontend con Vite.

## Resultado de las pruebas automatizadas finales

Antes del cierre del proyecto se ejecutaron las suites automatizadas disponibles.

Los resultados obtenidos fueron:

- Backend: 31 de 31 pruebas aprobadas.
- Frontend: 24 de 24 pruebas aprobadas.
- Total: 55 de 55 pruebas aprobadas.
- Pruebas fallidas: 0.
- Errores críticos detectados: 0.
- PostgreSQL: conexión correcta durante las pruebas del backend.
- Build de producción del frontend: completado correctamente.
- Módulos transformados durante el build de Vite: 58.

**Estado de las pruebas automatizadas: APROBADO.**

## Validación del build de producción

Se ejecutó el proceso de compilación del frontend mediante Vite.

El proceso terminó correctamente y generó la versión de producción de la aplicación sin errores críticos.

Esto permite comprobar que el frontend puede ser compilado correctamente para su distribución y ejecución en un entorno de producción.

**Estado del build: APROBADO.**

## Evidencia manual

Las pruebas automatizadas permiten validar gran parte de la lógica del sistema, pero no sustituyen completamente las pruebas manuales de interacción con la aplicación.

Las pruebas manuales deben comprobar visualmente los siguientes flujos:

- Registro de usuario.
- Inicio de sesión.
- Acceso según rol.
- Análisis de texto.
- Análisis de enlaces.
- Análisis de imágenes.
- Consulta del historial.
- Visualización del nivel de riesgo.
- Visualización de señales y recomendaciones.
- Generación de PDF.
- Compartir mediante WhatsApp Web.
- Copiar resultado al portapapeles.
- Acceso del auditor a reportería.
- Acceso del administrador a gestión de usuarios y auditoría.

Las evidencias manuales deben conservarse mediante capturas de pantalla u otro registro verificable de la ejecución.

**Estado de evidencia manual: PENDIENTE DE COMPLETAR.**

## Resumen de resultados

| Validación | Resultado |
|---|---|
| Pruebas backend | 31/31 aprobadas |
| Pruebas frontend | 24/24 aprobadas |
| Total pruebas automatizadas | 55/55 aprobadas |
| Pruebas automatizadas fallidas | 0 |
| Conexión PostgreSQL durante pruebas | Correcta |
| Build frontend con Vite | Aprobado |
| Errores críticos automatizados | 0 |
| Evidencias manuales | Pendientes de completar |

## Criterio de cierre

AFB-265 podrá considerarse completamente validada cuando:

1. Las pruebas automatizadas finalicen sin errores críticos.
2. El frontend compile correctamente para producción.
3. Se ejecute el flujo manual integral con frontend, backend y PostgreSQL activos.
4. No se detecten errores críticos durante el recorrido manual.
5. Se conserven evidencias verificables de la ejecución.

Los puntos 1 y 2 se encuentran cumplidos.

Los puntos relacionados con la ejecución y evidencia manual deben completarse antes de considerar cerrada la validación integral.

## Conclusión

La validación automatizada de ALFI BOT fue satisfactoria.

Se ejecutaron un total de 55 pruebas automatizadas, correspondientes a 31 pruebas del backend y 24 pruebas del frontend, obteniendo un resultado de 55 pruebas aprobadas y 0 pruebas fallidas.

La conexión con PostgreSQL funcionó correctamente durante las pruebas del backend y el frontend generó correctamente su build de producción mediante Vite.

No se detectaron errores críticos durante las validaciones automatizadas.

Para completar la evidencia integral del proyecto queda pendiente registrar las pruebas manuales de los principales flujos funcionales del sistema.