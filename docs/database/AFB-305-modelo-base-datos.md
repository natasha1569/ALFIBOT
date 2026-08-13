# AFB-305 — Modelo de Base de Datos de ALFI BOT

## 1. Objetivo

Documentar el modelo de base de datos utilizado en ALFI BOT, describiendo las principales entidades, sus relaciones, restricciones y mecanismos de auditoría implementados en PostgreSQL.

## 2. Motor de base de datos

ALFI BOT utiliza PostgreSQL como sistema gestor de base de datos relacional.

La información se organiza mediante tablas relacionadas utilizando claves primarias y claves foráneas, permitiendo mantener la integridad y consistencia de los datos.

## 3. Entidades principales

### Roles

La entidad `roles` permite definir los diferentes niveles de acceso utilizados dentro del sistema.

Su objetivo es controlar los permisos y responsabilidades de los usuarios.

Ejemplos de roles:

- Usuario.
- Administrador.
- Auditor.

### Usuarios

La entidad `usuarios` almacena la información correspondiente a las personas registradas en ALFI BOT.

Contiene la información necesaria para identificar al usuario y gestionar su acceso al sistema.

Cada usuario puede estar asociado a un rol.

### Análisis

La entidad `analisis` registra los análisis realizados mediante ALFI BOT.

Permite almacenar información relacionada con el contenido analizado y el resultado obtenido por el sistema.

Los análisis pueden corresponder a:

- Texto.
- Enlaces.
- Imágenes.

Cada análisis se encuentra relacionado con el usuario que realizó la consulta.

### Señales de alerta

La entidad `senales_alerta` permite registrar señales o indicadores detectados durante el análisis de contenido.

Estas señales ayudan a identificar características que podrían representar un posible fraude financiero.

### Recomendaciones

La entidad `recomendaciones` almacena recomendaciones preventivas proporcionadas por el sistema.

Estas recomendaciones permiten orientar al usuario después de realizar un análisis y ayudan a tomar decisiones frente a contenido potencialmente fraudulento.

### Auditoría

La entidad `auditoria` permite registrar operaciones importantes realizadas sobre la base de datos.

El registro de auditoría permite conservar información relacionada con:

- Tabla afectada.
- Tipo de operación.
- Identificador del registro.
- Usuario de base de datos.
- Datos anteriores.
- Datos nuevos.
- Fecha de la operación.

Las principales operaciones registradas son:

- INSERT.
- UPDATE.
- DELETE.

## 4. Relaciones principales

El modelo mantiene relaciones entre las diferentes entidades del sistema.

Las relaciones principales son:

- Un rol puede estar relacionado con varios usuarios.
- Un usuario puede realizar varios análisis.
- Un análisis puede contener diferentes señales de alerta.
- Un análisis puede generar recomendaciones.
- Las operaciones realizadas sobre información importante pueden generar registros de auditoría.

De forma simplificada:

`roles` → `usuarios` → `analisis`

`analisis` → `senales_alerta`

`analisis` → `recomendaciones`

Operaciones del sistema → `auditoria`

## 5. Claves y restricciones

La base de datos utiliza diferentes mecanismos para garantizar la integridad de la información.

### Claves primarias

Cada entidad posee un identificador único que permite diferenciar sus registros.

### Claves foráneas

Las claves foráneas permiten establecer relaciones entre las tablas y mantener la integridad referencial.

### Restricciones UNIQUE

Se utilizan en campos que no deben repetirse, como determinados datos utilizados para identificar usuarios.

### Restricciones CHECK

Permiten validar que determinados valores almacenados cumplan las condiciones establecidas por el sistema.

### NOT NULL

Se utiliza en los campos obligatorios para evitar registros incompletos.

## 6. Auditoría mediante triggers

ALFI BOT cuenta con mecanismos de auditoría implementados en PostgreSQL.

Se utilizan triggers para registrar automáticamente operaciones realizadas sobre tablas importantes.

Entre los triggers implementados se encuentran:

- `trg_auditoria_usuarios`
- `trg_auditoria_analisis`
- `trg_auditoria_recomendaciones`

Estos triggers permiten registrar operaciones INSERT, UPDATE y DELETE sin depender de que el usuario realice el registro manualmente.

## 7. Función de auditoría

La función de auditoría registra información relacionada con los cambios realizados en la base de datos.

Entre los datos registrados se encuentran:

- Operación realizada.
- Tabla afectada.
- Registro afectado.
- Usuario que ejecutó la operación.
- Información anterior.
- Información nueva.
- Fecha de ejecución.

Esto proporciona trazabilidad sobre las modificaciones realizadas en el sistema.

## 8. Seguridad e integridad

El modelo de base de datos contribuye a la seguridad de ALFI BOT mediante:

- Uso de roles.
- Control de permisos.
- Integridad referencial.
- Restricciones de datos.
- Auditoría automática.
- Registro de operaciones.
- Separación de responsabilidades.

Estas medidas ayudan a proteger la información almacenada y permiten identificar cambios realizados sobre datos importantes.

## 9. Estructura general

La estructura general del modelo puede representarse de la siguiente manera:

| Entidad | Propósito principal |
| --- | --- |
| `roles` | Gestionar los roles y niveles de acceso |
| `usuarios` | Almacenar los usuarios registrados |
| `analisis` | Registrar los análisis realizados |
| `senales_alerta` | Registrar indicadores detectados |
| `recomendaciones` | Almacenar recomendaciones preventivas |
| `auditoria` | Registrar cambios y operaciones sobre los datos |

## 10. Conclusión

El modelo de base de datos de ALFI BOT permite organizar la información necesaria para gestionar usuarios, análisis, señales de alerta, recomendaciones y registros de auditoría.

El uso de PostgreSQL, relaciones, restricciones y triggers permite mantener la integridad de los datos y proporcionar trazabilidad sobre las operaciones realizadas en el sistema.