# AFB-269, AFB-270, AFB-272 y AFB-273 — Evidencia final

## AFB-269 — Registro, autenticación y roles
Verificar:
- registro de usuario;
- inicio de sesión;
- sesión autenticada;
- rechazo de credenciales inválidas;
- acceso autorizado según rol;
- bloqueo de operaciones sin permisos.

Evidencia técnica relacionada:
- pruebas de autenticación del backend;
- pruebas RBAC;
- middleware de autenticación y autorización.

## AFB-270 — Análisis y resultados
Verificar:
- análisis de texto;
- análisis de enlace;
- análisis de imagen;
- nivel de riesgo;
- resumen;
- señales de alerta;
- recomendaciones.

## AFB-272 — Persistencia, historial y reportería
Verificar:
- almacenamiento de análisis en PostgreSQL;
- consulta del historial personal;
- compatibilidad de `preview` e `inputPreview`;
- vistas de reportería;
- acceso de auditor y administrador según permisos.

La evidencia automatizada del historial cubre respuestas actuales e históricas y evita que una respuesta inválida rompa la interfaz.

## AFB-273 — Compartir resultados y cierre funcional
Verificar:
- generación del resumen compartible;
- WhatsApp Web;
- portapapeles;
- PDF;
- nombre seguro del archivo PDF.

La evidencia automatizada existente valida la construcción del contenido, URL de WhatsApp, portapapeles y generación lógica del PDF.

## Registro de ejecución manual

| Prueba | Resultado | Evidencia |
|---|---|---|
| Registro/login | Pendiente de ejecución final | Captura |
| Análisis de texto | Pendiente de ejecución final | Captura |
| Análisis de enlace | Pendiente de ejecución final | Captura |
| Análisis de imagen | Pendiente de ejecución final | Captura |
| Historial | Pendiente de ejecución final | Captura |
| Reportería | Pendiente de ejecución final | Captura |
| Administración | Pendiente de ejecución final | Captura |
| Compartir/PDF | Pendiente de ejecución final | Captura |

> Cambiar “Pendiente de ejecución final” por “Aprobado” únicamente después de realizar la prueba.
