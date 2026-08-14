# AFB-277 - Guion de Sustentación Técnica de ALFI BOT

## Objetivo

Establecer el orden de la sustentación técnica de ALFI BOT, definiendo los temas principales, los mensajes clave y las transiciones entre cada sección para realizar una presentación clara y organizada.

## 1. Presentación del proyecto

Buenos días. Nuestro proyecto se llama ALFI BOT - Alertas Financieras.

ALFI BOT es un sistema orientado a ayudar a los usuarios a identificar posibles contenidos financieros fraudulentos mediante el análisis de información.

Durante esta sustentación mostraremos el problema identificado, la solución desarrollada, las tecnologías utilizadas, el funcionamiento del sistema y los principales resultados obtenidos.

**Transición:**  
Para comprender la utilidad de ALFI BOT, primero explicaremos el problema que buscamos resolver.

## 2. Problema

Actualmente existen diferentes tipos de fraudes financieros que pueden presentarse mediante textos, enlaces o imágenes.

Para un usuario puede ser difícil reconocer señales de riesgo antes de confiar en determinada información.

ALFI BOT busca apoyar este proceso mediante el análisis de contenido y la presentación de resultados que permitan identificar posibles señales de fraude.

**Transición:**  
A partir de este problema desarrollamos una solución tecnológica enfocada en el análisis de contenido financiero.

## 3. Solución propuesta

La solución desarrollada permite al usuario ingresar contenido para analizarlo y obtener un resultado relacionado con posibles riesgos financieros.

El sistema contempla el análisis de diferentes tipos de contenido y utiliza una política de clasificación para organizar los resultados obtenidos.

**Transición:**  
Para implementar esta solución utilizamos diferentes tecnologías tanto en frontend como en backend y base de datos.

## 4. Arquitectura y tecnologías

ALFI BOT está compuesto principalmente por:

- Frontend para la interacción con el usuario.
- Backend desarrollado con Node.js y Express.
- PostgreSQL para el almacenamiento de información.
- API de inteligencia artificial para apoyar el análisis.
- Autenticación para controlar el acceso al sistema.

La separación entre frontend, backend y base de datos permite mantener una estructura organizada y facilitar el mantenimiento del sistema.

**Transición:**  
Con esta arquitectura podemos ejecutar el flujo principal de análisis de ALFI BOT.

## 5. Funcionamiento del sistema

El flujo general es el siguiente:

1. El usuario accede al sistema.
2. Ingresa o selecciona el contenido que desea analizar.
3. El frontend envía la solicitud al backend.
4. El backend procesa y valida la información.
5. Se realiza el análisis correspondiente.
6. El sistema devuelve el resultado al usuario.
7. La información necesaria se registra en PostgreSQL.

**Transición:**  
Además del funcionamiento principal, se incorporaron mecanismos para proteger la información del sistema.

## 6. Seguridad y base de datos

La base de datos de ALFI BOT utiliza PostgreSQL.

Durante el desarrollo se trabajó en mecanismos como:

- Roles y permisos.
- Principio de menor privilegio.
- Auditoría de operaciones.
- Triggers de auditoría.
- Respaldos de la base de datos.
- Pruebas de restauración.
- Respaldo automático programado.

Estas medidas permiten mejorar la protección, disponibilidad y trazabilidad de la información.

**Transición:**  
Una vez implementadas las funcionalidades, también es necesario comprobar que el sistema responda correctamente.

## 7. Pruebas

Se definió una matriz de pruebas funcionales para documentar de forma uniforme las verificaciones realizadas sobre ALFI BOT.

Las pruebas permiten registrar:

- Funcionalidad evaluada.
- Precondiciones.
- Pasos realizados.
- Datos de entrada.
- Resultado esperado.
- Resultado obtenido.
- Estado de la prueba.
- Evidencia.

Esto facilita identificar errores y comprobar el cumplimiento de las funcionalidades desarrolladas.

**Transición:**  
Finalmente, presentamos las principales conclusiones obtenidas durante el desarrollo.

## 8. Conclusiones

ALFI BOT integra frontend, backend, base de datos e inteligencia artificial dentro de una solución enfocada en el análisis de posibles riesgos financieros.

Durante el proyecto se implementaron funcionalidades de análisis, almacenamiento, seguridad, auditoría, respaldo y pruebas.

El desarrollo permitió aplicar de manera práctica los conocimientos adquiridos durante el semestre y trabajar de forma organizada mediante tareas y control de versiones.

## 9. Gestión del proyecto

ALFI BOT fue desarrollado utilizando Scrum como metodología de trabajo.

Para la organización y seguimiento del proyecto se utilizaron:

- Jira para gestionar historias de usuario, tareas, responsables, prioridades y estados.
- Confluence para documentar arquitectura, Scrum, pruebas y evidencias.
- Git y GitHub para el control de versiones mediante ramas, commits y Pull Requests.

Durante el proyecto se registraron actividades correspondientes a Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective.

**Transición:**  
Además del funcionamiento actual del sistema, ALFI BOT contempla una visión de crecimiento a mediano plazo.

## 10. Visión de monetización

ALFI BOT busca mantener su utilidad preventiva para los usuarios.

Como visión de monetización a mediano plazo, el proyecto contempla publicidad basada en tendencias agregadas de uso y riesgo.

Esta estrategia deberá respetar la privacidad de los usuarios y no implicará compartir contraseñas, credenciales ni información personal sensible.

**Transición:**  
Con esto podemos resumir los principales resultados obtenidos durante el desarrollo de ALFI BOT.