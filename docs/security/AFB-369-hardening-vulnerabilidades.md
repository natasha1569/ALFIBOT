# AFB-369 — Hardening y gestión de vulnerabilidades

## 1. Objetivo

Aplicar controles básicos de hardening sobre ALFI BOT y documentar las medidas de gestión de vulnerabilidades relacionadas con PostgreSQL y el backend Express.

Esta subtarea implementa controles concretos de reducción de exposición sin adelantar el RBAC completo de AFB-151 ni el archivo SQL consolidado de AFB-371.

## 2. Hallazgos utilizados como entrada

AFB-367 identificó como superficies de ataque relevantes los endpoints de diagnóstico, los mensajes de error técnicos, los secretos, el posible exceso de privilegios y el riesgo de inyección SQL.

AFB-368 estableció que los secretos reales no deben versionarse y que las diferencias entre desarrollo y producción deben quedar explícitas.

## 3. Controles implementados

### 3.1 Diagnósticos de base de datos deshabilitados por defecto

Los endpoints:

```text
GET /api/database/test
GET /api/database/analisis
```

solo se registran cuando:

```text
ENABLE_DB_DIAGNOSTICS=true
```

La configuración de ejemplo mantiene `ENABLE_DB_DIAGNOSTICS=false`.

### 3.2 Autenticación obligatoria para diagnósticos

Cuando los diagnósticos se habilitan explícitamente, ambos endpoints utilizan `authMiddleware`.

La autorización especializada por rol se implementará posteriormente dentro del alcance de RBAC.

### 3.3 Mensajes de error sanitizados

Los errores internos se registran en consola, pero los endpoints de base de datos no devuelven `error.message` al cliente.

Esto reduce la exposición de nombres internos, mensajes del driver PostgreSQL y detalles técnicos de infraestructura.

### 3.4 Secreto obligatorio en producción

Cuando:

```text
NODE_ENV=production
```

la aplicación exige `AUTH_TOKEN_SECRET`.

Si el secreto no está configurado, el inicio falla de forma controlada.

En desarrollo se conserva temporalmente el fallback existente para no romper el flujo académico local, pero se genera una advertencia explícita.

## 4. Hardening de PostgreSQL

En el entorno local académico PostgreSQL no debería exponerse innecesariamente fuera del equipo.

Para un despliegue remoto se recomienda:

- limitar `listen_addresses`;
- restringir `pg_hba.conf`;
- permitir solo redes necesarias;
- utilizar firewall;
- habilitar TLS cuando backend y base estén en hosts diferentes;
- evitar cuentas superusuario para la aplicación.

La implementación de permisos definitivos corresponde a AFB-151.

## 5. Gestión de vulnerabilidades

### Dependencias Node.js

Antes de una entrega o despliegue se debe ejecutar:

```bash
npm audit
```

Las actualizaciones deben evaluarse antes de aplicarse para evitar cambios incompatibles.

### PostgreSQL

La versión instalada debe mantenerse soportada y actualizada.

Se debe:

- revisar actualizaciones de seguridad;
- respaldar antes de cambios importantes;
- aplicar parches en una ventana controlada;
- probar la aplicación después de actualizar.

La versión puede evidenciarse mediante:

```sql
SELECT version();
```

## 6. Prevención de inyección SQL

Los valores recibidos desde usuarios deben incorporarse mediante parámetros.

Patrón esperado:

```javascript
pool.query(
  'SELECT * FROM alfi.usuarios WHERE correo = $1',
  [correo]
);
```

Debe evitarse concatenar valores externos dentro de sentencias SQL.

## 7. Política por entorno

### Desarrollo

Puede utilizar:

- HTTP local;
- PostgreSQL local sin TLS;
- diagnósticos habilitados solo durante una prueba;
- fallback temporal del secreto con advertencia.

### Producción

Debe utilizar:

- `NODE_ENV=production`;
- `AUTH_TOKEN_SECRET` explícito;
- diagnósticos deshabilitados;
- HTTPS;
- TLS hacia PostgreSQL cuando sea remoto;
- mínimo privilegio;
- secretos fuera del repositorio;
- backups protegidos.

## 8. Pruebas mínimas

### Diagnósticos deshabilitados

Con:

```text
ENABLE_DB_DIAGNOSTICS=false
```

resultado esperado:

```text
GET /api/database/test -> 404
GET /api/database/analisis -> 404
```

### Diagnósticos habilitados sin autenticación

Con:

```text
ENABLE_DB_DIAGNOSTICS=true
```

resultado esperado sin token:

```text
GET /api/database/test -> 401
GET /api/database/analisis -> 401
```

### Autenticación existente

Después del parche se debe ejecutar:

```bash
cd backend
npm run test:auth
```

## 9. Controles fuera de esta subtarea

No se incluyen todavía:

- roles PostgreSQL definitivos;
- matriz GRANT/REVOKE;
- eliminación del rol `analista`;
- permisos de auditor;
- permisos del usuario técnico de aplicación;
- TLS real de infraestructura;
- modificación física de `pg_hba.conf`;
- cifrado del almacenamiento;
- SQL final consolidado.

## 10. Resultado

AFB-369 reduce de forma concreta la superficie de ataque del backend: los endpoints de diagnóstico dejan de estar disponibles por defecto, requieren autenticación al habilitarse, los errores internos dejan de enviarse al cliente y el secreto de firma pasa a ser obligatorio en producción.

Además se establece una política básica de parcheo, revisión de vulnerabilidades y configuración segura que servirá de evidencia para el Plan de Políticas de Seguridad en Bases de Datos.
