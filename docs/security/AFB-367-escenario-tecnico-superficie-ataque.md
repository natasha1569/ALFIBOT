# AFB-367 — Escenario técnico y superficie de ataque de PostgreSQL

## 1. Objetivo

Documentar el escenario técnico real de ALFI BOT en relación con PostgreSQL, identificando los activos de información, los componentes que acceden a la base de datos, los puntos de entrada y las principales superficies de ataque que deben ser consideradas dentro del Plan de Políticas de Seguridad en Bases de Datos.

Esta subtarea es exclusivamente documental. No modifica todavía permisos, cifrado, hardening ni configuración de PostgreSQL. Esos controles se implementarán o documentarán en las subtareas posteriores del plan de seguridad.

## 2. Escenario técnico actual

ALFI BOT utiliza una arquitectura web compuesta por:

- Frontend desarrollado con React y Vite.
- Backend desarrollado con Node.js y Express.
- PostgreSQL como motor de base de datos relacional.
- OpenAI como servicio externo para el análisis preventivo de posibles fraudes financieros.
- Variables de entorno para la configuración de credenciales y servicios.

El flujo principal relacionado con la base de datos es:

```text
Usuario
  |
  v
Frontend React
  |
  | HTTP / JSON
  v
Backend Express
  |
  | consultas mediante pg.Pool
  v
PostgreSQL
```

El frontend no debe conectarse directamente a PostgreSQL. El acceso a la base se realiza desde el backend mediante el módulo de conexión centralizado.

## 3. Configuración de conexión a PostgreSQL

El backend mantiene una conexión reutilizable mediante `pg.Pool`.

Los datos de conexión se obtienen desde variables de entorno:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

La contraseña de PostgreSQL no está escrita directamente en el archivo de configuración de la aplicación. El código espera obtenerla desde el entorno de ejecución.

La configuración actual no declara una opción SSL/TLS en el objeto de conexión. La política de cifrado en tránsito se analizará específicamente en AFB-368.

## 4. Activos de información identificados

Los principales activos que deben protegerse son:

### 4.1 Datos de usuarios

Incluyen información de registro y autenticación, como:

- nombre;
- correo electrónico;
- celular;
- rol;
- estado de la cuenta;
- hash de contraseña;
- fechas de registro y actualización.

El `password_hash` se considera un dato especialmente sensible y no debe exponerse en respuestas, reportes ni registros de auditoría.

### 4.2 Análisis de fraude

La base almacena información asociada a los análisis realizados por los usuarios, incluyendo:

- tipo de contenido analizado;
- contenido enviado;
- vista previa;
- nivel de riesgo;
- resumen;
- fecha de creación;
- relación con el usuario que realizó el análisis.

Este contenido puede incluir información suministrada voluntariamente por el usuario y debe tratarse como información de aplicación protegida.

### 4.3 Señales de alerta y recomendaciones

Las señales y recomendaciones se relacionan con cada análisis y forman parte del resultado generado por ALFI BOT.

### 4.4 Información de auditoría

La información de auditoría representa evidencia sobre operaciones realizadas en la base de datos. Debe protegerse frente a modificación o eliminación no autorizada porque su finalidad es proporcionar trazabilidad.

### 4.5 Credenciales y secretos de configuración

Se consideran activos críticos:

- credenciales de PostgreSQL;
- clave de OpenAI;
- claves o secretos de autenticación;
- cualquier archivo `.env` usado en el entorno local o de despliegue.

Estos valores no deben formar parte de commits, capturas públicas ni documentación con credenciales reales.

## 5. Puntos de acceso a la base de datos

### 5.1 Backend Express

El backend es el principal punto autorizado de acceso a PostgreSQL.

La aplicación centraliza la conexión en:

```text
backend/src/config/database.js
```

y reutiliza el pool de conexiones para ejecutar consultas.

### 5.2 Rutas de autenticación

Las rutas bajo:

```text
/api/auth
```

interactúan con información de usuarios y credenciales.

Estas rutas constituyen una superficie de ataque relevante debido a intentos de:

- registro de datos inválidos;
- autenticación con credenciales robadas;
- enumeración de usuarios;
- ataques contra contraseñas;
- manipulación de parámetros.

### 5.3 Rutas de análisis

Las rutas bajo:

```text
/api/analysis
```

están protegidas actualmente por middleware de autenticación.

Estas rutas pueden consultar y modificar información asociada al usuario autenticado.

### 5.4 Endpoints de diagnóstico actualmente expuestos

El servidor contiene actualmente endpoints de diagnóstico:

```text
GET /api/database/test
GET /api/database/analisis
```

Estos endpoints no se encuentran detrás del middleware de autenticación en la configuración actual del servidor.

`/api/database/test` devuelve información sobre la base actual y el usuario PostgreSQL utilizado por la conexión.

`/api/database/analisis` ejecuta una consulta directa sobre `alfi.analisis`.

Por lo tanto, ambos endpoints se identifican como una superficie de ataque real que debe revisarse en las actividades posteriores de seguridad. Esta subtarea únicamente registra el hallazgo; no modifica todavía dichos endpoints.

## 6. Superficie de ataque identificada

### 6.1 Credenciales de base de datos

**Riesgo:** exposición accidental de usuario o contraseña de PostgreSQL.

**Vectores posibles:**

- versionar archivos `.env`;
- compartir capturas con credenciales;
- incluir contraseñas en scripts SQL;
- reutilizar credenciales administrativas en la aplicación.

**Tratamiento posterior:** RBAC, mínimo privilegio y gestión segura de secretos.

### 6.2 Endpoints de diagnóstico sin protección

**Riesgo:** exposición de información técnica o datos sin autenticación.

**Componentes identificados:**

- `/api/database/test`;
- `/api/database/analisis`.

**Tratamiento posterior:** restringir, eliminar o proteger estos endpoints como parte del hardening de la aplicación y la base de datos.

### 6.3 Exceso de privilegios del usuario PostgreSQL de la aplicación

**Riesgo:** si el backend utiliza un usuario con permisos administrativos, una vulnerabilidad de la aplicación puede producir un impacto mayor sobre la base.

**Tratamiento posterior:** AFB-151 debe aplicar el principio de mínimo privilegio y separar las capacidades administrativas, operativas y de auditoría.

### 6.4 Inyección SQL

**Riesgo:** manipulación de consultas mediante entradas controladas por el usuario.

**Superficie:** cualquier endpoint que construya consultas SQL a partir de datos recibidos desde HTTP.

**Política:** las consultas que incorporen valores de usuario deben utilizar parámetros y no concatenación directa.

La revisión exhaustiva del código frente a este riesgo forma parte del proceso de hardening.

### 6.5 Acceso no autorizado a información de otros usuarios

**Riesgo:** que un usuario autenticado consulte, modifique o elimine registros pertenecientes a otra cuenta.

**Tratamiento:** controles de autorización en backend y filtros por usuario, complementados con mínimo privilegio en PostgreSQL cuando corresponda.

### 6.6 Exposición de información sensible en errores

**Riesgo:** devolver al cliente mensajes internos de PostgreSQL, nombres de tablas, consultas, rutas locales o información de infraestructura.

El servidor ya dispone de un manejador general de errores, pero los endpoints de diagnóstico deben revisarse porque actualmente pueden devolver `error.message`.

### 6.7 Comunicación sin cifrado con PostgreSQL

La configuración actual del pool no declara SSL/TLS.

En un entorno local esto puede mantenerse como una limitación controlada para desarrollo; en un despliegue remoto, la ausencia de cifrado en tránsito sería un riesgo relevante.

La definición de la política correspondiente se realizará en AFB-368.

### 6.8 Manipulación o eliminación de registros de auditoría

**Riesgo:** que una cuenta con privilegios excesivos pueda alterar evidencia de operaciones.

La política de roles debe limitar quién puede consultar o modificar la información de auditoría.

### 6.9 Disponibilidad de la base de datos

**Riesgos principales:**

- eliminación accidental;
- corrupción de datos;
- fallo del equipo;
- pérdida de la base local;
- migraciones defectuosas.

Los controles de respaldo, restauración, RPO y RTO se documentan y prueban en las actividades específicas de disponibilidad.

## 7. Actores y nivel de confianza

| Actor / componente | Nivel de confianza | Acceso esperado |
| --- | --- | --- |
| Usuario final | No confiable por defecto | API pública y funciones autorizadas |
| Usuario autenticado | Parcialmente confiable | Sus propios análisis y perfil |
| Backend Express | Componente confiable controlado | Acceso limitado a PostgreSQL |
| Administrador | Alto privilegio | Administración autorizada |
| Auditor | Lectura especializada | Auditoría y reportes |
| PostgreSQL | Activo crítico | Solo conexiones autorizadas |
| OpenAI | Servicio externo | Recibe únicamente la información necesaria para el análisis |

La confianza en un actor no reemplaza la aplicación de controles de autenticación, autorización y mínimo privilegio.

## 8. Límites de confianza

Se identifican los siguientes límites:

```text
Internet / usuario
        |
        | límite 1
        v
Frontend
        |
        | límite 2
        v
API Express
        |
        | límite 3
        v
PostgreSQL

API Express
        |
        | límite 4
        v
OpenAI
```

Cada límite representa un punto donde los datos deben ser validados y donde debe existir un control explícito de acceso o comunicación.

## 9. Controles ya existentes observables

Actualmente el proyecto ya dispone de algunos controles que reducen la superficie de ataque:

- configuración de PostgreSQL mediante variables de entorno;
- conexión centralizada mediante `pg.Pool`;
- middleware de autenticación para las rutas de análisis;
- hash de contraseñas en lugar de almacenamiento en texto plano;
- restricciones de integridad implementadas a nivel de base de datos;
- estructura de auditoría desarrollada previamente;
- separación entre frontend y acceso directo a PostgreSQL.

Estos controles no implican que el escenario sea completamente seguro. El plan de seguridad continuará con RBAC, cifrado, hardening, respaldo y consolidación de evidencias.

## 10. Controles pendientes identificados

A partir de esta revisión se registran como pendientes o sujetos a validación:

1. eliminar definitivamente el rol de aplicación `analista` que ya no forma parte del alcance final;
2. definir roles PostgreSQL consistentes con administrador, auditor y usuario/aplicación;
3. validar mínimo privilegio para la cuenta utilizada por Express;
4. revisar los endpoints `/api/database/test` y `/api/database/analisis`;
5. definir la política de SSL/TLS para conexiones remotas;
6. evitar cualquier credencial real dentro de scripts SQL versionados;
7. revisar configuración de PostgreSQL y superficie de red como parte del hardening;
8. consolidar pruebas de acceso permitido y denegado;
9. mantener respaldo y restauración verificables;
10. proteger la integridad de la información de auditoría.

## 11. Resultado de AFB-367

La revisión establece una línea base de seguridad para ALFI BOT.

El principal activo técnico es PostgreSQL y su acceso debe realizarse exclusivamente desde componentes autorizados. La superficie de ataque no se limita al motor de base de datos: incluye las rutas HTTP que consultan datos, las credenciales utilizadas por el backend, los permisos del usuario PostgreSQL, los archivos de configuración, los mecanismos de auditoría y las comunicaciones entre componentes.

Los hallazgos de esta subtarea serán utilizados como entrada para:

- AFB-151 — Implementar RBAC en el motor de base de datos.
- AFB-368 — Documentar política de cifrado en reposo y en tránsito.
- AFB-369 — Documentar e implementar hardening y gestión de vulnerabilidades.
- AFB-370 — Consolidar evidencias de RBAC, auditoría y respaldos.
- AFB-371 — Consolidar archivo SQL de seguridad.
- AFB-372 — Elaborar documento final del Plan de Seguridad.
