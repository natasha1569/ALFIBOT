# ALFI BOT

Aplicación web preventiva para analizar textos, enlaces e imágenes en busca de señales de posibles fraudes financieros. El sistema integra React, Express, PostgreSQL y OpenAI, devuelve un nivel de riesgo, una categoría cuando corresponde, señales de alerta y recomendaciones.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Accesos separados para usuario, auditor y administrador.
- Análisis de texto, enlaces e imágenes mediante IA.
- Extracción de texto visible y evidencia de imágenes.
- Historial personal persistido en PostgreSQL.
- Clasificación de cuatro categorías de fraude soportadas.
- Reportería agregada para auditor y administrador.
- Administración de usuarios y roles.
- Resultados compartibles mediante WhatsApp Web, PDF y portapapeles.
- Validación automática de backend, frontend y compilación con GitHub Actions.

## Arquitectura

```text
Navegador React/Vite
        │ HTTP/JSON + token
        ▼
Backend Node.js/Express ─────► OpenAI
        │
        ▼
PostgreSQL (esquema alfi)
```

El frontend no accede directamente a PostgreSQL ni conoce la API key de OpenAI. El backend valida las solicitudes, aplica autenticación y autorización, consulta la IA y persiste los resultados.

## Requisitos

- Node.js 20 o superior.
- npm.
- PostgreSQL con el esquema base `alfi` y sus tablas principales.
- Una API key de OpenAI.
- Git, si se clonará el repositorio.

## Clonar e instalar dependencias

```bash
git clone https://github.com/natasha1569/ALFIBOT.git
cd ALFIBOT
```

Backend:

```bash
cd backend
npm ci
```

Frontend, desde otra terminal:

```bash
cd frontend
npm ci
```

## Configuración

### Backend

Copia `backend/.env.example` como `backend/.env` y reemplaza todos los valores de ejemplo:

```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=alfibot
DB_USER=usuario_aplicacion
DB_PASSWORD=contraseña_local

AUTH_TOKEN_SECRET=secreto_aleatorio_de_al_menos_32_caracteres
AUTH_TOKEN_EXPIRES_SECONDS=7200

OPENAI_API_KEY=tu_api_key
OPENAI_MODEL=gpt-5-mini
OPENAI_FALLBACK_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_MS=35000

ENABLE_DB_DIAGNOSTICS=false
```

No uses las credenciales de PostgreSQL como credenciales de la aplicación. Los usuarios finales se autentican contra `alfi.usuarios` y sus contraseñas se almacenan mediante hash.

### Frontend

Copia `frontend/.env.example` como `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_REQUEST_TIMEOUT_MS=90000
```

## Preparar PostgreSQL

Los scripts versionados actuales son migraciones incrementales y controles de seguridad. Deben ejecutarse sobre una base que ya contenga el esquema `alfi` y las tablas base: `roles`, `usuarios`, `analisis`, `senales_alerta`, `recomendaciones` y `auditoria`.

Orden recomendado para una base existente:

1. `backend/sql/AFB-151-rbac.sql` — roles PostgreSQL y mínimo privilegio.
2. `backend/sql/AFB-311-registro-perfil-comercial.sql` — perfil, términos e intereses.
3. `backend/sql/AFB-253-reporteria-bi.sql` — categoría de fraude y vistas BI.
4. `backend/sql/AFB-333-usuarios-accesos.sql` — catálogo final de roles funcionales.
5. `backend/sql/AFB-371-seguridad.sql` — consultas de verificación de seguridad.

Ejecuta cada archivo por separado con una cuenta propietaria o administrativa autorizada, revisa su salida y conserva evidencia. No uses directamente una cuenta PostgreSQL privilegiada como `DB_USER` del backend.

> Estado conocido: el repositorio todavía no contiene un instalador completo para construir toda la base desde cero. Ese trabajo está registrado en Jira como AFB-324. No se debe presentar una migración incremental como instalación limpia.

## Ejecución local

Terminal del backend:

```bash
cd backend
npm run dev
```

El servicio responde en `http://localhost:4000`.

Terminal del frontend:

```bash
cd frontend
npm run dev
```

Abre la dirección que indique Vite, normalmente `http://localhost:5173`.

Rutas principales:

- `/` — página pública.
- `/app` — analizador para usuario autenticado.
- `/auditor/login` — ingreso institucional del auditor.
- `/admin/login` — ingreso institucional del administrador.

Las cuentas de auditor y administrador deben existir en PostgreSQL con el rol funcional correspondiente. El repositorio no incluye contraseñas predeterminadas.

## Pruebas

Backend:

```bash
cd backend
npm test
node test-rbac.js
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

Las pruebas que requieren una base PostgreSQL configurada se ejecutan de forma explícita:

```bash
cd backend
node test-auth.js
node test-admin-users.js
node test-reporting.js
```

Estos scripts pueden crear datos temporales o necesitan las migraciones correspondientes. Revisa sus encabezados y usa una base de pruebas, no producción.

## Análisis de imágenes

El backend admite PNG, JPG/JPEG y WEBP de hasta 6 MB. Primero extrae texto visible y evidencia mediante visión/OCR; después contrasta esa información con la imagen original y aplica la política preventiva. La API key permanece únicamente en el backend.

## Compartir resultados

- WhatsApp Web abre un mensaje con el informe preventivo completo.
- PDF genera un archivo con nivel de riesgo, señales, recomendaciones y la imagen cuando aplica.
- Portapapeles copia el mismo resumen estructurado.

El contenido final debe revisarse antes de enviarlo. ALFI BOT ofrece orientación preventiva y no constituye una acusación ni una conclusión legal o financiera definitiva.

## Seguridad

- `.env`, `node_modules` y `dist` están excluidos de Git.
- `AUTH_TOKEN_SECRET` es obligatorio y debe tener al menos 32 caracteres.
- Los diagnósticos de base de datos permanecen deshabilitados por defecto.
- Los accesos por rol se validan en backend; ocultar una opción en React no reemplaza la autorización.
- No se deben versionar API keys, contraseñas, respaldos ni datos reales.

## Documentación relacionada

- [Convenciones de desarrollo y contribución](CONTRIBUTING.md).
- [Índice de decisiones de arquitectura (ADRs)](docs/adr/README.md).
- [Estándar de manejo de errores](docs/development/AFB-146-error-handling.md).
- [Matriz de pruebas funcionales](docs/testing/matriz-pruebas.md).
- [Evidencia de AFB-268 y AFB-271](docs/testing/AFB-268-271-evidencia-pruebas.md).
- [Trazabilidad de ramas, commits y PR](docs/evidence/AFB-293-trazabilidad-git.md).
- [Preguntas técnicas frecuentes](docs/presentation/AFB-282-preguntas-tecnicas.md).
- [Guion de sustentación](docs/presentation/AFB-277-guion-sustentacion.md).
- [Reportería BI](docs/database/AFB-253-reporteria-bi.md).
- [Plan de seguridad](docs/security/AFB-372-plan-politicas-seguridad-bd.md).
