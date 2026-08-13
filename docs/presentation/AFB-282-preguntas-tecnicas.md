# AFB-282 — Preguntas técnicas frecuentes

Documento de apoyo para la sustentación de ALFI BOT.

## 1. ¿Qué problema resuelve ALFI BOT?

Ayuda al usuario a identificar señales preventivas de posibles fraudes financieros antes de entregar dinero, documentos o datos personales. Analiza textos, enlaces e imágenes y devuelve riesgo, señales y recomendaciones. No reemplaza una investigación legal ni garantiza que un contenido sea fraudulento.

## 2. ¿Por qué se usó React y Vite?

React permite dividir la interfaz en componentes reutilizables y manejar estados como sesión, análisis, historial y resultados. Vite ofrece un entorno de desarrollo rápido y una compilación optimizada para producción.

## 3. ¿Por qué se separó el frontend del backend?

Para evitar que el navegador acceda directamente a PostgreSQL o a la API key de OpenAI. React gestiona la experiencia del usuario; Express valida, autoriza, consulta servicios externos y persiste información.

## 4. ¿Por qué se eligió PostgreSQL?

Porque el sistema maneja relaciones entre usuarios, roles, análisis, señales, recomendaciones e intereses. PostgreSQL aporta transacciones, claves foráneas, restricciones, roles, vistas, auditoría y herramientas de respaldo.

## 5. ¿Cómo se conserva la integridad al guardar un análisis?

El backend inicia una transacción, inserta el análisis y luego sus señales y recomendaciones. Si una operación falla, ejecuta `ROLLBACK`; si todas terminan correctamente, ejecuta `COMMIT`.

## 6. ¿Cómo funciona el análisis con OpenAI?

El backend valida el tipo y tamaño de la entrada, construye instrucciones con una política central, consulta el modelo principal y normaliza la respuesta JSON. La configuración contempla un modelo de respaldo y un tiempo máximo de espera.

## 7. ¿Cómo se analizan las imágenes?

Se valida formato, firma binaria y tamaño. Después se ejecuta una etapa de visión/OCR para extraer texto y evidencia, y una segunda etapa aplica la política preventiva al contexto extraído y a la imagen.

## 8. ¿Qué categorías de fraude reconoce el sistema?

La taxonomía vigente contiene crédito falso, esquema Ponzi, esquema piramidal e inversión fraudulenta. Un contenido puede tener nivel de riesgo sin encajar en una de esas categorías; en ese caso la categoría queda nula y no se inventa una clasificación.

## 9. ¿Cómo funciona la autenticación?

Las contraseñas se almacenan como hash. Cuando las credenciales son válidas, el backend genera un token firmado con vigencia limitada. El frontend guarda la sesión y envía el token en las solicitudes protegidas.

## 10. ¿Cómo se implementó RBAC?

Se definieron los roles funcionales usuario, auditor y administrador con una matriz de permisos en backend. Cada ruta sensible aplica middleware de autenticación y autorización. PostgreSQL también cuenta con roles técnicos de mínimo privilegio.

## 11. ¿Por qué el backend debe validar el rol si React ya oculta botones?

Porque el usuario puede construir una petición HTTP sin usar la interfaz. Ocultar un botón mejora la experiencia, pero solo el backend puede impedir realmente una operación no autorizada y devolver `401` o `403`.

## 12. ¿Cómo se protege la información sensible?

Los `.env` están excluidos del repositorio, la API key permanece en el backend, las contraseñas se guardan mediante hash y los diagnósticos de base de datos están deshabilitados por defecto. Las vistas de reportería evitan exponer nombre, correo, celular, contenido y hash.

## 13. ¿Qué diferencia existe entre reportería y auditoría?

La reportería agrupa tendencias de riesgo, categoría, tipo y atributos generales para apoyar decisiones. La auditoría registra acciones técnicas y cambios. Una no sustituye a la otra.

## 14. ¿Cómo se prueba el sistema?

El repositorio tiene pruebas unitarias de política de IA, imágenes, riesgo, categorías, administración, historial y exportación. GitHub Actions ejecuta las suites de backend y frontend y compila React en cada PR y actualización de `main`. Las pruebas que requieren PostgreSQL se ejecutan contra una base de pruebas configurada.

## 15. ¿Qué ocurre si OpenAI o PostgreSQL fallan?

El backend devuelve un error controlado, evita dejar transacciones incompletas y no debe mostrar secretos internos. La interfaz informa que la operación no pudo completarse. La disponibilidad externa no puede garantizarse desde la aplicación.

## 16. ¿Cómo se comparten los resultados?

ALFI BOT construye un informe con riesgo, resumen, señales, recomendaciones y advertencia. Puede abrir WhatsApp Web con el texto preparado, copiarlo al portapapeles o descargarlo como PDF. El usuario decide si lo envía.

## 17. ¿Qué metodología se utilizó?

Scrum. El trabajo se organizó en épicas, historias, tareas y subtareas dentro de Jira; GitHub conserva la implementación mediante ramas, commits y Pull Requests vinculados con claves como `AFB-268`.

## 18. ¿Qué limitación técnica debe declararse actualmente?

Los scripts SQL disponibles son incrementales y esperan una estructura base existente. El instalador completo desde una base vacía todavía corresponde a AFB-324. Esta limitación debe explicarse y no ocultarse durante la sustentación.

## 19. ¿Cómo podría escalar la solución?

Separando servicios de análisis y procesamiento de imágenes, usando almacenamiento administrado, colas para trabajos costosos, observabilidad y despliegue horizontal del backend. Antes debe medirse la carga real.

## 20. ¿Cuál es la visión de monetización?

Mantener acceso gratuito para usuarios finales y, a mediano plazo, utilizar publicidad o información agregada de tendencias sin exponer datos personales ni contenido individual. Cualquier uso debe respetar privacidad, consentimiento y finalidad declarada.
