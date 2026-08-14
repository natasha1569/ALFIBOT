# AFB-275 — Explicación del Frontend de ALFI BOT

## Objetivo

Preparar la explicación técnica del frontend de ALFI BOT para la sustentación final.

## Tecnología utilizada

El frontend de ALFI BOT está desarrollado con React.

React permite construir la interfaz mediante componentes reutilizables y manejar de forma organizada los cambios de estado de la aplicación.

## Estructura del frontend

El frontend se organiza en páginas, componentes, rutas y servicios.

Entre las principales responsabilidades del frontend se encuentran:

- Mostrar la interfaz al usuario.
- Gestionar formularios.
- Validar datos antes de enviarlos al backend.
- Consumir la API REST.
- Mostrar resultados de análisis.
- Controlar la navegación.
- Mostrar funcionalidades según el rol del usuario.

## Autenticación

El frontend permite:

- Registro de usuarios.
- Inicio de sesión.
- Almacenamiento de la sesión.
- Navegación a páginas protegidas.

La autenticación real es validada por el backend.

## Navegación y roles

La interfaz muestra diferentes opciones dependiendo del tipo de usuario.

Los roles principales son:

- Usuario.
- Auditor.
- Administrador.

Cada rol debe acceder únicamente a las vistas y funciones autorizadas.

## Analizador

El usuario puede analizar diferentes tipos de contenido:

- Texto.
- Enlaces.
- Imágenes.

El frontend envía la información al backend y posteriormente muestra el resultado obtenido.

## Resultados

El sistema presenta al usuario información como:

- Nivel de riesgo.
- Resumen del análisis.
- Señales detectadas.
- Recomendaciones preventivas.
- Categoría relacionada con el fraude cuando corresponde.

## Historial

El frontend permite consultar los análisis almacenados del usuario.

El historial utiliza información persistida en PostgreSQL mediante los servicios del backend.

## Funciones para compartir

Desde los resultados se pueden utilizar funciones como:

- Generación de PDF.
- Compartir mediante WhatsApp Web.
- Copiar información al portapapeles.

## Experiencia de usuario

El frontend busca mantener una navegación clara y sencilla.

Se utilizan:

- Formularios con validaciones.
- Mensajes de error.
- Indicadores de carga.
- Navegación según sesión.
- Vistas adaptadas al rol.
- Componentes reutilizables.

## Integración con el backend

La comunicación entre frontend y backend se realiza mediante solicitudes HTTP a la API REST.

Flujo general:

1. El usuario realiza una acción.
2. React obtiene los datos del formulario.
3. Se envía la solicitud al backend.
4. El backend procesa la petición.
5. Se recibe una respuesta JSON.
6. El frontend actualiza la interfaz con el resultado.

## Puntos principales para la sustentación

Durante la presentación se debe explicar:

1. Por qué se utilizó React.
2. Cómo está organizada la interfaz.
3. Cómo funcionan las rutas.
4. Cómo se gestiona la sesión.
5. Cómo se consumen los endpoints del backend.
6. Cómo se muestran los resultados.
7. Cómo se controla la navegación según el rol.
8. Cómo se reutilizan componentes.
9. Cómo se manejan validaciones y errores.

## Conclusión

El frontend de ALFI BOT permite al usuario interactuar con las funcionalidades del sistema de forma organizada.

React facilita la creación de componentes reutilizables, la gestión de estados y la integración con la API REST del backend.