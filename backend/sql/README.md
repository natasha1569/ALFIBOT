# SQL de ALFI BOT

Este directorio concentra scripts SQL versionados del proyecto.

## Estado actual

Los instaladores SQL históricos fueron retirados del repositorio para evitar ejecutar por error scripts obsoletos o destructivos sobre una base existente.

No se debe asumir que existe un instalador completo vigente en este directorio.

## Seguridad — AFB-371

`AFB-371-seguridad.sql` consolida consultas de verificación y bloques de referencia del Plan de Políticas de Seguridad en Bases de Datos.

El archivo está diseñado para:

- inspeccionar el estado real de PostgreSQL sin eliminar datos;
- verificar roles, privilegios, triggers y metadatos de auditoría;
- dejar señalados los bloques pendientes de AFB-151 y AFB-189;
- servir como punto único para incorporar los controles definitivos cuando esas tareas se completen.

### Importante

Los bloques marcados como `PENDIENTE` no se ejecutan automáticamente. No deben activarse hasta validar la estructura real de la base y completar las tareas Jira correspondientes.

No se almacenan contraseñas ni secretos en SQL versionado.

## Documentación de evidencia

La matriz de evidencia relacionada se encuentra en:

`docs/security/AFB-370-evidencias-rbac-auditoria-respaldos.md`

La documentación técnica y funcional general del proyecto se mantiene también en Confluence.
