# ALFI BOT — selector de voz

Esta actualización agrega un selector para escoger la voz usada al leer los resultados.

## Archivos que se reemplazan

- `frontend/src/pages/Home.jsx`
- `frontend/src/services/speech.service.js`
- `frontend/src/App.css`

## Uso

1. Abre ALFI BOT en Chrome o Edge.
2. En el bloque **Voz de ALFI BOT**, abre la lista.
3. Escoge una voz en español.
4. Pulsa **Probar voz**.
5. La selección queda guardada en el navegador y se utilizará en los siguientes análisis.

La lista depende de las voces instaladas en Windows y de las voces que ofrece el navegador. La API del navegador no informa de forma uniforme si una voz es masculina o femenina; por eso se muestra el nombre y el idioma y se incluye el botón de prueba.

## Actualización local

Desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

## Actualización en producción

Desde la carpeta `frontend`:

```bash
npm run build
```

Publica el contenido nuevo de `frontend/dist` con el mismo procedimiento que ya utilizas.
