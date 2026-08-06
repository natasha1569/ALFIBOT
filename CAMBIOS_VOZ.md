# Actualización: entrada y respuesta por voz en ALFI BOT

## Cambios incluidos

1. Botón **Dictar con voz** en la pestaña Texto.
2. Transcripción en español de Ecuador (`es-EC`) directamente en el cuadro de texto.
3. Estado visible mientras el micrófono escucha y mientras reconoce palabras.
4. Mensajes claros para micrófono bloqueado, micrófono no disponible, falta de voz o error de red.
5. Lectura automática del resultado cuando termina el análisis.
6. Botón **Escuchar resultado** para repetir la respuesta y **Detener voz** para cancelarla.
7. Lectura por voz también para consultas fuera del alcance y errores del análisis.
8. No se agregaron dependencias nuevas de npm y no se modificó el backend.

## Archivos que deben reemplazarse

Copie estos archivos conservando exactamente sus rutas:

- `frontend/src/components/AnalysisForm.jsx`
- `frontend/src/components/ResultCard.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/App.css`

Agregue este archivo nuevo:

- `frontend/src/services/speech.service.js`

## Actualización manual del proyecto

### 1. Hacer una copia de seguridad

Antes de reemplazar los archivos, copie la carpeta actual del proyecto o, por lo menos, los cuatro archivos que serán sustituidos.

### 2. Reemplazar los archivos

Abra la carpeta del proyecto y copie los archivos del paquete respetando la estructura indicada. No cambie los nombres ni las extensiones.

### 3. Instalar dependencias solamente si todavía no existen

Abra una terminal dentro de la carpeta `frontend`:

```bash
cd frontend
npm install
```

Esta actualización no incorpora paquetes nuevos. Si la carpeta `node_modules` ya existe y el proyecto funciona, puede omitir este paso.

### 4. Probar en desarrollo

Dentro de `frontend` ejecute:

```bash
npm run dev
```

Abra la dirección que muestre Vite, normalmente:

```text
http://localhost:5173
```

### 5. Probar el dictado

1. Inicie sesión en ALFI BOT.
2. Abra la pestaña **Texto**.
3. Pulse **Dictar con voz**.
4. Cuando el navegador solicite permiso, seleccione **Permitir micrófono**.
5. Hable con claridad.
6. Pulse **Detener dictado**.
7. Revise el texto y pulse **Analizar con ALFI BOT**.
8. Al aparecer el resultado, ALFI BOT lo leerá automáticamente.
9. Use **Escuchar resultado** para repetirlo o **Detener voz** para cancelarlo.

## Generar la versión de producción

Dentro de `frontend` ejecute:

```bash
npm run build
```

Se generará la carpeta:

```text
frontend/dist
```

Publique esa carpeta con el mismo procedimiento que ya utiliza actualmente.

## Actualización en un servidor con Nginx

Si Nginx sirve directamente la carpeta compilada del frontend:

1. Suba y reemplace los cinco archivos indicados.
2. Entre por terminal a la carpeta `frontend`.
3. Ejecute:

```bash
npm install
npm run build
```

4. Copie el contenido nuevo de `frontend/dist` a la carpeta pública configurada en Nginx.
5. Recargue Nginx solamente si su configuración lo requiere:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

No es necesario modificar ni reiniciar el backend por este cambio, salvo que su despliegue reinicie toda la aplicación de manera conjunta.

## Requisitos importantes

- Para el dictado, use preferentemente Google Chrome o Microsoft Edge actualizado.
- En producción, la página debe abrirse mediante HTTPS. En desarrollo también funciona desde `localhost`.
- El usuario debe autorizar expresamente el uso del micrófono.
- La lectura del resultado utiliza las voces disponibles en el sistema operativo del usuario.
- En algunos navegadores el reconocimiento de voz no está disponible; en ese caso la aplicación mantiene el ingreso manual normal.

## Solución de problemas

### El botón Dictar con voz aparece deshabilitado

El navegador no expone la función de reconocimiento de voz. Pruebe con Chrome o Edge actualizado.

### El navegador indica que el micrófono está bloqueado

Pulse el candado situado junto a la dirección de la página, abra la configuración del sitio, cambie **Micrófono** a **Permitir** y recargue la página.

### Funciona en localhost, pero no en el dominio

Compruebe que el dominio se abra con `https://` y que el certificado sea válido.

### Transcribe, pero no se escucha la respuesta

Revise el volumen del equipo, el dispositivo de salida y las voces de español instaladas en Windows. También puede pulsar manualmente **Escuchar resultado**.

### La voz se corta al iniciar un nuevo análisis

Ese comportamiento es intencional: al iniciar otro análisis se detiene la lectura anterior para evitar que dos respuestas se reproduzcan al mismo tiempo.
