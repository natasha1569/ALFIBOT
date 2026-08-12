# AFB-319 — RBAC de aplicación

## Roles finales

ALFI BOT reconoce únicamente:

- `administrador`
- `auditor`
- `usuario`

El registro público siempre crea cuentas `usuario`. No existe registro público
para cuentas privilegiadas.

## Accesos

- Usuario: `/login` → `/app`
- Administrador: `/admin/login` → `/admin`
- Auditor: `/auditor/login` → `/auditor`

Los portales comparten el mismo mecanismo de sesión firmado, pero cada endpoint
de login exige el rol correspondiente. La separación visual no sustituye la
autorización del backend.

## Matriz

| Recurso | usuario | auditor | administrador |
|---|---|---|---|
| Crear análisis | Sí | Sí | Sí |
| Consultar historial propio | Sí | Sí | Sí |
| Eliminar historial propio | Sí | No | Sí |
| Reportería BI | No | Sí | Sí |
| Auditoría técnica | No | Sí | Sí |
| Administración de usuarios | No | No | Sí |
| Administración de licencias | No | No | Sí |
| Diagnósticos de base | No | No | Sí |

## Backend

`authMiddleware` valida sesión y que el rol pertenezca al catálogo de
aplicación.

`requireRoles(...)` permite proteger un endpoint por roles.

`requirePermission(...)` protege recursos a partir de la matriz central de
`backend/src/config/permissions.js`.

Una petición no autenticada recibe HTTP `401`.

Una petición autenticada sin permiso recibe HTTP `403`.

Los endpoints `/api/database/*`, cuando están habilitados mediante
`ENABLE_DB_DIAGNOSTICS=true`, requieren además
`database:diagnostics`, disponible únicamente para `administrador`.

## Login privilegiado

Los endpoints son:

- `POST /api/auth/admin/login`
- `POST /api/auth/auditor/login`

El endpoint público `POST /api/auth/login` solo acepta cuentas con rol
`usuario`. Una cuenta privilegiada que intente utilizarlo recibe `403`.

No se reciben roles desde el formulario de registro.

## Secreto de sesión

No existe secreto JWT/token predeterminado.

`AUTH_TOKEN_SECRET` es obligatorio y debe contener al menos 32 caracteres.

Ejemplo de generación local en PowerShell:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

El valor generado debe almacenarse únicamente en `backend/.env` y nunca
versionarse.

## Autenticación heredada

Se eliminó la cuenta local embebida y su hash SHA-256 de compatibilidad. Todas
las cuentas deben existir en PostgreSQL y utilizar el servicio de contraseñas
seguras existente.

## Prueba

Desde `backend`:

```powershell
node test-rbac.js
```

Debe finalizar con:

```text
AFB-319 OK: matriz RBAC y respuestas 401/403 validadas para usuario, auditor y administrador.
```

Además deben probarse manualmente:

1. usuario correcto en `/login`;
2. administrador correcto en `/admin/login`;
3. auditor correcto en `/auditor/login`;
4. usuario intentando portal administrativo → denegado;
5. auditor intentando operación administrativa → denegado;
6. usuario autenticado intentando `/api/database/*` → `403`.
