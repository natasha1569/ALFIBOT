# AFB-370 — Consolidación de evidencias de RBAC, auditoría y respaldos

## 1. Objetivo

Consolidar en un único documento el estado verificable de las evidencias de seguridad relacionadas con:

- AFB-151 — RBAC y mínimo privilegio en PostgreSQL;
- AFB-248 — auditoría mediante triggers;
- AFB-189 — respaldo, restauración, RPO y RTO.

Este documento funciona como matriz de evidencia para el Plan de Políticas de Seguridad en Bases de Datos de ALFI BOT.

La regla utilizada es estricta: **no se considera implementado un control únicamente porque esté definido como requisito en Jira**. Para declararlo como completado deben existir evidencias técnicas reproducibles en el repositorio, en PostgreSQL o en pruebas documentadas.

## 2. Estado general al consolidar AFB-370

| Componente | Jira | Evidencia consolidada | Estado en este documento |
| --- | --- | --- | --- |
| AFB-151 — RBAC en PostgreSQL | En curso | Pendiente de implementación/pruebas finales | PENDIENTE |
| AFB-248 — Auditoría mediante triggers | Finalizado | Jira confirma finalización; evidencia técnica definitiva debe reincorporarse/consolidarse | PARCIAL |
| AFB-189 — Respaldo y restauración | En curso | Pendiente de backup, restauración y métricas verificables | PENDIENTE |

AFB-370 puede cerrarse como actividad de **consolidación del estado actual**, manteniendo claramente señalados los puntos que deberán completarse posteriormente antes de cerrar el Plan de Seguridad.

## 3. Evidencia de RBAC — AFB-151

### 3.1 Criterios requeridos

AFB-151 exige:

1. rol administrador;
2. rol de aplicación;
3. rol de reportes;
4. mínimo privilegio;
5. pruebas de permisos;
6. documentación de roles.

### 3.2 Estado actual

**Estado: PENDIENTE.**

AFB-151 permanece en curso.

Por lo tanto, AFB-370 no declara todavía como evidencia final:

- existencia definitiva de los tres roles PostgreSQL;
- matriz final de `GRANT` y `REVOKE`;
- pruebas positivas de permisos;
- pruebas negativas de permisos;
- separación efectiva entre administración, aplicación y reportes.

### 3.3 Modelo objetivo a validar al finalizar AFB-151

La estructura esperada debe separar al menos:

```text
rol_alfi_admin
rol_alfi_app
rol_alfi_reporting
```

La nomenclatura final puede ajustarse durante AFB-151, pero debe conservar la separación funcional exigida.

### 3.4 Evidencias que se deben incorporar al completar AFB-151

Se deberán añadir resultados reproducibles de consultas como:

```sql
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles
WHERE rolname LIKE 'rol_alfi%';
```

y pruebas de privilegios mediante:

```sql
SELECT
    has_schema_privilege('ROL_OBJETIVO', 'alfi', 'USAGE') AS uso_schema;
```

También deberán documentarse pruebas permitidas y denegadas para demostrar mínimo privilegio.

### 3.5 Marcador de cierre

```text
[ PENDIENTE AFB-151 ]
- Crear/validar roles definitivos.
- Aplicar GRANT/REVOKE.
- Ejecutar pruebas de acceso permitido.
- Ejecutar pruebas de acceso denegado.
- Adjuntar resultados.
```

## 4. Evidencia de auditoría — AFB-248

### 4.1 Criterios requeridos

AFB-248 exige:

1. tabla centralizada de auditoría;
2. al menos tres entidades auditadas;
3. registro de INSERT, UPDATE o DELETE;
4. usuario;
5. fecha;
6. tabla y tipo de operación;
7. demostración de funcionamiento.

### 4.2 Estado actual

**Estado en Jira: FINALIZADO.**

Sin embargo, para el Plan de Seguridad no se utilizará únicamente el estado de Jira como evidencia técnica.

La consolidación final deberá incluir nuevamente evidencia reproducible del mecanismo actualmente instalado en la base PostgreSQL utilizada por ALFI BOT.

### 4.3 Evidencia que debe conservarse

Debe incorporarse al cierre:

- definición de la tabla central de auditoría;
- función de auditoría;
- triggers asociados;
- listado de al menos tres tablas auditadas;
- registros reales generados por operaciones de prueba.

Consultas sugeridas para evidencia:

```sql
SELECT trigger_name, event_object_schema, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'alfi'
ORDER BY event_object_table, trigger_name;
```

Para demostrar datos generados, se utilizará la tabla real de auditoría instalada en el proyecto una vez verificado su nombre y estructura.

No se escribe aquí un nombre de tabla supuesto para evitar documentar una estructura que no haya sido confirmada en la base actual.

### 4.4 Prueba mínima esperada

La demostración final debe incluir:

```text
Operación sobre entidad 1 -> registro de auditoría
Operación sobre entidad 2 -> registro de auditoría
Operación sobre entidad 3 -> registro de auditoría
```

y verificar para cada registro:

- usuario;
- fecha/hora;
- tabla;
- operación.

### 4.5 Marcador de cierre

```text
[ PARCIAL — AFB-248 FINALIZADO EN JIRA ]
- Confirmar estructura instalada en la BD actual.
- Capturar listado de triggers.
- Ejecutar operaciones controladas.
- Capturar registros generados.
- Incorporar evidencia al Plan final.
```

## 5. Evidencia de respaldo y restauración — AFB-189

### 5.1 Criterios requeridos

AFB-189 exige:

1. definición de RPO;
2. definición de RTO;
3. script o job de respaldo;
4. generación de un backup;
5. restauración en una base de prueba;
6. documentación de evidencia.

### 5.2 Estado actual

**Estado: PENDIENTE.**

AFB-189 permanece en curso.

No se declara todavía que exista:

- RPO aprobado;
- RTO aprobado;
- automatización final de respaldo;
- backup validado;
- restauración exitosa documentada.

### 5.3 Evidencias que se deben incorporar al completar AFB-189

La evidencia final debe contener como mínimo:

```text
Fecha/hora del respaldo
Base origen
Herramienta utilizada
Archivo generado
Tamaño del respaldo
Base destino de restauración
Hora de inicio de restauración
Hora de finalización
Resultado de validación
RPO definido
RTO definido
```

### 5.4 Comandos de referencia para la futura prueba

Ejemplo conceptual de respaldo:

```bash
pg_dump -Fc -d BASE_ORIGEN -f respaldo.dump
```

Ejemplo conceptual de restauración:

```bash
pg_restore -d BASE_PRUEBA respaldo.dump
```

Los nombres, credenciales y rutas reales se definirán en AFB-189 y no deben almacenarse con secretos dentro del repositorio.

### 5.5 Verificación posterior a restauración

La prueba debe demostrar que la base restaurada contiene objetos y datos esperados.

Por ejemplo:

```sql
SELECT current_database();

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'alfi'
ORDER BY table_name;
```

Además se deberán ejecutar consultas funcionales sobre entidades críticas para comprobar consistencia.

### 5.6 Marcador de cierre

```text
[ PENDIENTE AFB-189 ]
- Definir RPO.
- Definir RTO.
- Crear script/job.
- Generar backup.
- Restaurar en BD de prueba.
- Validar datos.
- Registrar tiempos y evidencia.
```

## 6. Evidencia adicional proveniente del hardening

Aunque AFB-369 no reemplaza AFB-151, AFB-248 ni AFB-189, aporta evidencia complementaria ya validada durante la ejecución del proyecto:

```text
npm run test:auth
-> AFB-309 OK: registro, duplicado, contraseña débil y login validados.

npm audit
-> found 0 vulnerabilities
```

También se implementó:

- diagnósticos PostgreSQL deshabilitados por defecto;
- autenticación cuando los diagnósticos se habilitan;
- sanitización de errores técnicos;
- obligación de `AUTH_TOKEN_SECRET` para producción.

Esta evidencia se incorporará como parte del apartado de hardening del Plan final, no como sustituto de las pruebas de RBAC, auditoría o recuperación.

## 7. Matriz de evidencias para completar al final

| Evidencia | Fuente | Estado |
| --- | --- | --- |
| Roles PostgreSQL definitivos | AFB-151 | PENDIENTE |
| Matriz GRANT/REVOKE | AFB-151 | PENDIENTE |
| Prueba de mínimo privilegio | AFB-151 | PENDIENTE |
| Tabla de auditoría | AFB-248 | POR REVALIDAR |
| Función/triggers de auditoría | AFB-248 | POR REVALIDAR |
| Evidencia sobre 3 entidades | AFB-248 | POR REVALIDAR |
| RPO | AFB-189 | PENDIENTE |
| RTO | AFB-189 | PENDIENTE |
| Script/job de respaldo | AFB-189 | PENDIENTE |
| Archivo de backup | AFB-189 | PENDIENTE |
| Restauración de prueba | AFB-189 | PENDIENTE |
| Evidencia de tiempos y validación | AFB-189 | PENDIENTE |
| `npm audit` sin vulnerabilidades | AFB-369 | VALIDADO |
| Test funcional de autenticación | AFB-369 | VALIDADO |

## 8. Criterio para completar esta matriz

Cada elemento pendiente deberá cambiarse a `VALIDADO` únicamente cuando exista al menos una de estas evidencias:

- script versionado;
- salida SQL reproducible;
- resultado de prueba;
- captura verificable;
- commit/PR correspondiente;
- documento técnico que reproduzca la prueba realizada.

No se cambiará un elemento a validado por estimación o por intención de implementación.

## 9. Uso dentro del Plan de Seguridad

Este documento debe ser utilizado como checklist antes de elaborar AFB-372.

AFB-372 no deberá presentar como implementado ningún control que continúe marcado aquí como:

```text
PENDIENTE
PARCIAL
POR REVALIDAR
```

Antes de generar la versión final del Plan se deberá volver a revisar esta matriz después de terminar AFB-151 y AFB-189 y de revalidar la evidencia técnica de AFB-248.

## 10. Resultado de AFB-370

AFB-370 consolida el estado real de las evidencias sin falsear el avance técnico.

Actualmente:

- RBAC queda identificado como pendiente de cierre en AFB-151;
- auditoría consta como finalizada en Jira, pero queda marcada para revalidación técnica antes del documento final;
- respaldo, restauración, RPO y RTO quedan pendientes de AFB-189;
- las pruebas de hardening ya ejecutadas quedan registradas como evidencia complementaria validada.

La matriz deberá actualizarse al finalizar las tareas pendientes antes de cerrar el Plan de Políticas de Seguridad en Bases de Datos.
