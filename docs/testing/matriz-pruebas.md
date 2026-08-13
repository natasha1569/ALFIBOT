# AFB-259 — Matriz de Pruebas Funcionales

## Objetivo

Documentar las pruebas funcionales de ALFI BOT, diferenciando claramente entre pruebas automatizadas ya ejecutadas y pruebas manuales que todavía requieren evidencia visual.

## Estados de prueba

- **Pendiente:** la prueba todavía no ha sido ejecutada manualmente.
- **Aprobada:** el resultado obtenido coincide con el resultado esperado.
- **Fallida:** el resultado obtenido no coincide con el resultado esperado.
- **Automatizada aprobada:** existe una prueba automatizada ejecutada correctamente que valida la funcionalidad o parte de ella.

## Resumen de validaciones automatizadas

Antes de la entrega se ejecutaron las pruebas automatizadas disponibles del proyecto.

- Backend: 31 de 31 pruebas aprobadas.
- Frontend: 24 de 24 pruebas aprobadas.
- Total: 55 de 55 pruebas aprobadas.
- Pruebas fallidas: 0.
- PostgreSQL: conexión correcta durante las pruebas del backend.
- Build de producción: completado correctamente con Vite.
- Errores críticos detectados durante pruebas automatizadas: 0.

## Matriz de pruebas funcionales

| ID | Módulo | Funcionalidad | Precondición | Pasos de prueba | Datos de entrada | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| PF-001 | Autenticación | Registro e inicio de sesión | Backend y PostgreSQL activos | Registrar un usuario e iniciar sesión con credenciales válidas | Nombre, correo y contraseña válidos | El usuario se registra e inicia sesión correctamente | Validaciones automatizadas disponibles; falta ejecución visual final | Pendiente | Captura de registro y login |
| PF-002 | Análisis | Analizar contenido de texto | Usuario autenticado | Seleccionar análisis de texto, ingresar contenido y ejecutar análisis | Texto de prueba | El sistema muestra nivel de riesgo, resumen, señales y recomendaciones | Lógica validada mediante pruebas automatizadas; falta recorrido visual final | Pendiente | Captura del resultado |
| PF-003 | Análisis | Analizar enlace | Usuario autenticado | Seleccionar análisis de enlace, ingresar URL válida y ejecutar análisis | URL de prueba | El sistema procesa el enlace y presenta el resultado preventivo | Integración cubierta parcialmente por pruebas; falta ejecución manual final | Pendiente | Captura del resultado |
| PF-004 | Análisis | Analizar imagen | Usuario autenticado | Seleccionar análisis de imagen, cargar una imagen y ejecutar análisis | Imagen de prueba | El sistema procesa la imagen y presenta un resultado de riesgo | Flujo disponible en el sistema; falta evidencia manual final | Pendiente | Captura del análisis |
| PF-005 | Historial | Consultar historial personal | Usuario autenticado con análisis almacenados | Abrir la sección de historial | Usuario con resultados previos | Se muestran los análisis almacenados del usuario | Pruebas automatizadas de historial aprobadas | Automatizada aprobada | Resultado de suite frontend/backend |
| PF-006 | Resultados | Compartir por WhatsApp Web | Existe un resultado de análisis | Presionar la opción de compartir por WhatsApp | Resultado preventivo | Se genera el contenido compartible y se abre WhatsApp Web | Lógica de compartir validada mediante pruebas automatizadas | Automatizada aprobada | Suite de pruebas |
| PF-007 | Resultados | Copiar al portapapeles | Existe un resultado de análisis | Presionar copiar resultado | Resultado preventivo | El contenido se copia correctamente | Función validada mediante pruebas automatizadas | Automatizada aprobada | Suite de pruebas |
| PF-008 | Resultados | Generar PDF | Existe un resultado de análisis | Presionar descargar/generar PDF | Resultado preventivo | Se genera un PDF con la información del análisis | Lógica de generación validada; falta comprobación visual final del documento | Pendiente | Captura/PDF generado |
| PF-009 | Seguridad | Acceso según rol | Existen usuarios con diferentes roles | Iniciar sesión con usuario, auditor y administrador | Credenciales válidas por rol | Cada rol accede únicamente a las funciones permitidas | Pruebas RBAC automatizadas aprobadas | Automatizada aprobada | Resultado de pruebas RBAC |
| PF-010 | Reportería | Consultar vistas de reportería | Rol autorizado | Acceder al módulo de reportería | Datos existentes en PostgreSQL | Se muestran datos agregados útiles | Pruebas de reportería disponibles y aprobadas | Automatizada aprobada | Resultado de pruebas |
| PF-011 | Administración | Gestionar usuarios | Usuario administrador autenticado | Acceder al módulo administrativo y consultar/actualizar usuarios | Datos de usuario | El administrador puede ejecutar las operaciones autorizadas | Funcionalidad disponible; falta evidencia manual visual final | Pendiente | Captura del módulo |
| PF-012 | Base de datos | Persistencia de análisis | Backend y PostgreSQL activos | Ejecutar un análisis y consultar posteriormente el historial | Contenido de análisis | El resultado queda almacenado y puede recuperarse | Conexión PostgreSQL validada durante pruebas automatizadas | Automatizada aprobada | Consola de pruebas |
| PF-013 | Frontend | Compilación para producción | Dependencias instaladas | Ejecutar `npm run build` | Código frontend | Vite genera correctamente la versión de producción | Build completado correctamente | Aprobada | Captura de terminal |
| PF-014 | Backend | Suite automatizada | Dependencias instaladas y BD disponible | Ejecutar `npm test` en backend | Código backend | Todas las pruebas finalizan correctamente | 31 de 31 pruebas aprobadas | Aprobada | Captura de terminal |
| PF-015 | Frontend | Suite automatizada | Dependencias instaladas | Ejecutar `npm test` en frontend | Código frontend | Todas las pruebas finalizan correctamente | 24 de 24 pruebas aprobadas | Aprobada | Captura de terminal |

## Trazabilidad funcional

| Requisito / Flujo | Componente o capa | API / Servicio | Persistencia / BD | Prueba relacionada | Evidencia |
|---|---|---|---|---|---|
| Registro e inicio de sesión | Frontend de autenticación | API `/api/auth` | Usuarios PostgreSQL | PF-001 | Captura manual + pruebas backend |
| Análisis de texto | Formulario de análisis | API `/api/analysis` | Análisis, señales y recomendaciones | PF-002 | Captura manual |
| Análisis de enlace | Formulario de análisis | API `/api/analysis` | Análisis y resultados | PF-003 | Captura manual |
| Análisis de imagen | Formulario de análisis | API `/api/analysis` | Análisis y resultados | PF-004 | Captura manual |
| Historial | Vista de historial | API de historial/análisis | Tabla de análisis | PF-005 | Suite automatizada |
| Compartir resultados | Componente de resultados | Funciones frontend | No aplica | PF-006, PF-007, PF-008 | Suite + captura/PDF |
| Acceso por roles | Rutas/vistas según rol | Middleware de autorización | Roles y permisos | PF-009 | Pruebas RBAC |
| Reportería | Dashboard de reportería | API de reporting | Vistas PostgreSQL | PF-010 | Pruebas + captura |
| Administración | Panel administrativo | API administrativa | Usuarios y auditoría | PF-011 | Captura manual |
| Persistencia | Backend | Servicios de almacenamiento | PostgreSQL | PF-012 | Pruebas backend |
| Build frontend | Vite | No aplica | No aplica | PF-013 | Captura terminal |
| Pruebas backend | Node test runner | Backend | PostgreSQL cuando corresponde | PF-014 | 31/31 |
| Pruebas frontend | Node test runner | Frontend | No aplica | PF-015 | 24/24 |

## Evidencias manuales pendientes

Antes de la entrega final deben conservarse evidencias visuales de:

- Registro e inicio de sesión.
- Análisis de texto.
- Análisis de enlace.
- Análisis de imagen.
- Generación del PDF.
- Panel de administración.
- Reportería, si se desea reforzar la evidencia visual.
- Acceso por roles, si se desea reforzar la evidencia automatizada.

Las pruebas no deben cambiarse a **Aprobada** hasta que hayan sido ejecutadas realmente y exista una evidencia verificable.

## Resultado actual

La validación automatizada del proyecto se encuentra aprobada:

- 55 de 55 pruebas automatizadas aprobadas.
- 0 pruebas automatizadas fallidas.
- Build de producción aprobado.
- Conexión con PostgreSQL comprobada durante la suite del backend.

La matriz queda parcialmente cerrada porque todavía existen pruebas manuales que requieren ejecución y evidencia visual antes de la entrega definitiva.