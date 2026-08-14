# AFB-281 — Casos de Demostración de ALFI BOT

## Objetivo

Preparar casos de prueba representativos para demostrar durante la sustentación el funcionamiento del analizador de ALFI BOT ante diferentes niveles de riesgo financiero.

## Caso 1 — Riesgo bajo

### Contenido de prueba

El Banco Central publicó información educativa sobre cómo identificar transferencias bancarias y revisar movimientos de una cuenta. La información es únicamente informativa y recomienda utilizar los canales oficiales de cada institución financiera.

### Características

- No solicita dinero.
- No solicita contraseñas.
- No solicita datos bancarios.
- No promete ganancias.
- No utiliza amenazas.
- Recomienda utilizar fuentes oficiales.

### Resultado esperado

ALFI BOT debería identificar pocas o ninguna señal relacionada con fraude y presentar un nivel de riesgo bajo.

### Resultado obtenido

Pendiente de ejecutar en ALFI BOT.

### Evidencia

Pendiente de captura.

---

## Caso 2 — Riesgo medio

### Contenido de prueba

Tenemos una oportunidad de inversión disponible únicamente por tiempo limitado. Puedes obtener beneficios especiales si te registras hoy. La información completa será proporcionada después de realizar el registro con nuestro asesor.

### Características

- Utiliza urgencia comercial.
- Presenta información incompleta.
- Promete beneficios sin explicar claramente las condiciones.
- No solicita directamente una transferencia inmediata.
- Requiere precaución y verificación adicional.

### Resultado esperado

ALFI BOT debería identificar varias señales preventivas y presentar un nivel de riesgo medio o advertir que la información requiere verificación.

### Resultado obtenido

Pendiente de ejecutar en ALFI BOT.

### Evidencia

Pendiente de captura.

---

## Caso 3 — Riesgo alto

### Contenido de prueba

Inversión garantizada con ganancias del 50 % en pocos días. Para asegurar tu cupo debes transferir el dinero hoy mismo a la cuenta indicada por nuestro asesor. La oportunidad termina en pocas horas y no necesitas realizar ninguna verificación adicional.

### Características

- Promete ganancias garantizadas.
- Utiliza presión y urgencia.
- Solicita una transferencia de dinero.
- Utiliza un contacto o cuenta que debe verificarse.
- Desaconseja realizar verificaciones.
- Presenta múltiples señales asociadas a posibles fraudes financieros.

### Resultado esperado

ALFI BOT debería identificar múltiples señales de alerta y presentar un nivel de riesgo alto junto con recomendaciones preventivas.

### Resultado obtenido

Pendiente de ejecutar en ALFI BOT.

### Evidencia

Pendiente de captura.

---

## Procedimiento de demostración

Para cada caso:

1. Iniciar frontend, backend y PostgreSQL.
2. Iniciar sesión en ALFI BOT.
3. Abrir el analizador.
4. Seleccionar análisis de texto.
5. Copiar el contenido del caso.
6. Ejecutar el análisis.
7. Esperar la respuesta.
8. Revisar el nivel de riesgo.
9. Revisar el resumen.
10. Revisar las señales detectadas.
11. Revisar las recomendaciones.
12. Tomar una captura de pantalla.
13. Registrar en este documento el resultado realmente obtenido.

## Tabla de resultados

| Caso | Resultado esperado | Resultado real | Evidencia | Estado |
|---|---|---|---|---|
| Riesgo bajo | Bajo | Pendiente | Pendiente | Pendiente |
| Riesgo medio | Medio/advertencia | Pendiente | Pendiente | Pendiente |
| Riesgo alto | Alto | Pendiente | Pendiente | Pendiente |

## Criterio de finalización

AFB-281 podrá considerarse completamente ejecutada cuando los tres casos hayan sido probados realmente en ALFI BOT y sus resultados hayan sido registrados.

El resultado real no debe modificarse para hacerlo coincidir artificialmente con el resultado esperado.

Si ALFI BOT devuelve una clasificación diferente, se debe registrar exactamente el resultado obtenido y analizar la diferencia.

## Conclusión

Los tres casos permiten preparar una demostración progresiva del funcionamiento de ALFI BOT, comenzando con contenido informativo y terminando con un escenario que presenta múltiples señales de posible fraude financiero.