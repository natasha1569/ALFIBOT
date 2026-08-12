# AFB-311 — Extender modelo de usuarios en PostgreSQL para registro

## Objetivo

Extender el modelo de registro de ALFI BOT sin destruir ni reinterpretar datos
históricos, incorporando información general útil para analítica agregada y
trazabilidad de aceptación de términos.

## Estado previo validado

`alfi.usuarios` contiene nueve columnas:

- `usuario_id`
- `rol_id`
- `nombre`
- `correo`
- `password_hash`
- `activo`
- `fecha_registro`
- `celular`
- `fecha_actualizacion`

También mantiene:

- PK sobre `usuario_id`;
- FK `rol_id -> alfi.roles(rol_id)`;
- UNIQUE sobre `correo`;
- CHECK de nombre, correo, celular y hash.

## Extensión implementada

Se añaden a `alfi.usuarios`:

- `provincia`;
- `rango_edad`;
- `terminos_aceptados`;
- `terminos_aceptados_en`;
- `terminos_version`.

Los campos permanecen `NULL` para registros históricos. No se presume ni se
inventa una aceptación retroactiva de términos.

## Intereses financieros

Los intereses no se almacenan como texto concatenado dentro de `usuarios`.
Se implementa un modelo normalizado:

- `alfi.intereses_financieros`: catálogo;
- `alfi.usuario_intereses_financieros`: relación N:M.

Catálogo inicial:

1. Ahorro.
2. Créditos y financiamiento.
3. Inversiones.
4. Seguros.
5. Emprendimiento.
6. Educación financiera.

Este diseño permite que un usuario seleccione más de un interés sin duplicar
columnas ni almacenar listas no normalizadas.

## Validaciones de datos

PostgreSQL restringe:

- provincia a una de las 24 provincias del Ecuador cuando exista valor;
- rango de edad a `18-24`, `25-34`, `35-44`, `45-54`, `55-64`, `65+`;
- aceptación de términos a un estado coherente:
  - usuario histórico: los tres campos de aceptación en `NULL`; o
  - nuevo registro: `terminos_aceptados = true`, fecha no nula y versión no vacía.

El backend de registro será responsable de exigir estos campos en cuentas
nuevas. Esta separación preserva compatibilidad con usuarios ya existentes.

## RBAC

La migración conserva el Principio de Mínimo Privilegio implementado en AFB-151:

- administrador: únicamente `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre el catálogo y la relación de intereses;
- auditor: `SELECT` únicamente sobre el catálogo, sin lectura de relaciones individuales usuario-interés;
- usuario: lectura del catálogo y `SELECT`, `INSERT`, `DELETE` sobre sus asociaciones mediante backend.

Antes de conceder la matriz, el script revoca privilegios directos sobre los
objetos nuevos. Además neutraliza los `ALTER DEFAULT PRIVILEGES` del ejecutor
que pudieran otorgar automáticamente `TRUNCATE`, `REFERENCES`, `TRIGGER` o
`UPDATE` sobre secuencias. Así, cada migración debe declarar sus permisos de
forma explícita.

No se otorgan privilegios de administración del motor.

## Alcance

AFB-311 modifica exclusivamente el modelo PostgreSQL. No incorpora todavía:

- controles del formulario React;
- validaciones HTTP de provincia, rango, intereses o aceptación;
- modal/texto de Términos y Condiciones;
- persistencia desde `POST /api/auth/register`;
- pruebas funcionales del flujo completo.

Esos cambios deben implementarse en la integración de registro y validarse en
AFB-317.

## Evidencia reproducible

El script `backend/sql/AFB-311-registro-perfil-comercial.sql` deja consultas
posteriores a `COMMIT` para comprobar:

- nuevas columnas;
- catálogo de intereses;
- PK/FK de la relación N:M;
- CHECK de dominio;
- privilegios RBAC sobre los nuevos objetos.

## Criterio de cierre

AFB-311 puede darse por terminada cuando la migración se ejecute correctamente
en `alfi_bot_db_final` y las consultas de evidencia confirmen la estructura
esperada sin regresiones sobre los datos existentes.
