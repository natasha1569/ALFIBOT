import { clearAuthSession, getAuthToken } from '../auth/authStorage.js';

// Toda la comunicación con el backend pasa por aquí. Ningún otro archivo
// del frontend debe llamar a fetch() directamente ni conocer nada de OpenAI:
// eso vive exclusivamente en el backend.

const runtimeEnv = import.meta.env || {};
const API_BASE_URL = runtimeEnv.VITE_API_URL || 'http://localhost:4000';
// El análisis de imágenes ejecuta dos etapas: visión/OCR y evaluación de riesgo.
const REQUEST_TIMEOUT_MS = Number(runtimeEnv.VITE_REQUEST_TIMEOUT_MS || 90000);

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.status = Number(options.status || 0);
  }
}

export const createApiError = (data, status) => {
  const nestedError = data?.error && typeof data.error === 'object'
    ? data.error
    : null;
  const message = typeof data?.error === 'string'
    ? data.error
    : nestedError?.message;
  const code = data?.code || nestedError?.code || 'UNKNOWN_ERROR';

  return new ApiError(
    message || 'Ocurrió un error inesperado al comunicarse con el backend.',
    { code, status },
  );
};

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
      throw new ApiError(
        'La consulta tardó demasiado. Intenta nuevamente.',
        { code: 'CLIENT_TIMEOUT', status: 504 },
      );
    }
    throw new ApiError(
      `No se pudo conectar con el backend en ${API_BASE_URL}. ¿Está corriendo?`,
      { code: 'NETWORK_ERROR' },
    );
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
    throw createApiError(data, response.status);
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

export function fetchFraudTrends(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return request(`/api/reporting/fraud-trends${query ? `?${query}` : ''}`);
}

export function fetchAuditEvents(filters = {}) {
  return request(`/api/audit/events${buildQuery(filters)}`);
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function fetchAdminUsers(filters = {}) {
  return request(`/api/admin/users${buildQuery(filters)}`);
}

export function updateAdminUser(userId, changes) {
  return request(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}
