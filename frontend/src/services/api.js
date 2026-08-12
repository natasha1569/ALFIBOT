import { clearAuthSession, getAuthToken } from '../auth/authStorage.js';

// Toda la comunicación con el backend pasa por aquí. Ningún otro archivo
// del frontend debe llamar a fetch() directamente ni conocer nada de OpenAI:
// eso vive exclusivamente en el backend.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
// El análisis de imágenes ejecuta dos etapas: visión/OCR y evaluación de riesgo.
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 90000);

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('La consulta tardó demasiado. Revisa la consola del backend o intenta con un texto más corto.');
    }
    throw new Error(`No se pudo conectar con el backend en ${API_BASE_URL}. ¿Está corriendo?`);
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Respuesta sin cuerpo JSON: se maneja abajo según el status.
  }

  if (response.status === 401) {
    clearAuthSession();
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Ocurrió un error inesperado al comunicarse con el backend.');
  }

  return data;
}

export function analyzeContent({ type, content }) {
  return request('/api/analysis', {
    method: 'POST',
    body: JSON.stringify({ type, content }),
  });
}

export function fetchHistory() {
  return request('/api/analysis/history');
}

export function clearHistory() {
  return request('/api/analysis/history', { method: 'DELETE' });
}

export function login(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: '' },
    body: JSON.stringify(credentials),
  });
}

export function loginAdmin(credentials) {
  return request('/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: '' },
    body: JSON.stringify(credentials),
  });
}

export function loginAuditor(credentials) {
  return request('/api/auth/auditor/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: '' },
    body: JSON.stringify(credentials),
  });
}

export function registerUser(registration) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: '' },
    body: JSON.stringify(registration),
  });
}

export function fetchCurrentUser() {
  return request('/api/auth/me');
}
