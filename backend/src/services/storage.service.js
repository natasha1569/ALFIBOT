import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// -----------------------------------------------------------------------
// NOTA DE ARQUITECTURA
// -----------------------------------------------------------------------
// Este archivo es la ÚNICA parte del sistema que sabe que el historial
// vive en un JSON local. El resto de la app (controllers, rutas) solo
// conoce las funciones getHistory(), saveAnalysis() y clearHistory().
//
// Para migrar a una base SQL más adelante, basta con reescribir las
// funciones de este archivo (por ejemplo usando Prisma, Knex o el driver
// que se elija) manteniendo exactamente las mismas firmas. Nada fuera de
// este archivo debería necesitar cambios.
// -----------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'analyses.json');
const MAX_INPUT_PREVIEW = 150;

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readData() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = raw.trim() ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[storage.service] Error leyendo analyses.json:', error.message);
    return [];
  }
}

function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function buildInputPreview(type, content) {
  if (type === 'image') {
    return '[Imagen adjunta]';
  }
  if (typeof content !== 'string') {
    return '';
  }
  return content.length > MAX_INPUT_PREVIEW ? `${content.slice(0, MAX_INPUT_PREVIEW)}…` : content;
}

/**
 * Guarda un análisis exitoso en el historial. Recibe el tipo/contenido
 * original más el resultado ya normalizado que devolvió la IA.
 */
export function saveAnalysis({ type, content, riskLevel, summary, warningSigns, recommendations }) {
  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type,
    inputPreview: buildInputPreview(type, content),
    riskLevel,
    summary,
    warningSigns: warningSigns || [],
    recommendations: recommendations || [],
  };

  const data = readData();
  data.unshift(entry); // el más reciente primero
  writeData(data);

  return entry;
}

export function getHistory() {
  return readData();
}

export function clearHistory() {
  writeData([]);
}
