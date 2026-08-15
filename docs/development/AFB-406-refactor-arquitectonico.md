# AFB-406 / T-28 — Refactor arquitectónico integral

## Resultado

El refactor conserva los contratos REST y separa responsabilidades sin modificar el esquema PostgreSQL canónico.

1. El frontend dispone de componentes atómicos en `frontend/src/common/<Componente>/` y cada componente funcional tiene su propio directorio.
2. Las rutas Express solo declaran endpoints, middleware y controladores.
3. La conexión se administra mediante un `DataSource` TypeORM con `synchronize: false`.
4. Las tablas y la vista BI del esquema `alfi` se mapean mediante `EntitySchema`.
5. Toda persistencia está aislada en `backend/src/repositories/`; los controladores no contienen SQL ni administran conexiones.
6. Las pruebas viven en carpetas `__test__` cercanas a los módulos que validan.

## Compatibilidad preservada

- autenticación para usuario, administrador y auditor;
- matriz RBAC y permisos de endpoints;
- análisis de texto, enlace e imagen;
- historial y eliminación en cascada;
- reportería BI y auditoría pública;
- restricciones, triggers, vistas y roles PostgreSQL existentes.

## Validación

- Backend: 33 pruebas aprobadas.
- Frontend: 26 pruebas aprobadas.
- Build Vite: aprobado.
- Metadatos TypeORM: 9 entidades válidas del esquema `alfi`.
- `git diff --check`: obligatorio antes del commit final.
