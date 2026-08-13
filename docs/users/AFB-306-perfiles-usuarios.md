# AFB-306 — Perfiles de Usuarios del Sistema ALFI BOT

## 1. Objetivo

Documentar los principales perfiles de usuarios que interactúan con ALFI BOT, describiendo sus características, necesidades, responsabilidades y funciones dentro del sistema.

## 2. Perfiles de usuarios

ALFI BOT contempla diferentes perfiles para organizar el acceso y las responsabilidades dentro del sistema.

Los principales perfiles son:

- Usuario.
- Administrador.
- Auditor.

## 3. Usuario

### Descripción

Es la persona que utiliza ALFI BOT para analizar información y detectar posibles señales relacionadas con fraudes financieros.

### Características

- Puede registrarse en la aplicación.
- Puede iniciar y cerrar sesión.
- Utiliza la interfaz web de ALFI BOT.
- Puede enviar contenido para análisis.
- Puede consultar los resultados obtenidos.
- Puede revisar su historial de análisis.

### Necesidades

- Obtener información clara sobre posibles riesgos.
- Analizar contenido de manera sencilla.
- Recibir recomendaciones preventivas.
- Mantener segura su información.
- Consultar análisis realizados anteriormente.

### Funciones

- Registro de cuenta.
- Inicio de sesión.
- Análisis de texto.
- Análisis de enlaces.
- Análisis de imágenes.
- Consulta de resultados.
- Consulta del historial.
- Cierre de sesión.

## 4. Administrador

### Descripción

Es el perfil encargado de realizar actividades administrativas y de supervisión dentro de ALFI BOT.

### Características

- Posee permisos superiores a los de un usuario normal.
- Puede acceder a funciones administrativas.
- Puede gestionar información relacionada con usuarios.
- Supervisa determinados aspectos del funcionamiento del sistema.

### Necesidades

- Gestionar usuarios.
- Controlar los accesos al sistema.
- Consultar información administrativa.
- Verificar el correcto funcionamiento de la aplicación.
- Mantener una adecuada organización de roles y permisos.

### Funciones

- Consultar usuarios.
- Gestionar información administrativa.
- Verificar roles.
- Controlar permisos.
- Acceder a funciones restringidas.
- Supervisar información del sistema.

## 5. Auditor

### Descripción

Es el perfil encargado de revisar los registros y operaciones realizadas sobre información importante del sistema.

### Características

- Está orientado a la consulta y revisión.
- Puede consultar información relacionada con auditoría.
- Permite apoyar la trazabilidad de las operaciones.
- No debe modificar los registros de auditoría.

### Necesidades

- Consultar operaciones realizadas.
- Identificar cambios en los datos.
- Revisar registros de auditoría.
- Verificar fechas y tipos de operaciones.
- Comprobar la trazabilidad de los cambios.

### Funciones

- Consultar registros de auditoría.
- Revisar operaciones INSERT.
- Revisar operaciones UPDATE.
- Revisar operaciones DELETE.
- Verificar registros afectados.
- Consultar fechas de las operaciones.

## 6. Comparación de perfiles

| Funcionalidad | Usuario | Administrador | Auditor |
| --- | --- | --- | --- |
| Iniciar sesión | Sí | Sí | Sí |
| Analizar contenido | Sí | Sí | Según permisos |
| Consultar resultados | Sí | Sí | Según permisos |
| Consultar historial | Sí | Sí | Según permisos |
| Gestionar usuarios | No | Sí | No |
| Gestionar roles/permisos | No | Sí | No |
| Consultar auditoría | No | Según permisos | Sí |
| Modificar auditoría | No | No | No |
| Acceder a administración | No | Sí | No |

## 7. Control de acceso

La separación de perfiles permite establecer diferentes niveles de acceso dentro de ALFI BOT.

Cada usuario debe disponer únicamente de los permisos necesarios para realizar sus funciones.

Esta organización permite aplicar el principio de menor privilegio y reducir accesos innecesarios a funcionalidades sensibles.

## 8. Relación con la base de datos

Los perfiles se relacionan con la información almacenada en PostgreSQL.

La entidad de usuarios permite almacenar la información correspondiente a las personas registradas, mientras que los roles permiten determinar los permisos asociados a cada perfil.

De forma simplificada:

`roles` → `usuarios`

Esto permite diferenciar las responsabilidades de usuarios, administradores y perfiles relacionados con auditoría.

## 9. Importancia de los perfiles

La definición de perfiles permite:

- Organizar las responsabilidades.
- Controlar el acceso a funcionalidades.
- Mejorar la seguridad.
- Evitar accesos no autorizados.
- Aplicar el principio de menor privilegio.
- Facilitar la administración del sistema.
- Mantener una adecuada trazabilidad.

## 10. Conclusión

Los perfiles de usuario permiten establecer claramente las responsabilidades dentro de ALFI BOT.

El usuario utiliza las funcionalidades de análisis y prevención, el administrador gestiona aspectos administrativos del sistema y el auditor se enfoca en la revisión y trazabilidad de las operaciones.

Esta separación contribuye a mantener un sistema organizado y con un mejor control de acceso.