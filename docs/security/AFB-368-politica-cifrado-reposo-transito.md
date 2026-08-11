# AFB-368 — Política de cifrado en reposo y en tránsito

## 1. Objetivo

Definir la política de protección criptográfica aplicable a ALFI BOT y PostgreSQL, diferenciando con precisión entre los controles que existen actualmente en el proyecto, los controles que pueden demostrarse en el entorno académico y los controles recomendados para un despliegue remoto o productivo.

Esta subtarea es documental. No modifica todavía la configuración de PostgreSQL, el código de conexión, los roles de base de datos ni el hardening general del sistema.

## 2. Alcance

La política cubre:

- datos almacenados en PostgreSQL;
- hashes de contraseñas;
- archivos de configuración y secretos;
- copias de respaldo;
- comunicación entre Express y PostgreSQL;
- comunicación HTTP entre frontend y backend;
- comunicación del backend con servicios externos;
- criterios para TLS/SSL en un despliegue remoto.

No se considera que el hashing de contraseñas equivalga al cifrado general de la base de datos.

## 3. Estado actual verificable del proyecto

### 3.1 Configuración de PostgreSQL

El backend centraliza la conexión a PostgreSQL mediante `pg.Pool`.

Actualmente se utilizan las variables:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

La configuración del pool no declara una propiedad `ssl`.

Por lo tanto, con la evidencia disponible en el repositorio no se puede afirmar que la conexión entre Express y PostgreSQL esté protegida actualmente mediante TLS/SSL.

### 3.2 Variables de entorno

El repositorio excluye expresamente archivos de variables de entorno reales:

```text
.env
backend/.env
frontend/.env
```

Esta medida reduce el riesgo de publicar secretos accidentalmente en GitHub.

El archivo `.env.example` utiliza valores de ejemplo para la clave de OpenAI y advierte que un `.env` real no debe subirse al repositorio.

### 3.3 Secretos de autenticación

El código actual todavía contiene valores de desarrollo por defecto dentro de la configuración de autenticación.

En particular, existe un secreto de token de desarrollo usado como fallback cuando no se define la variable correspondiente.

Este comportamiento se considera aceptable únicamente como deuda técnica de entorno académico o desarrollo y no como control válido para producción.

La política final exige que los secretos de autenticación reales provengan del entorno de ejecución y no de valores incluidos en el código fuente.

### 3.4 Contraseñas de usuarios

ALFI BOT no debe almacenar contraseñas en texto plano.

El sistema utiliza hashes para la autenticación. Un hash de contraseña protege el secreto de autenticación frente a lectura directa, pero no cifra otros datos de la base.

Por lo tanto:

```text
hash de contraseña != cifrado de base de datos
```

## 4. Política de protección de datos en reposo

### 4.1 Principio general

Los datos en reposo comprenden toda información persistida físicamente o almacenada de manera no transitoria.

En ALFI BOT esto incluye:

- archivos de datos de PostgreSQL;
- tablas y registros;
- índices;
- archivos WAL cuando correspondan;
- copias de seguridad;
- archivos exportados;
- archivos `.env` locales;
- logs que puedan contener información operacional.

La protección en reposo debe impedir o reducir el impacto de acceso físico o lógico no autorizado a estos archivos.

## 5. Clasificación de la información almacenada

### 5.1 Información crítica

Se consideran críticos:

- contraseñas y hashes de contraseña;
- credenciales de PostgreSQL;
- secretos de autenticación;
- claves de servicios externos;
- información de auditoría;
- respaldos completos de la base.

### 5.2 Información confidencial de aplicación

Se consideran datos de aplicación protegidos:

- nombre;
- correo;
- celular;
- datos de perfil;
- contenido enviado para análisis;
- historial de análisis;
- resultados asociados al usuario.

### 5.3 Información operativa

Comprende:

- niveles de riesgo;
- señales de alerta;
- recomendaciones;
- métricas agregadas;
- datos técnicos no sensibles.

Esta clasificación no implica que la información operativa sea pública.

## 6. Hashing de contraseñas

Las contraseñas deben mantenerse mediante un algoritmo de hashing adecuado y nunca recuperable en texto plano.

La política establece:

1. nunca guardar la contraseña original;
2. nunca mostrar hashes en APIs, reportes o auditorías;
3. nunca registrar contraseñas en logs;
4. nunca incluir contraseñas en commits;
5. mantener la comparación de credenciales exclusivamente en el backend;
6. utilizar el mecanismo de hashing vigente del sistema para usuarios registrados.

El hashing resuelve un problema específico de autenticación y no sustituye el cifrado del almacenamiento.

## 7. Cifrado general de PostgreSQL en reposo

El repositorio actual no contiene evidencia suficiente para afirmar que el directorio físico de PostgreSQL esté cifrado.

Por ello, el Plan de Seguridad registrará el estado de la siguiente manera:

**Estado actual:** no demostrado a nivel de proyecto.

**Política para despliegue productivo:** el volumen, disco o almacenamiento donde se encuentren los archivos de PostgreSQL debe contar con cifrado en reposo provisto por el sistema operativo, infraestructura o servicio administrado utilizado.

En el entorno académico local, este control puede quedar documentado como recomendación cuando no exista infraestructura separada para demostrarlo.

No se afirmará que existe cifrado físico mientras no exista evidencia verificable.

## 8. Cifrado de campos

No todos los campos requieren cifrado individual dentro de PostgreSQL.

Para el alcance actual de ALFI BOT se priorizan:

- mínimo privilegio;
- hashing de contraseñas;
- no exposición de secretos;
- restricciones de acceso;
- respaldo seguro;
- cifrado del almacenamiento cuando el entorno lo permita.

El cifrado de columnas específicas puede considerarse en una versión futura si ALFI BOT almacena datos de mayor sensibilidad que justifiquen administración adicional de claves.

No se incorporará cifrado de columnas únicamente para simular un control académico sin necesidad funcional.

## 9. Protección de archivos `.env`

Los archivos `.env` contienen o pueden contener secretos.

La política establece:

- no versionarlos;
- no enviarlos junto con entregables públicos;
- no incluirlos en capturas si muestran secretos;
- utilizar `.env.example` únicamente con nombres de variables y valores ficticios;
- mantener las credenciales locales bajo control del equipo autorizado;
- cambiar cualquier secreto que haya sido expuesto accidentalmente.

La exclusión mediante `.gitignore` es un control existente observable en el proyecto.

## 10. Protección de copias de seguridad

Un respaldo contiene potencialmente la misma información sensible que la base original.

Por lo tanto, la política establece que:

1. los backups deben mantenerse fuera del repositorio Git;
2. no deben incluirse en carpetas públicas;
3. deben almacenarse en una ubicación controlada;
4. para producción deben utilizar almacenamiento cifrado;
5. el acceso debe limitarse a personal autorizado;
6. su restauración debe probarse;
7. el ciclo de respaldo debe relacionarse con los valores definidos de RPO y RTO.

La implementación y evidencia de respaldo se desarrolla en la actividad correspondiente del proyecto.

## 11. Política de cifrado en tránsito

### 11.1 Principio general

Los datos están en tránsito cuando circulan entre componentes.

ALFI BOT tiene los siguientes flujos relevantes:

```text
Usuario / navegador
        |
        v
Frontend
        |
        v
Backend Express
        |
        +------> PostgreSQL
        |
        +------> OpenAI
```

La necesidad de cifrado depende de si la comunicación abandona un entorno local controlado.

## 12. Frontend y backend

En un despliegue remoto o productivo, la comunicación entre navegador y servidor debe realizarse mediante HTTPS.

La política establece:

- no utilizar HTTP sin cifrado para autenticación en producción;
- proteger tokens y credenciales durante la transmisión;
- utilizar certificados válidos en el entorno desplegado;
- redirigir o bloquear tráfico inseguro cuando corresponda.

En desarrollo local puede utilizarse HTTP en `localhost` como excepción controlada.

## 13. Backend y PostgreSQL

### 13.1 Estado actual

El archivo de conexión actual no especifica:

```javascript
ssl: ...
```

Por tanto, desde el repositorio no existe evidencia de TLS habilitado para PostgreSQL.

### 13.2 Entorno local

Cuando Express y PostgreSQL se ejecutan en el mismo equipo o en un entorno local académico controlado, se admite temporalmente una conexión sin TLS como excepción de desarrollo.

Esta excepción debe cumplir:

- PostgreSQL no debe exponerse innecesariamente a redes externas;
- las credenciales deben mantenerse fuera del código fuente;
- el usuario de la aplicación debe aplicar mínimo privilegio;
- la configuración no debe presentarse como equivalente a producción.

### 13.3 Entorno remoto o productivo

Si PostgreSQL se ejecuta en otro servidor, nube o red distinta del backend, TLS pasa a ser un requisito de seguridad.

La configuración deberá:

- habilitar SSL/TLS en PostgreSQL o en el servicio administrado utilizado;
- configurar el cliente Node.js para utilizar SSL;
- validar certificados cuando el entorno lo permita;
- evitar configuraciones que deshabiliten la validación sin justificación;
- documentar certificados, autoridad emisora y renovación cuando corresponda.

## 14. Backend y OpenAI

La aplicación utiliza un servicio externo para procesamiento mediante IA.

La política establece:

- utilizar exclusivamente endpoints HTTPS del proveedor;
- mantener la API key fuera del repositorio;
- transmitir únicamente la información necesaria para ejecutar el análisis;
- no registrar la API key;
- rotar la clave ante cualquier exposición.

El archivo `.env.example` evidencia que la clave se espera desde una variable de entorno y no como un secreto real versionado.

## 15. Gestión de claves y secretos

La política de ALFI BOT establece que todo secreto real debe cumplir:

1. no estar escrito directamente en el código;
2. no estar dentro de scripts SQL versionados;
3. no aparecer en commits;
4. no almacenarse en documentos públicos;
5. mantenerse en variables de entorno o un mecanismo de secretos equivalente;
6. tener posibilidad de rotación;
7. cambiarse inmediatamente si existe exposición.

Para un entorno productivo sería preferible un gestor de secretos de la plataforma de despliegue.

Para el entorno académico se aceptan variables de entorno locales correctamente excluidas de Git.

## 16. Hallazgo: valores de desarrollo por defecto

Durante la revisión se identifica que la configuración de autenticación contiene valores de desarrollo por defecto.

Esto representa una diferencia entre:

```text
configuración funcional para desarrollo
```

y:

```text
configuración segura para producción
```

La política establece que en producción el servidor deberá requerir secretos configurados explícitamente y fallar de manera segura cuando falten secretos críticos.

La eliminación o endurecimiento de estos valores corresponde a la actividad de hardening posterior, no a esta subtarea documental.

## 17. Matriz de controles

| Control | Estado actual | Política objetivo |
| --- | --- | --- |
| `.env` fuera de Git | Implementado | Mantener |
| API key real fuera del repositorio | Implementado por diseño | Mantener |
| Password en texto plano | No permitido | Mantener prohibición |
| Hash de contraseña | Implementado | Mantener |
| Cifrado físico de PostgreSQL | No demostrado | Requerido en producción |
| Cifrado de backups | No demostrado | Requerido para backups productivos |
| HTTPS navegador-servidor | Depende del entorno | Requerido en producción |
| TLS Express-PostgreSQL | No configurado explícitamente | Requerido si la BD es remota |
| Secretos de autenticación sin fallback inseguro | Pendiente | Requerido en producción |
| Rotación de secretos | No demostrada | Política requerida ante exposición |

## 18. Controles implementados frente a recomendaciones

### Implementados o verificables

- exclusión de `.env` mediante `.gitignore`;
- variables de entorno para configuración;
- clave OpenAI prevista mediante variable de entorno;
- hashing de contraseñas;
- separación entre frontend y conexión directa a PostgreSQL.

### Pendientes o no demostrados

- TLS en la conexión PostgreSQL;
- cifrado físico del almacenamiento de PostgreSQL;
- cifrado de backups;
- eliminación de secretos de desarrollo por defecto;
- infraestructura HTTPS productiva;
- gestor centralizado de secretos.

Esta diferencia debe conservarse en el documento final para no presentar controles inexistentes como si estuvieran implementados.

## 19. Política resumida

Para ALFI BOT se adopta la siguiente política:

> Los secretos nunca deben persistirse en texto plano dentro del repositorio. Las contraseñas de usuarios deben almacenarse únicamente mediante hashing. Los datos y respaldos de PostgreSQL deben utilizar almacenamiento cifrado en entornos productivos. Toda comunicación remota entre clientes, backend, PostgreSQL y servicios externos debe utilizar canales cifrados. Las excepciones sin TLS quedan limitadas a entornos locales controlados de desarrollo y deben documentarse como tales.

## 20. Resultado de AFB-368

La política permite distinguir claramente tres situaciones:

1. **controles existentes**, como variables de entorno, exclusión de `.env` y hashing;
2. **limitaciones actuales**, como ausencia de SSL explícito en `pg.Pool`;
3. **controles requeridos para producción**, como TLS, HTTPS, almacenamiento cifrado y gestión estricta de secretos.

La siguiente subtarea utilizará estos hallazgos para aplicar y documentar hardening y gestión de vulnerabilidades sin mezclar ese trabajo con la presente definición de política.
