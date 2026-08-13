# AFB-374 — Portales de reportería, auditoría y tendencias

## Diagnóstico

Las tarjetas **Reportería BI**, **Auditoría** y **Tendencias** de los portales de
administrador y auditor se renderizaban como elementos estáticos. No tenían
evento de selección ni abrían contenido. El tablero existente consultaba la API
de tendencias, pero solo mostraba indicadores y una tabla, sin gráficos. Además,
el backend no exponía una ruta web para consultar la tabla de auditoría.

## Solución implementada

- Las tarjetas son controles navegables y abren su panel dentro del portal.
- Reportería BI muestra distribuciones por riesgo y tipo de contenido.
- Tendencias muestra la evolución mensual en un gráfico de línea.
- Auditoría permite filtrar y paginar eventos por entidad, operación y fechas.
- Los paneles reutilizan los estados de carga, error y resultados vacíos.

## Contrato de auditoría

`GET /api/audit/events`

Parámetros opcionales:

| Parámetro | Valores |
| --- | --- |
| `table` | `usuarios`, `analisis`, `recomendaciones` |
| `operation` | `INSERT`, `UPDATE`, `DELETE` |
| `from`, `to` | Fecha ISO `YYYY-MM-DD` |
| `page` | Entero positivo |
| `pageSize` | Entre 1 y 100 |

La respuesta incluye únicamente identificador, entidad, operación, registro,
usuario de base de datos y fecha. No expone `datos_anteriores`, `datos_nuevos`,
credenciales, contenido analizado ni otros campos sensibles.

## Acceso

- Administrador y auditor: permiso `audit:read` para consultar eventos.
- Usuario: acceso denegado por el middleware RBAC.
- Reportería y tendencias: permiso `reporting:read`.

## Verificación

- Pruebas unitarias de filtros, paginación y contrato público de auditoría.
- Matriz RBAC con acceso autorizado y denegado.
- Pruebas de agregaciones y serie temporal del frontend.
- Compilación de producción del frontend.
