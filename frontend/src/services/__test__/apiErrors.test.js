import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, createApiError } from '../api.js';

test('AFB-146 convierte el contrato del backend en un ApiError visible', () => {
  const error = createApiError(
    {
      error: 'El servicio de análisis tardó demasiado en responder. Intenta nuevamente.',
      code: 'AI_TIMEOUT',
    },
    504,
  );

  assert.ok(error instanceof ApiError);
  assert.equal(error.message, 'El servicio de análisis tardó demasiado en responder. Intenta nuevamente.');
  assert.equal(error.code, 'AI_TIMEOUT');
  assert.equal(error.status, 504);
});

test('AFB-146 mantiene compatibilidad con respuestas antiguas del backend', () => {
  const error = createApiError({ error: 'Contenido inválido.' }, 400);

  assert.equal(error.message, 'Contenido inválido.');
  assert.equal(error.code, 'UNKNOWN_ERROR');
  assert.equal(error.status, 400);
});

test('AFB-146 admite también un error estructurado sin exponer detalles', () => {
  const error = createApiError({
    error: {
      code: 'DATABASE_UNAVAILABLE',
      message: 'No se pudo acceder a la información solicitada. Intenta nuevamente.',
    },
  }, 503);

  assert.equal(error.code, 'DATABASE_UNAVAILABLE');
  assert.equal(error.status, 503);
  assert.doesNotMatch(error.message, /PostgreSQL|SQLSTATE|relation/);
});
