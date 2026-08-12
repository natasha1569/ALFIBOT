# AFB-333 — HU-17 Administrar usuarios y accesos

## Decisión de alcance

Durante la implementación se retiró el módulo de licencias porque ALFI BOT adopta un modelo gratuito para usuarios finales y monetizado mediante publicidad. El control de acceso queda gestionado exclusivamente mediante autenticación, roles RBAC y estado activo/inactivo de las cuentas.

No se implementan licencias, planes, fechas de vigencia ni restricciones comerciales por usuario.

## Alcance implementado

La HU-17 se entrega como un único incremento funcional y un único commit/PR.

Incluye:

- AFB-343: listado reutilizable de usuarios con búsqueda, rol y estado;
- AFB-344: edición administrativa de rol y estado, con desactivación lógica;
- AFB-346: migración segura del rol funcional `analista` hacia `usuario`;
- AFB-347: pruebas de administración de usuarios y control de acceso.

AFB-345 se retira del alcance por cambio de modelo de producto.

## Seguridad

Las rutas se exponen bajo `/api/admin` y requieren sesión válida.

- administración de usuarios: `users:admin`;
- `administrador`: autorizado;
- `auditor`: no autorizado;
- `usuario`: no autorizado.

La UI no se considera un control de seguridad. La autorización definitiva se aplica en Express mediante middleware RBAC.

## Administración de usuarios

El administrador puede:

- listar usuarios;
- buscar por nombre, correo o celular;
- filtrar por rol y estado;
- cambiar rol entre `administrador`, `auditor` y `usuario`;
- activar o desactivar cuentas sin borrado físico.

Para evitar un bloqueo accidental, la API impide que el administrador autenticado se quite a sí mismo el rol administrador o desactive su propia cuenta desde esta operación.

## Migración del rol analista

Ejecutar en pgAdmin:

```sql
backend/sql/AFB-333-usuarios-accesos.sql
```

La migración:

1. verifica que existan `alfi.usuarios` y `alfi.roles`;
2. verifica que exista el rol destino `usuario`;
3. reasigna usuarios históricos `analista` a `usuario`;
4. elimina `analista` del catálogo funcional;
5. comprueba que todos los usuarios estén asociados a `administrador`, `auditor` o `usuario`;
6. hace `COMMIT` solo si las validaciones son satisfactorias.

Es transaccional e idempotente.

## UI reutilizable

La interfaz administrativa reutiliza:

- `AdminResourceTable`;
- `AdminFilters`;
- `AdminModal`;
- `AdminForm`.

`UsersAdminPanel` compone estos elementos para mantener una implementación pequeña y reutilizable.

## Pruebas

Pruebas unitarias:

```bash
npm test
```

Prueba de integración administrativa contra PostgreSQL:

```bash
npm run test:admin
```

La prueba de integración crea un usuario temporal dentro de una transacción, valida listado, filtros, cambio de rol, desactivación y retiro de `analista`, y finalmente ejecuta `ROLLBACK` para no dejar datos de prueba.

## Criterios de aceptación finales

1. El administrador puede consultar el listado de usuarios.
2. Puede buscar y filtrar usuarios por criterios básicos.
3. Puede editar rol y estado activo/inactivo.
4. Puede desactivar usuarios sin borrado físico.
5. Las operaciones administrativas están protegidas por RBAC en backend.
6. La UI reutiliza componentes comunes.
7. `analista` queda retirado mediante migración segura y se prueban operaciones autorizadas y rechazadas.
