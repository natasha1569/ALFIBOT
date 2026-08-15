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

## Preparar PostgreSQL

El repositorio incluye `backend/sql/ALFI_BOT_DATABASE.sql`, que funciona como instalador canónico de PostgreSQL para preparar una base de datos vacía con la estructura requerida por ALFI BOT.

Para una instalación limpia:

1. Crear una base de datos PostgreSQL vacía.
2. Ejecutar:

   `backend/sql/ALFI_BOT_DATABASE.sql`

3. Configurar las variables de conexión del backend en el archivo `.env`.
4. Ejecutar únicamente las migraciones adicionales de `backend/sql/` que correspondan al estado de la base de datos.

Los scripts `AFB-*.sql` complementan la instalación con funcionalidades desarrolladas durante el proyecto, como roles y permisos, datos de perfil, auditoría, reportería y categoría de fraude.

Por seguridad, el archivo `.env` no debe versionarse ni incluirse en la entrega pública del repositorio.

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
npm run test:rbac
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
npm run test:auth
npm run test:admin
npm run test:reporting
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
- [Reportería BI](docs/database/AFB-253-reporteria-bi.md).
- [Plan de seguridad](docs/security/AFB-372-plan-politicas-seguridad-bd.md).
