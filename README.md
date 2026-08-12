# ALFI BOT

Aplicación web para analizar posibles fraudes financieros mediante inteligencia artificial.

## Requisitos

- Node.js 20 o superior
- npm
- API key de OpenAI

## Instalación

```bash
cd backend
npm install
```
## Arquitectura y selección del motor

Se seleccionó PostgreSQL como motor de base de datos relacional porque ALFI BOT administra información estructurada y relacionada entre roles, usuarios, análisis, señales de alerta y recomendaciones. PostgreSQL permite asegurar la integridad de los datos mediante claves primarias, claves foráneas y restricciones CHECK, UNIQUE y DEFAULT. También permite implementar funciones, triggers de auditoría, vistas para reportes, roles de seguridad y mecanismos de respaldo y restauración. Estas características cubren los requerimientos funcionales de almacenamiento y consulta, así como los requerimientos no funcionales de seguridad, integridad, trazabilidad y disponibilidad.

## Análisis de imágenes

El backend procesa capturas PNG, JPG/JPEG y WEBP de hasta 6 MB en dos etapas. Primero extrae el texto visible y la evidencia visual mediante visión/OCR; después contrasta esa evidencia con la imagen original y aplica la política preventiva de fraude. La API key de OpenAI permanece únicamente en el backend.
