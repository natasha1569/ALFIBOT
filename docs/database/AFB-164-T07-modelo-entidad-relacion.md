# AFB-164 / T-07 — Diseñar el modelo entidad-relación

## Objetivo
Diseñar y documentar el modelo entidad-relación de ALFI BOT tomando como referencia la estructura PostgreSQL implementada en `backend/sql/ALFI_BOT_DATABASE.sql`.

## Subtareas cubiertas

- **AFB-179:** Identificar entidades y atributos del dominio.
- **AFB-180:** Definir claves primarias y foráneas del modelo.
- **AFB-181:** Elaborar el diagrama entidad-relación.

## Entidades principales

1. `roles`
2. `usuarios`
3. `analisis`
4. `senales_alerta`
5. `recomendaciones`
6. `auditoria`
7. `intereses_financieros`
8. `usuario_intereses_financieros`

## Relaciones principales

- `roles` 1 — N `usuarios`
- `usuarios` 1 — N `analisis`
- `analisis` 1 — N `senales_alerta`
- `analisis` 1 — N `recomendaciones`
- `usuarios` N — M `intereses_financieros`

## Criterios de aceptación de T-07

- [x] Existe un diagrama ER.
- [x] Se identifican las entidades.
- [x] Se definen PK y FK.
- [x] Se muestran cardinalidades.
- [x] Se justifican las relaciones.
- [x] El modelo queda documentado para publicación en Confluence.

## Archivos de evidencia

- `AFB-179-entidades-atributos.md`
- `AFB-180-claves-pk-fk.md`
- `AFB-181-diagrama-entidad-relacion.md`
- `AFB-164-modelo-er.mmd`

## Conclusión
El modelo entidad-relación de ALFI BOT organiza de manera coherente la información de usuarios, roles, análisis, señales de alerta, recomendaciones, auditoría e intereses financieros. Las relaciones y restricciones permiten mantener integridad referencial y representar adecuadamente el funcionamiento actual del sistema.
