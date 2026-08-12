# AFB-372 — Plan de Políticas de Seguridad en Bases de Datos de ALFI BOT

## 1. Propósito del documento

Este documento consolida el Plan de Políticas de Seguridad en Bases de Datos de ALFI BOT a partir de la evidencia técnica y documental generada en AFB-367, AFB-368, AFB-369, AFB-370 y AFB-371.

El plan se redacta bajo un criterio de trazabilidad: **solo se presenta como implementado aquello que cuenta con evidencia verificable en el repositorio, en pruebas ejecutadas o en el estado técnico documentado del proyecto**.

Los controles que dependen de tareas todavía abiertas se identifican expresamente como `PENDIENTE`, `PARCIAL` o `POR REVALIDAR`.

## 2. Alcance

El plan cubre la seguridad asociada a:

- PostgreSQL como motor de base de datos;
- backend Node.js/Express que accede a PostgreSQL;
- frontend React/Vite como cliente de la API;
- autenticación de usuarios;
- variables de entorno y secretos;
- datos almacenados por ALFI BOT;
- auditoría de operaciones;
- roles y privilegios de base de datos;
- respaldo y restauración;
- comunicación entre componentes;
- hardening;
- gestión de vulnerabilidades.

No se presenta este documento como una certificación de seguridad ni como prueba de que todos los controles de producción están implementados.

## 3. Escenario técnico

ALFI BOT utiliza una arquitectura web con separación entre frontend, backend y base de datos.

```text
Usuario
  |
  v
Frontend React / Vite
  |
  | HTTP / JSON
  v
Backend Node.js / Express
  |
  | pg.Pool
  v
PostgreSQL

Backend
  |
  | HTTPS
  v
OpenAI
```

El frontend no debe conectarse directamente a PostgreSQL.

La conexión a la base de datos se centraliza en:

```text
backend/src/config/database.js
```

y utiliza variables de entorno para obtener:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

## 4. Activos de información

### 4.1 Datos de usuarios

Entre los datos de usuario identificados se encuentran:

- nombre;
- correo;
- celular;
- rol;
- estado de cuenta;
- hash de contraseña;
- fechas de registro y actualización.

El campo `password_hash` es información sensible y no debe exponerse mediante APIs, reportes o auditorías.

### 4.2 Análisis de fraude

La aplicación almacena información relacionada con los análisis realizados por los usuarios, incluyendo contenido analizado, nivel de riesgo, resumen, fecha y relaciones con el usuario.

Este contenido debe tratarse como información de aplicación protegida.

### 4.3 Señales y recomendaciones

Las señales de alerta y recomendaciones forman parte del resultado generado por ALFI BOT y se relacionan con los análisis almacenados.

### 4.4 Auditoría

Los registros de auditoría son evidencia operacional y deben protegerse frente a modificación o eliminación no autorizada.

### 4.5 Secretos

Se consideran secretos o activos críticos de configuración:

- credenciales de PostgreSQL;
- API key de OpenAI;
- secreto de autenticación;
- archivos `.env`;
- cualquier credencial utilizada para despliegue o administración.

## 5. Superficie de ataque

AFB-367 identificó como superficies principales:

1. credenciales de base de datos;
2. endpoints HTTP con acceso a datos;
3. exceso de privilegios del usuario PostgreSQL;
4. inyección SQL;
5. acceso no autorizado a datos de otros usuarios;
6. exposición de información sensible mediante errores;
7. comunicación sin cifrado;
8. manipulación de registros de auditoría;
9. pérdida de disponibilidad de la base.

Los límites de confianza principales son:

```text
Internet / usuario
        |
        v
Frontend
        |
        v
API Express
        |
        v
PostgreSQL

API Express
        |
        v
OpenAI
```

Cada límite exige validación, autenticación, autorización o protección del canal según corresponda.

## 6. Política de identidad, acceso y RBAC

### 6.1 Principio

El acceso a PostgreSQL debe seguir el principio de mínimo privilegio.

Una cuenta utilizada por la aplicación no debe disponer de permisos administrativos que no requiera para ejecutar las operaciones funcionales del sistema.

### 6.2 Estado actual

**Estado: PENDIENTE DE CIERRE EN AFB-151.**

AFB-151 exige demostrar:

- rol administrador;
- rol de aplicación;
- rol de reportes;
- mínimo privilegio;
- pruebas de permisos;
- documentación de roles.

AFB-370 registró que todavía no existe evidencia final suficiente para declarar esos criterios como completados.

### 6.3 Modelo objetivo

La separación técnica documentada como objetivo contempla:

```text
rol_alfi_admin
rol_alfi_app
rol_alfi_reporting
```

La nomenclatura definitiva deberá validarse durante el cierre de AFB-151.

### 6.4 Política de mínimo privilegio

La política establece que:

- `PUBLIC` no debe recibir permisos adicionales innecesarios;
- el rol de aplicación debe acceder únicamente a los objetos necesarios para las operaciones del backend;
- el rol de reportes debe mantenerse en lectura cuando ese sea su propósito;
- las operaciones administrativas deben reservarse al rol autorizado;
- los permisos deben probarse tanto en escenarios permitidos como denegados.

### 6.5 Evidencia pendiente

Antes de declarar RBAC como `VALIDADO` deberán existir:

```text
- listado de roles PostgreSQL;
- matriz GRANT/REVOKE;
- pruebas de privilegios;
- pruebas de acceso denegado;
- evidencia del usuario técnico utilizado por la aplicación.
```

AFB-371 incluye consultas de inspección y una plantilla comentada de referencia, pero no activa esos cambios mientras AFB-151 siga pendiente.

## 7. Política de credenciales y secretos

### 7.1 Variables de entorno

Los secretos reales deben mantenerse fuera del repositorio.

La política prohíbe:

- contraseñas dentro del código fuente;
- credenciales reales dentro de scripts SQL;
- secretos en commits;
- claves reales en documentación pública;
- archivos `.env` versionados.

### 7.2 Estado verificable

El proyecto utiliza variables de entorno para la configuración de PostgreSQL y servicios externos.

Los archivos `.env` reales están excluidos del control de versiones.

### 7.3 Secreto de autenticación

AFB-369 endureció el comportamiento del secreto de autenticación:

```text
NODE_ENV=production
```

requiere que:

```text
AUTH_TOKEN_SECRET
```

esté configurado explícitamente.

Si falta en producción, el servidor debe fallar de forma controlada.

En desarrollo se mantiene un fallback temporal con advertencia para no romper el entorno académico.

Esta implementación actualiza el hallazgo previo documentado en AFB-368 sobre secretos de desarrollo por defecto.

## 8. Política de contraseñas

Las contraseñas de usuarios no deben almacenarse en texto plano.

El sistema utiliza hashing para las credenciales de usuarios.

La política establece:

1. no almacenar la contraseña original;
2. no incluir contraseñas ni hashes en logs;
3. no exponer hashes en APIs;
4. no incluir contraseñas en auditorías;
5. realizar la validación de credenciales en el backend.

Debe mantenerse la distinción:

```text
hashing de contraseña != cifrado general de PostgreSQL
```

## 9. Cifrado de datos en reposo

### 9.1 Estado actual

**Estado: NO DEMOSTRADO a nivel físico.**

No existe evidencia suficiente en el repositorio para afirmar que el directorio físico de PostgreSQL se encuentre cifrado.

### 9.2 Política para producción

El almacenamiento físico que contiene:

- archivos de PostgreSQL;
- WAL cuando corresponda;
- backups;
- exportaciones sensibles;

debe utilizar cifrado en reposo provisto por el sistema operativo, infraestructura o servicio administrado.

### 9.3 Cifrado de columnas

El plan no incorpora cifrado de columnas únicamente para simular un control académico.

En el alcance actual se priorizan:

- hashing de contraseñas;
- mínimo privilegio;
- gestión de secretos;
- cifrado del almacenamiento;
- cifrado del transporte;
- respaldo protegido.

El cifrado de campos específicos podrá evaluarse si una versión futura almacena información que lo justifique.

## 10. Política de cifrado en tránsito

### 10.1 Navegador y backend

Para producción, la comunicación entre navegador y servidor debe utilizar HTTPS.

HTTP local puede aceptarse únicamente como excepción de desarrollo controlado.

### 10.2 Backend y PostgreSQL

La configuración actual de `pg.Pool` no demuestra TLS explícito hacia PostgreSQL.

Por ello:

**Entorno local académico:** puede mantenerse conexión local sin TLS como excepción documentada.

**Entorno remoto o productivo:** TLS debe considerarse obligatorio cuando PostgreSQL se encuentre fuera del host o entorno local controlado del backend.

La configuración productiva deberá:

- habilitar SSL/TLS en PostgreSQL o el servicio administrado;
- configurar el cliente Node.js para utilizar TLS;
- validar certificados según la infraestructura;
- evitar desactivar la validación sin justificación.

### 10.3 Backend y OpenAI

La política establece:

- usar el canal HTTPS del proveedor;
- mantener la API key fuera del repositorio;
- transmitir solo la información necesaria;
- no registrar la API key;
- rotar el secreto si existe exposición.

## 11. Hardening del backend y reducción de exposición

AFB-369 implementó controles concretos.

### 11.1 Endpoints de diagnóstico

Los endpoints:

```text
GET /api/database/test
GET /api/database/analisis
```

dejaron de estar registrados por defecto.

Solo se habilitan cuando:

```text
ENABLE_DB_DIAGNOSTICS=true
```

La configuración de ejemplo mantiene:

```text
ENABLE_DB_DIAGNOSTICS=false
```

### 11.2 Autenticación de diagnósticos

Cuando los diagnósticos se habilitan, utilizan middleware de autenticación.

La autorización especializada por rol queda vinculada al trabajo pendiente de RBAC.

### 11.3 Sanitización de errores

Los detalles internos se registran en el servidor, mientras los endpoints de diagnóstico evitan devolver `error.message` directamente al cliente.

Esto reduce la exposición de información interna de PostgreSQL y del entorno.

## 12. Hardening de PostgreSQL

Para el entorno local académico se establece:

- evitar exposición innecesaria de PostgreSQL;
- mantener credenciales fuera del código;
- evitar cuentas superusuario para la aplicación;
- restringir acceso al entorno autorizado.

Para un despliegue remoto se recomienda validar:

```text
listen_addresses
pg_hba.conf
firewall
TLS
roles
mínimo privilegio
```

La configuración física de estos elementos no se presenta como implementada mientras no exista evidencia reproducible.

## 13. Prevención de inyección SQL

Los valores recibidos desde el usuario deben incorporarse a consultas mediante parámetros.

Patrón esperado:

```javascript
pool.query(
  'SELECT * FROM alfi.usuarios WHERE correo = $1',
  [correo]
);
```

La política prohíbe construir SQL concatenando directamente valores externos cuando estos puedan estar controlados por el usuario.

## 14. Gestión de vulnerabilidades

### 14.1 Dependencias Node.js

Antes de entregas o despliegues se debe revisar el estado de dependencias mediante:

```bash
npm audit
```

Durante AFB-369 se obtuvo:

```text
found 0 vulnerabilities
```

Este resultado constituye evidencia puntual del momento de la prueba y no garantiza que el estado permanezca igual indefinidamente.

### 14.2 Actualizaciones

Las actualizaciones de seguridad deben:

1. revisarse;
2. aplicarse de forma controlada;
3. contar con respaldo antes de cambios relevantes;
4. probar el funcionamiento posterior;
5. evitar introducir cambios incompatibles sin validación.

### 14.3 PostgreSQL

La versión instalada debe mantenerse dentro de una versión soportada.

La versión puede evidenciarse mediante:

```sql
SELECT version();
```

## 15. Auditoría y monitoreo

### 15.1 Requisito

El mecanismo de auditoría debe demostrar:

- tabla centralizada;
- al menos tres entidades auditadas;
- operaciones registradas;
- usuario;
- fecha;
- tabla;
- tipo de operación.

### 15.2 Estado actual

**AFB-248 figura como Finalizado en Jira.**

Sin embargo, AFB-370 estableció que la evidencia técnica debe revalidarse antes de presentarla como evidencia definitiva del Plan.

Por lo tanto, el estado dentro de este documento es:

```text
POR REVALIDAR
```

### 15.3 Evidencia requerida

La evidencia final debe incluir:

- tabla de auditoría real;
- función de auditoría;
- triggers instalados;
- al menos tres tablas auditadas;
- registros generados mediante operaciones controladas.

AFB-371 incorpora consultas de inventario de triggers y funciones sin asumir nombres de objetos no confirmados.

## 16. Disponibilidad, respaldo y restauración

### 16.1 Objetivo

La política de disponibilidad debe permitir recuperar la base ante:

- eliminación accidental;
- corrupción;
- error de migración;
- fallo del equipo;
- pérdida del entorno local.

### 16.2 Estado actual

**Estado: PENDIENTE EN AFB-189.**

No se declara todavía como validado:

- RPO;
- RTO;
- job o script final de respaldo;
- backup real validado;
- restauración de prueba;
- medición del tiempo de recuperación.

### 16.3 Política de backup

Los respaldos deben:

- almacenarse fuera del repositorio Git;
- mantenerse en ubicación controlada;
- evitar exposición pública;
- utilizar almacenamiento cifrado en producción;
- limitar acceso a personal autorizado;
- probarse mediante restauración.

### 16.4 Evidencia requerida

AFB-189 deberá aportar como mínimo:

```text
Fecha y hora del respaldo
Base origen
Herramienta
Archivo generado
Tamaño
Base destino de restauración
Inicio de restauración
Fin de restauración
Resultado
RPO
RTO
```

### 16.5 Herramientas

La referencia documentada para la futura prueba es:

```bash
pg_dump -Fc -d BASE_ORIGEN -f respaldo.dump
pg_restore -d BASE_PRUEBA respaldo.dump
```

Los secretos, credenciales y backups con datos reales no deben incorporarse al repositorio.

## 17. RPO y RTO

### 17.1 RPO

El Recovery Point Objective deberá definir la pérdida máxima de datos aceptable expresada en tiempo.

**Estado actual: PENDIENTE DE DEFINICIÓN EN AFB-189.**

### 17.2 RTO

El Recovery Time Objective deberá definir el tiempo máximo aceptable para recuperar la operación.

**Estado actual: PENDIENTE DE DEFINICIÓN EN AFB-189.**

No se asignan valores ficticios de RPO o RTO en este documento.

## 18. Archivo SQL de seguridad

AFB-371 consolidó:

```text
backend/sql/AFB-371-seguridad.sql
```

El archivo contiene:

- contexto de ejecución;
- inventario del esquema;
- inspección de roles;
- inspección de privilegios;
- inventario de triggers;
- inventario de funciones;
- consultas para futura validación;
- checklist de estado.

Los bloques de modificación de roles permanecen comentados mientras AFB-151 no esté completado.

El archivo no debe utilizarse para afirmar que los controles pendientes ya fueron aplicados.

## 19. Gestión de ambientes

### 19.1 Desarrollo

Se admiten como excepciones controladas:

- HTTP local;
- PostgreSQL local sin TLS;
- fallback temporal del secreto con advertencia;
- diagnósticos habilitados únicamente durante pruebas.

### 19.2 Producción

La política requiere:

- `NODE_ENV=production`;
- `AUTH_TOKEN_SECRET` explícito;
- diagnósticos deshabilitados;
- HTTPS;
- TLS hacia PostgreSQL cuando sea remoto;
- mínimo privilegio;
- secretos fuera del repositorio;
- backups protegidos;
- hardening de red;
- actualización y revisión de vulnerabilidades.

## 20. Matriz consolidada de controles

| Control | Estado | Evidencia / dependencia |
| --- | --- | --- |
| Variables de entorno para PostgreSQL | IMPLEMENTADO | Configuración del backend |
| `.env` fuera de Git | IMPLEMENTADO | `.gitignore` / política |
| Hashing de contraseñas | IMPLEMENTADO | Flujo de autenticación |
| Secreto obligatorio en producción | IMPLEMENTADO | AFB-369 |
| Diagnósticos deshabilitados por defecto | IMPLEMENTADO | AFB-369 |
| Autenticación de diagnósticos | IMPLEMENTADO | AFB-369 |
| Sanitización de errores de diagnóstico | IMPLEMENTADO | AFB-369 |
| `npm audit` ejecutado sin vulnerabilidades | VALIDADO EN LA PRUEBA | AFB-369 |
| RBAC PostgreSQL definitivo | PENDIENTE | AFB-151 |
| GRANT/REVOKE de mínimo privilegio | PENDIENTE | AFB-151 |
| Pruebas permitidas/denegadas | PENDIENTE | AFB-151 |
| Auditoría mediante triggers | POR REVALIDAR | AFB-248 / AFB-370 |
| Evidencia sobre 3 entidades auditadas | POR REVALIDAR | AFB-248 / AFB-370 |
| RPO | PENDIENTE | AFB-189 |
| RTO | PENDIENTE | AFB-189 |
| Backup automatizado | PENDIENTE | AFB-189 |
| Restauración probada | PENDIENTE | AFB-189 |
| TLS Express-PostgreSQL | NO DEMOSTRADO | Requerido para remoto/productivo |
| Cifrado físico PostgreSQL | NO DEMOSTRADO | Recomendación productiva |
| Cifrado de backups | NO DEMOSTRADO | Recomendación productiva |
| HTTPS productivo | DEPENDE DEL DESPLIEGUE | Requerido en producción |

## 21. Evidencias ejecutadas

Durante el trabajo de hardening se documentaron las siguientes pruebas:

```text
npm run test:auth
-> AFB-309 OK: registro, duplicado, contraseña débil y login validados.
```

y:

```text
npm audit
-> found 0 vulnerabilities
```

Estas evidencias respaldan autenticación y gestión puntual de vulnerabilidades de dependencias.

No sustituyen las pruebas pendientes de RBAC, auditoría o recuperación.

## 22. Riesgos residuales

Mientras las tareas pendientes no estén cerradas, se mantienen como riesgos residuales:

### 22.1 Exceso de privilegios

Sin la evidencia final de AFB-151 no se puede demostrar mínimo privilegio completo a nivel del motor PostgreSQL.

### 22.2 Auditoría no revalidada

Aunque AFB-248 está finalizada, el Plan requiere volver a demostrar técnicamente la estructura y registros de auditoría sobre la base actual.

### 22.3 Recuperación no probada

Sin cerrar AFB-189 no existe evidencia suficiente para afirmar que la recuperación cumple un RPO y RTO determinados.

### 22.4 Cifrado de infraestructura

TLS, cifrado físico y cifrado de respaldos dependen del entorno de despliegue y no están demostrados por el repositorio actual.

## 23. Prioridades de cierre

Antes de presentar como completamente implementado el Plan, deberán completarse en este orden lógico:

1. finalizar AFB-151 y ejecutar pruebas de RBAC;
2. revalidar AFB-248 sobre la base actual;
3. finalizar AFB-189 con backup y restauración;
4. actualizar AFB-370 cambiando únicamente evidencia comprobada a `VALIDADO`;
5. actualizar AFB-371 con las sentencias definitivas que correspondan;
6. actualizar esta matriz final con los resultados obtenidos.

## 24. Recomendaciones para producción

Para una futura instalación productiva se recomienda:

- utilizar una cuenta PostgreSQL exclusiva para la aplicación;
- implementar mínimo privilegio;
- restringir conexiones por red;
- aplicar TLS;
- utilizar HTTPS;
- cifrar el almacenamiento;
- cifrar y proteger backups;
- automatizar respaldos;
- probar restauraciones periódicamente;
- rotar secretos;
- aplicar actualizaciones de seguridad;
- revisar dependencias;
- mantener logs y auditoría protegidos;
- evitar endpoints diagnósticos permanentes;
- separar funciones administrativas y de consulta.

## 25. Criterio de aceptación de evidencia

Un control solo deberá cambiarse a `VALIDADO` cuando exista al menos una evidencia reproducible:

- sentencia SQL versionada y aplicada;
- consulta de verificación;
- prueba funcional;
- prueba de acceso denegado;
- salida de herramienta;
- captura verificable;
- backup y restauración probados;
- commit o Pull Request asociado;
- documento técnico con pasos reproducibles.

La intención de implementar un control no constituye evidencia.

## 26. Conclusiones

ALFI BOT dispone de una línea base de seguridad técnicamente documentada y ha aplicado controles concretos sobre la exposición del backend.

Entre los controles demostrables se encuentran:

- gestión de configuración mediante variables de entorno;
- protección de secretos frente al repositorio;
- hashing de contraseñas;
- endurecimiento del secreto de autenticación para producción;
- deshabilitación por defecto de diagnósticos de base de datos;
- autenticación de diagnósticos;
- sanitización de errores;
- revisión puntual de vulnerabilidades de dependencias.

El plan también identifica con transparencia los controles que aún requieren cierre técnico.

No se presenta como completado el RBAC PostgreSQL mientras AFB-151 siga pendiente, no se presenta como revalidada la auditoría únicamente por su estado en Jira y no se asignan valores ficticios de RPO/RTO antes de finalizar AFB-189.

Esta separación entre controles implementados, controles pendientes y recomendaciones permite que el documento sea utilizado tanto como evidencia académica como guía técnica para continuar el endurecimiento del proyecto.

## 27. Referencias internas del proyecto

Este Plan se apoya en:

```text
docs/security/AFB-367-escenario-tecnico-superficie-ataque.md
docs/security/AFB-368-politica-cifrado-reposo-transito.md
docs/security/AFB-369-hardening-vulnerabilidades.md
docs/security/AFB-370-evidencias-rbac-auditoria-respaldos.md
backend/sql/AFB-371-seguridad.sql
```

Tareas relacionadas:

```text
AFB-151 — Implementar RBAC en el motor de base de datos
AFB-189 — Configurar respaldo y restauración
AFB-248 — Implementar auditoría mediante triggers
AFB-366 — Elaborar Plan de Políticas de Seguridad en Bases de Datos de ALFI BOT
AFB-367 — Escenario técnico y superficie de ataque
AFB-368 — Política de cifrado
AFB-369 — Hardening y gestión de vulnerabilidades
AFB-370 — Consolidación de evidencias
AFB-371 — Consolidación SQL
AFB-372 — Documento final del Plan de Seguridad
```

## 28. Estado del Plan al cierre documental de AFB-372

La elaboración documental del Plan queda consolidada con este archivo.

Su estado técnico global es:

```text
DOCUMENTO DEL PLAN: CONSOLIDADO
HARDENING DOCUMENTADO/IMPLEMENTADO: PARCIALMENTE VALIDADO
RBAC POSTGRESQL: PENDIENTE AFB-151
AUDITORÍA: POR REVALIDAR
BACKUP / RESTAURACIÓN: PENDIENTE AFB-189
RPO / RTO: PENDIENTE AFB-189
CIFRADO DE INFRAESTRUCTURA: NO DEMOSTRADO EN ENTORNO ACTUAL
```

Cuando se completen AFB-151 y AFB-189 y se revalide AFB-248, este documento deberá actualizarse para reflejar exclusivamente los resultados realmente obtenidos.
