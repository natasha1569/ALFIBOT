# AFB-279 — Explicación del Backend de ALFI BOT

## Objetivo

Preparar la explicación técnica del backend de ALFI BOT para la sustentación final, describiendo su arquitectura, API REST, autenticación, autorización, integración con PostgreSQL y procesamiento de análisis.

## Tecnología utilizada

El backend de ALFI BOT está desarrollado con:

- Node.js.
- Express.
- PostgreSQL.
- JWT para autenticación.
- Servicios para el procesamiento de análisis.
- Integración con OpenAI para apoyar el análisis de contenido.

## Función del backend

El backend funciona como intermediario entre el frontend, la base de datos y los servicios externos utilizados por ALFI BOT.

Sus principales responsabilidades son:

- Recibir solicitudes del frontend.
- Validar los datos recibidos.
- Autenticar usuarios.
- Autorizar acciones según el rol.
- Procesar solicitudes de análisis.
- Comunicarse con servicios externos.
- Guardar información en PostgreSQL.
- Consultar el historial.
- Gestionar funciones administrativas.
- Manejar errores.

## API REST

El frontend se comunica con el backend mediante una API REST.

Las solicitudes HTTP permiten realizar operaciones sobre diferentes módulos del sistema.

Entre las rutas principales se encuentran las relacionadas con:

- Autenticación.
- Usuarios.
- Análisis.
- Historial.
- Administración.
- Reportería.

El backend recibe la petición, ejecuta la lógica correspondiente y devuelve una respuesta al frontend.

## Flujo de una solicitud

El flujo general es:

1. El usuario realiza una acción en React.
2. El frontend envía una solicitud HTTP.
3. Express recibe la petición.
4. Se ejecutan las validaciones correspondientes.
5. Cuando la ruta es protegida, se verifica la autenticación.
6. Se comprueba la autorización cuando la operación depende de un rol.
7. El controlador o servicio ejecuta la lógica necesaria.
8. Se consulta o modifica PostgreSQL cuando corresponde.
9. El backend devuelve una respuesta.
10. React muestra el resultado al usuario.

## Autenticación

ALFI BOT utiliza JWT para manejar la autenticación.

Después de un inicio de sesión válido, el sistema genera la información necesaria para mantener la sesión autenticada.

Las rutas protegidas verifican la autenticación antes de permitir el acceso.

El JWT no debe almacenar contraseñas.

## Autorización y roles

Además de comprobar que el usuario esté autenticado, determinadas operaciones requieren verificar su rol.

El sistema contempla funciones diferenciadas para:

- Usuario.
- Auditor.
- Administrador.

El backend es responsable de impedir que un usuario ejecute operaciones para las cuales no posee autorización.

## Middleware

Express permite utilizar middleware para ejecutar lógica antes de llegar al controlador final.

En ALFI BOT se utiliza para funciones como:

- Procesamiento de JSON.
- CORS.
- Autenticación.
- Autorización.
- Manejo de rutas.
- Manejo global de errores.

## Análisis de contenido

El backend permite procesar diferentes tipos de contenido.

Los tipos principales son:

- Texto.
- Enlace.
- Imagen.

Antes de procesar la solicitud se realizan validaciones sobre los datos recibidos.

Después del procesamiento se devuelve al frontend información preventiva relacionada con el análisis.

## Resultado del análisis

El resultado puede incluir información como:

- Nivel de riesgo.
- Resumen.
- Señales detectadas.
- Recomendaciones.
- Información relacionada con la categoría de fraude cuando corresponde.

Los resultados necesarios pueden almacenarse posteriormente en PostgreSQL.

## Integración con OpenAI

ALFI BOT utiliza un servicio de inteligencia artificial para apoyar el análisis del contenido.

La integración se realiza desde el backend y no directamente desde el navegador.

Esto permite mantener separada la lógica del servicio y evitar exponer información sensible de configuración en el frontend.

## Integración con PostgreSQL

El backend se conecta con PostgreSQL para manejar la información persistente.

La base de datos permite almacenar y consultar información relacionada con:

- Usuarios.
- Análisis.
- Historial.
- Señales.
- Recomendaciones.
- Auditoría.
- Información administrativa.

## Validaciones

El backend valida los datos recibidos antes de procesarlos.

Estas validaciones permiten:

- Rechazar solicitudes incompletas.
- Evitar tipos de análisis no permitidos.
- Controlar datos incorrectos.
- Limitar entradas cuando corresponde.
- Evitar operaciones no autorizadas.

Las validaciones del backend son necesarias incluso cuando el frontend también valida formularios.

## Manejo de errores

El backend debe devolver respuestas controladas cuando ocurre un problema.

Se contemplan situaciones como:

- Datos inválidos.
- Usuario no autenticado.
- Usuario sin permisos.
- Recurso inexistente.
- Error durante el análisis.
- Error de base de datos.
- Ruta inexistente.

El manejo global de errores ayuda a evitar respuestas inconsistentes.

## Seguridad

Entre los mecanismos utilizados se encuentran:

- JWT.
- Protección de rutas.
- Autorización por rol.
- Validaciones.
- Variables de entorno.
- Manejo controlado de errores.
- Integración con PostgreSQL.
- Separación entre frontend y secretos del servidor.

El archivo `.env` no debe versionarse en el repositorio público.

## Pruebas

El backend cuenta con pruebas automatizadas.

En la validación final realizada se obtuvo:

- 31 de 31 pruebas del backend aprobadas.
- 0 pruebas fallidas en la suite del backend.
- Conexión con PostgreSQL correcta durante las pruebas correspondientes.

Estas pruebas permiten comprobar diferentes partes de la lógica antes de la entrega.

## Puntos principales para la sustentación

Durante la presentación se debe explicar:

1. Por qué se utilizó Node.js y Express.
2. Qué es una API REST.
3. Cómo se comunica React con Express.
4. Cómo funciona JWT.
5. Cómo se protegen las rutas.
6. Cómo se controlan los roles.
7. Para qué sirven los middleware.
8. Cómo se procesa un análisis.
9. Cómo se integra OpenAI.
10. Cómo se conecta el backend con PostgreSQL.
11. Qué validaciones existen.
12. Cómo se manejan los errores.
13. Cómo se comprobó el funcionamiento del backend.

## Conclusión

El backend de ALFI BOT concentra la lógica principal de la aplicación y permite conectar el frontend con PostgreSQL y los servicios utilizados para el análisis.

Express permite organizar las rutas, middleware, controladores y servicios, mientras que la autenticación y autorización ayudan a proteger las funcionalidades del sistema.