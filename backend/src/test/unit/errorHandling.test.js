import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  AppError,
  ERROR_CATALOG,
  ERROR_CODES,
  createAppError,
  getPublicError,
  isTimeoutError,
  sendError,
} from '../../errors/errorCatalog.js';
import { analyzeWithAI, mapOpenAIError } from '../../services/openai.service.js';

const BACKEND_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', '..', '..',
);

const createResponse = () => {
  const result = { status: null, body: null };

  return {
    result,
    response: {
      status(status) {
        result.status = status;
        return this;
      },
      json(body) {
        result.body = body;
        return body;
      },
    },
  };
};

test('AFB-148 define códigos HTTP coherentes para los errores esperados', () => {
  assert.equal(ERROR_CATALOG[ERROR_CODES.INVALID_REQUEST].status, 400);
  assert.equal(ERROR_CATALOG[ERROR_CODES.AUTHENTICATION_REQUIRED].status, 401);
  assert.equal(ERROR_CATALOG[ERROR_CODES.FORBIDDEN].status, 403);
  assert.equal(ERROR_CATALOG[ERROR_CODES.NOT_FOUND].status, 404);
  assert.equal(ERROR_CATALOG[ERROR_CODES.CONFLICT].status, 409);
  assert.equal(ERROR_CATALOG[ERROR_CODES.AI_SERVICE_UNAVAILABLE].status, 502);
  assert.equal(ERROR_CATALOG[ERROR_CODES.OPENAI_API_KEY_MISSING].status, 503);
  assert.equal(ERROR_CATALOG[ERROR_CODES.AI_TIMEOUT].status, 504);
});

test('sendError conserva el contrato retrocompatible error + code', () => {
  const { response, result } = createResponse();

  sendError(response, ERROR_CODES.INVALID_LINK);

  assert.equal(result.status, 400);
  assert.deepEqual(result.body, {
    error: 'El enlace debe comenzar con http:// o https://.',
    code: 'INVALID_LINK',
  });
});

test('un error interno nunca expone detalles de PostgreSQL ni secretos', () => {
  const internalError = new Error(
    'relation "auditoria" does not exist; password=SuperSecret; postgresql://alfi:clave@localhost/db',
  );
  const publicError = getPublicError(internalError);

  assert.deepEqual(publicError, {
    code: ERROR_CODES.INTERNAL_ERROR,
    status: 500,
    message: 'Ocurrió un error interno en el servidor.',
  });
  assert.doesNotMatch(JSON.stringify(publicError), /auditoria|SuperSecret|clave/);
});

test('AFB-149 devuelve un mensaje explícito cuando falta OPENAI_API_KEY', async () => {
  const previousApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    await assert.rejects(
      analyzeWithAI({
        type: 'text',
        content: 'Analiza este préstamo sospechoso que solicita un pago anticipado.',
      }),
      (error) => (
        error instanceof AppError
        && error.code === ERROR_CODES.OPENAI_API_KEY_MISSING
        && error.status === 503
        && /OPENAI_API_KEY/.test(error.publicMessage)
      ),
    );
  } finally {
    if (previousApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousApiKey;
  }
});

test('los timeout del proveedor se convierten en una respuesta 504 segura', () => {
  const providerError = Object.assign(
    new Error('upstream detail with model and account data'),
    { code: 'ETIMEDOUT' },
  );
  const mappedError = mapOpenAIError(providerError);

  assert.equal(isTimeoutError(providerError), true);
  assert.equal(mappedError.code, ERROR_CODES.AI_TIMEOUT);
  assert.equal(mappedError.status, 504);
  assert.doesNotMatch(mappedError.publicMessage, /upstream|account|model/);
});

test('AppError puede conservar causa técnica sin incluirla en la respuesta', () => {
  const technicalCause = new Error('SQLSTATE 42P01: relation alfi.auditoria');
  const appError = createAppError(ERROR_CODES.DATABASE_UNAVAILABLE, {
    cause: technicalCause,
    internalMessage: technicalCause.message,
  });
  const publicError = getPublicError(appError);

  assert.equal(appError.cause, technicalCause);
  assert.equal(publicError.status, 503);
  assert.doesNotMatch(JSON.stringify(publicError), /42P01|auditoria/);
});

test('el controlador no concatena error.message en respuestas al frontend', async () => {
  const controller = await readFile(
    path.join(BACKEND_ROOT, 'src/controllers/analysis.controller.js'),
    'utf8',
  );

  assert.doesNotMatch(controller, /Detalle backend/);
  assert.doesNotMatch(controller, /error:\s*`[^`]*\$\{error\.message\}/);
});
