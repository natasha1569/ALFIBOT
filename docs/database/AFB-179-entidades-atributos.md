# AFB-179 — Identificar entidades y atributos del dominio

## Objetivo
Identificar las entidades principales de ALFI BOT y los atributos necesarios para representar la persistencia del sistema.

## Entidades identificadas

### 1. roles
Representa los roles disponibles para controlar el acceso de los usuarios.

Atributos:
- `rol_id` — identificador único.
- `nombre` — nombre del rol.
- `descripcion` — descripción del rol.

### 2. usuarios
Representa a los usuarios registrados en ALFI BOT.

Atributos:
- `usuario_id` — identificador único.
- `rol_id` — rol asignado al usuario.
- `nombre` — nombre del usuario.
- `correo` — correo electrónico.
- `password_hash` — contraseña almacenada de forma segura.
- `activo` — indica si el usuario está activo.
- `fecha_registro` — fecha de creación del registro.
- `celular` — número de celular.
- `fecha_actualizacion` — última actualización.
- `provincia` — provincia del usuario.
- `rango_edad` — rango de edad.
- `terminos_aceptados` — aceptación de términos.
- `terminos_aceptados_en` — fecha de aceptación.
- `terminos_version` — versión de términos aceptada.

### 3. analisis
Registra cada análisis realizado por un usuario.

Atributos:
- `analisis_id` — identificador único.
- `usuario_id` — usuario que realizó el análisis.
- `tipo` — tipo de contenido: texto, enlace o imagen.
- `contenido` — contenido recibido.
- `vista_previa` — resumen visual corto.
- `nivel_riesgo` — bajo, medio o alto.
- `resumen` — resultado resumido.
- `permitido` — indica si el análisis fue permitido.
- `fecha_creacion` — fecha del análisis.
- `categoria_fraude` — categoría detectada.

### 4. senales_alerta
Almacena las señales de riesgo detectadas durante un análisis.

Atributos:
- `senal_id` — identificador único.
- `analisis_id` — análisis asociado.
- `descripcion` — descripción de la señal.
- `orden` — posición de presentación.

### 5. recomendaciones
Almacena recomendaciones preventivas asociadas a un análisis.

Atributos:
- `recomendacion_id` — identificador único.
- `analisis_id` — análisis asociado.
- `descripcion` — recomendación.
- `orden` — posición de presentación.

### 6. auditoria
Registra operaciones relevantes realizadas sobre la base de datos.

Atributos:
- `auditoria_id` — identificador único.
- `tabla` — tabla afectada.
- `operacion` — INSERT, UPDATE o DELETE.
- `registro_id` — identificador del registro afectado.
- `usuario_bd` — usuario de PostgreSQL que ejecutó la operación.
- `fecha_operacion` — fecha del cambio.
- `datos_anteriores` — valores anteriores.
- `datos_nuevos` — valores posteriores.

### 7. intereses_financieros
Catálogo de intereses financieros usados en el perfil de usuario.

Atributos:
- `interes_id` — identificador único.
- `codigo` — código interno.
- `nombre` — nombre del interés.
- `activo` — estado del interés.
- `fecha_creacion` — fecha de creación.

### 8. usuario_intereses_financieros
Tabla intermedia que relaciona usuarios con intereses financieros.

Atributos:
- `usuario_id` — usuario relacionado.
- `interes_id` — interés relacionado.
- `fecha_registro` — fecha en que se registró la relación.

## Resultado
Las entidades identificadas cubren autenticación y roles, usuarios, análisis de contenido, señales detectadas, recomendaciones, auditoría e intereses financieros. El modelo corresponde al esquema PostgreSQL real de ALFI BOT.
