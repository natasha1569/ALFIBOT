# AFB-405 — Rutas de acceso por rol

Referencia rápida de las rutas locales de ALFI BOT para pruebas y sustentación.

**URL base:** `http://localhost:5173`

| Acceso | Ruta |
| --- | --- |
| Landing pública | `http://localhost:5173/` |
| Usuario — Login / Registro | `http://localhost:5173/` |
| Usuario — Aplicación | `http://localhost:5173/app` |
| Administrador — Login | `http://localhost:5173/admin/login` |
| Administrador — Portal | `http://localhost:5173/admin` |
| Auditor — Login | `http://localhost:5173/auditor/login` |
| Auditor — Portal | `http://localhost:5173/auditor` |

## Nota

El usuario estándar inicia sesión o se registra desde la **landing**; actualmente no existe una ruta independiente `/login`.

Después de autenticarse, el sistema redirige según el rol:

- `usuario` → `/app`
- `administrador` → `/admin`
- `auditor` → `/auditor`

> Este documento no debe contener contraseñas, tokens ni otras credenciales.