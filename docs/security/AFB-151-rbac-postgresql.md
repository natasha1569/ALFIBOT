# AFB-151 — RBAC y mínimo privilegio en PostgreSQL

## 1. Objetivo

Implementar y demostrar un esquema de Control de Acceso Basado en Roles (RBAC) para el motor PostgreSQL de ALFI BOT, aplicando el Principio de Mínimo Privilegio.

La implementación está alineada con el criterio 1.6 de la rúbrica del Proyecto Integrador: diseñar e implementar seguridad de acceso al motor mediante RBAC y mínimo privilegio.

## 2. Modelo definitivo

ALFI BOT utiliza tres perfiles funcionales:

| Perfil | Rol PostgreSQL NOLOGIN | Propósito |
| --- | --- | --- |
| Administrador | `rol_alfi_admin` | Administración funcional de ALFI BOT sin privilegios administrativos del motor |
| Auditor | `rol_alfi_auditor` | Consulta de auditoría y reportería en solo lectura |
| Usuario | `rol_alfi_usuario` | Operaciones normales de un usuario de ALFI ejecutadas por el backend |

Cuando existen cuentas LOGIN técnicas para pruebas, su nomenclatura es:

- `alfi_admin`;
- `alfi_auditor`;
- `alfi_usuario`.

Las cuentas LOGIN heredan permisos desde los roles NOLOGIN. No se versionan contraseñas.

## 3. Decisiones de diseño

### 3.1 Eliminación del concepto `analista`

El perfil `analista` no forma parte del modelo final de ALFI BOT. El script migra la nomenclatura histórica hacia `usuario`, pero reconstruye todos sus privilegios de forma explícita; no conserva automáticamente la matriz anterior.

### 3.2 Eliminación del sufijo `_final`

La palabra `_final` se retira de la nomenclatura técnica. La migración utiliza `ALTER ROLE ... RENAME TO ...` cuando existen los roles históricos, evitando `DROP ROLE`, conservando membresías y reduciendo el riesgo de romper dependencias.

### 3.3 Separación entre usuario final y conexión PostgreSQL

El navegador React no recibe credenciales de PostgreSQL. El usuario final se autentica contra Express y Express accede a PostgreSQL.

Por tanto, `rol_alfi_usuario` representa las capacidades de datos necesarias para las operaciones normales del producto, mientras que la autorización sobre registros propios continúa siendo responsabilidad del backend.

### 3.4 Integridad de auditoría

La tabla `alfi.auditoria` se mantiene fuera de las operaciones normales de escritura de los perfiles RBAC. Administrador y auditor pueden consultarla; el usuario no puede consultarla. Ninguno de los tres recibe `INSERT`, `UPDATE` o `DELETE` directo sobre dicha tabla.

El mecanismo técnico que genera auditoría debe mantenerse separado de estas capacidades ordinarias.

## 4. Matriz de mínimo privilegio

### 4.1 Administrador

| Objeto | Permisos |
| --- | --- |
| `alfi.usuarios` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.roles` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.analisis` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.recomendaciones` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.senales_alerta` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.auditoria` | SELECT |
| vistas de reportería | SELECT |

No recibe `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `BYPASSRLS`, `TRUNCATE`, `TRIGGER` ni `CREATE` sobre el esquema.

### 4.2 Auditor

| Objeto | Permisos |
| --- | --- |
| `alfi.auditoria` | SELECT |
| vistas de reportería | SELECT |

No recibe permisos de escritura sobre tablas operacionales ni auditoría.

### 4.3 Usuario

| Objeto | Permisos |
| --- | --- |
| `alfi.roles` | SELECT |
| `alfi.usuarios` | SELECT, INSERT, UPDATE |
| `alfi.analisis` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.recomendaciones` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.senales_alerta` | SELECT, INSERT, UPDATE, DELETE |
| `alfi.auditoria` | ninguno |
| vistas administrativas/BI | ninguno |

La posibilidad de consultar `usuarios` desde el rol técnico no sustituye la autorización de aplicación. El backend debe filtrar y autorizar las operaciones conforme al usuario autenticado; ese control corresponde al RBAC de aplicación y no se confunde con el RBAC del motor.

## 5. Controles de seguridad del script

`backend/sql/AFB-151-rbac.sql` fue diseñado para no ejecutar una migración destructiva:

1. valida que exista el esquema `alfi`;
2. valida las seis tablas requeridas;
3. aborta si encuentra simultáneamente un nombre histórico y su nombre definitivo;
4. aborta si la sesión está conectada con una cuenta que debe renombrarse;
5. no ejecuta `DROP ROLE`;
6. no elimina ni reconstruye tablas;
7. no almacena contraseñas;
8. reconstruye permisos mediante `REVOKE` + `GRANT` explícitos;
9. ejecuta validaciones automáticas antes de confirmar la transacción;
10. si una validación interna produce una excepción antes del `COMMIT`, PostgreSQL revierte la transacción.

## 6. Procedimiento de ejecución

### 6.1 Antes de ejecutar

1. Trabajar sobre una copia/entorno de desarrollo de `alfi_bot_db_final`.
2. Confirmar que el backend no está realizando operaciones de escritura durante la migración.
3. Conectarse en pgAdmin con la cuenta propietaria/administrativa que actualmente gestiona los objetos de `alfi`.
4. No conectarse con `alfi_admin_final`, `alfi_analista_final` o `alfi_auditor_final` durante el renombrado.

### 6.2 Ejecutar

Abrir y ejecutar completo:

```text
backend/sql/AFB-151-rbac.sql
```

El script utiliza una transacción para la fase de modificación y posteriormente emite consultas de evidencia.

### 6.3 Evidencia requerida

Guardar o capturar los resultados de:

- inventario final de roles;
- consulta que demuestra ausencia de `analista` y `_final`;
- membresías LOGIN -> NOLOGIN;
- matriz real de privilegios;
- matriz de pruebas positivas y negativas.

AFB-151 solo debe marcarse como finalizada cuando todas las pruebas esperadas coincidan con los resultados reales.

## 7. Nota sobre contraseñas y renombrado

El repositorio no debe contener credenciales. El script reutiliza las cuentas LOGIN existentes mediante renombrado.

Después de la migración debe comprobarse que las credenciales técnicas siguen siendo válidas en el entorno. Si PostgreSQL utilizara un hash de contraseña cuyo comportamiento se vea afectado por el cambio de nombre, la contraseña debe rotarse fuera del repositorio mediante un mecanismo administrativo seguro.

Esta comprobación evita convertir una mejora de nomenclatura en una interrupción de acceso.

## 8. Evidencia de cumplimiento de AFB-151

La tarea Jira exige:

1. rol administrador;
2. rol de aplicación/operación normal;
3. rol de reportes/auditoría;
4. mínimo privilegio;
5. permisos probados;
6. roles documentados.

La nomenclatura del proyecto concreta esos tres perfiles como Administrador, Usuario y Auditor. El significado técnico de los criterios se conserva: separación de responsabilidades, control de acceso y mínimo privilegio.

## 9. Límites de alcance

AFB-151 no implementa por sí sola:

- autorización HTTP por rol funcional;
- aislamiento por propietario a nivel de filas;
- nuevas vistas BI;
- nuevos campos de perfil comercial;
- términos y condiciones;
- backup/RPO/RTO;
- revalidación de triggers de auditoría.

Esos componentes se mantienen en sus tareas Jira correspondientes para conservar trazabilidad de commits y Pull Requests.

## 10. Resultado esperado

Después de ejecutar y validar el script, PostgreSQL debe mostrar exclusivamente la nomenclatura RBAC definitiva de ALFI BOT:

```text
rol_alfi_admin
rol_alfi_auditor
rol_alfi_usuario

alfi_admin
alfi_auditor
alfi_usuario
```

Los roles NOLOGIN deben carecer de atributos administrativos del motor y cada perfil debe disponer únicamente de los permisos definidos en la matriz anterior.
