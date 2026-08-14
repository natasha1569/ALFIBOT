# AFB-278 — Explicación de la Base de Datos de ALFI BOT

## Objetivo

Preparar la explicación técnica de PostgreSQL y del modelo de datos de ALFI BOT para la sustentación final.

## Motor de base de datos

ALFI BOT utiliza PostgreSQL como sistema gestor de base de datos relacional.

PostgreSQL fue seleccionado porque permite trabajar con información estructurada, relaciones entre entidades, restricciones de integridad, auditoría, vistas, roles y permisos.

## Modelo de datos

La base de datos organiza la información principal del sistema mediante diferentes entidades relacionadas.

Entre las entidades relevantes se encuentran:

- Usuarios.
- Análisis.
- Señales.
- Recomendaciones.
- Información relacionada con categorías de fraude.
- Registros de auditoría.

Las relaciones permiten conservar la integridad de la información y vincular los resultados generados por cada análisis.

## Claves primarias y foráneas

Las tablas utilizan claves primarias para identificar de forma única cada registro.

También se utilizan claves foráneas para relacionar las entidades entre sí.

Por ejemplo:

- Un usuario puede tener varios análisis.
- Un análisis puede tener varias señales.
- Un análisis puede tener varias recomendaciones.

## Restricciones de integridad

La base de datos utiliza restricciones para evitar información inválida.

Se incluyen mecanismos como:

- PRIMARY KEY.
- FOREIGN KEY.
- UNIQUE.
- CHECK.
- DEFAULT.

Estas restricciones complementan las validaciones realizadas en el frontend y backend.

## Auditoría

ALFI BOT incluye mecanismos de auditoría para registrar cambios realizados sobre entidades importantes.

La auditoría permite conservar información como:

- Tabla afectada.
- Tipo de operación.
- Identificador del registro.
- Usuario de base de datos.
- Datos anteriores.
- Datos nuevos.
- Fecha de la operación.

Se utilizan triggers para registrar operaciones como INSERT, UPDATE y DELETE.

## Vistas y reportería

PostgreSQL también se utiliza para generar información agregada mediante vistas.

Las vistas permiten consultar datos de manera organizada y apoyar funciones de reportería.

Estas consultas pueden mostrar información relacionada con:

- Cantidad de análisis.
- Categorías o tipos de riesgo.
- Resultados agregados.
- Información útil para auditoría y administración.

## Control de acceso basado en roles

La base de datos incorpora un esquema de seguridad basado en roles.

El objetivo es aplicar el principio de mínimo privilegio, donde cada rol recibe únicamente los permisos necesarios.

Los permisos se administran mediante mecanismos como:

- Roles PostgreSQL.
- GRANT.
- REVOKE.
- Privilegios sobre tablas, secuencias y vistas.

## Seguridad de los datos

La seguridad del sistema se complementa con:

- Autenticación en la aplicación.
- Control de acceso según rol.
- Variables de entorno para datos sensibles.
- Auditoría de operaciones.
- Permisos en PostgreSQL.
- Separación entre usuarios de aplicación y administración.

## Respaldo y restauración

La estrategia de continuidad contempla:

- Generación de respaldos de PostgreSQL.
- Definición de RPO.
- Definición de RTO.
- Restauración del respaldo en una base de datos de prueba.
- Comparación de la estructura restaurada con la base original.

La evidencia de respaldo y restauración debe presentarse únicamente cuando la prueba haya sido ejecutada realmente.

## RPO y RTO

### RPO

El Recovery Point Objective representa la cantidad máxima de información que el sistema podría aceptar perder ante una falla.

### RTO

El Recovery Time Objective representa el tiempo máximo esperado para recuperar el servicio después de una interrupción.

Estos valores deben definirse de acuerdo con la criticidad del sistema y demostrarse mediante la estrategia de respaldo y restauración.

## Instalación de la base de datos

El proyecto dispone de scripts SQL para preparar la estructura necesaria de PostgreSQL.

El instalador canónico se encuentra en:

`backend/sql/ALFI_BOT_DATABASE.sql`

Este script sirve como referencia principal para preparar la base de datos del proyecto.

## Puntos principales para la sustentación

Durante la presentación se debe explicar:

1. Por qué se utilizó PostgreSQL.
2. Cómo se organiza el modelo de datos.
3. Qué función cumplen las PK y FK.
4. Qué restricciones existen.
5. Cómo se aplican las reglas de integridad.
6. Cómo funciona la auditoría.
7. Para qué se utilizan los triggers.
8. Cómo funcionan las vistas de reportería.
9. Cómo se implementa RBAC.
10. Qué significa el principio de mínimo privilegio.
11. Cómo se realiza el respaldo.
12. Cómo se realiza la restauración.
13. Qué significan RPO y RTO.

## Conclusión

PostgreSQL cumple un papel central en ALFI BOT porque permite almacenar la información del sistema, mantener relaciones e integridad entre los datos, implementar auditoría, generar reportería y controlar permisos mediante roles.

La base de datos complementa las validaciones del frontend y backend y proporciona mecanismos adicionales de seguridad y trazabilidad.