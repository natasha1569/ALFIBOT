export const ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_JSON: 'INVALID_JSON',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  CONTENT_REQUIRED: 'CONTENT_REQUIRED',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  INVALID_LINK: 'INVALID_LINK',
  INVALID_IMAGE: 'INVALID_IMAGE',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_SESSION: 'INVALID_SESSION',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  OPENAI_API_KEY_MISSING: 'OPENAI_API_KEY_MISSING',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_TIMEOUT: 'AI_TIMEOUT',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

export const ERROR_CATALOG = Object.freeze({
  [ERROR_CODES.INVALID_REQUEST]: Object.freeze({
    status: 400,
    message: 'La solicitud contiene datos inválidos.',
  }),
  [ERROR_CODES.INVALID_JSON]: Object.freeze({
    status: 400,
    message: 'El cuerpo de la solicitud debe ser un JSON válido.',
  }),
  [ERROR_CODES.INVALID_CONTENT_TYPE]: Object.freeze({
    status: 400,
    message: 'El tipo de contenido debe ser "text", "link" o "image".',
  }),
  [ERROR_CODES.CONTENT_REQUIRED]: Object.freeze({
    status: 400,
    message: 'El contenido es obligatorio y no puede estar vacío.',
  }),
  [ERROR_CODES.CONTENT_TOO_LONG]: Object.freeze({
    status: 400,
    message: 'El contenido supera el tamaño permitido.',
  }),
  [ERROR_CODES.INVALID_LINK]: Object.freeze({
    status: 400,
    message: 'El enlace debe comenzar con http:// o https://.',
  }),
  [ERROR_CODES.INVALID_IMAGE]: Object.freeze({
    status: 400,
    message: 'La imagen enviada no es válida.',
  }),
  [ERROR_CODES.AUTHENTICATION_REQUIRED]: Object.freeze({
    status: 401,
    message: 'Debes iniciar sesión para continuar.',
  }),
  [ERROR_CODES.INVALID_SESSION]: Object.freeze({
    status: 401,
    message: 'La sesión es inválida o ha expirado.',
  }),
  [ERROR_CODES.INVALID_CREDENTIALS]: Object.freeze({
    status: 401,
    message: 'Correo o contraseña incorrectos.',
  }),
  [ERROR_CODES.ACCOUNT_INACTIVE]: Object.freeze({
    status: 401,
    message: 'La cuenta no se encuentra activa.',
  }),
  [ERROR_CODES.FORBIDDEN]: Object.freeze({
    status: 403,
    message: 'No tienes permisos para realizar esta operación.',
  }),
  [ERROR_CODES.NOT_FOUND]: Object.freeze({
    status: 404,
    message: 'Recurso no encontrado.',
  }),
  [ERROR_CODES.CONFLICT]: Object.freeze({
    status: 409,
    message: 'La operación entra en conflicto con el estado actual.',
  }),
  [ERROR_CODES.PAYLOAD_TOO_LARGE]: Object.freeze({
    status: 413,
    message: 'El contenido enviado supera el tamaño permitido.',
  }),
  [ERROR_CODES.OPENAI_API_KEY_MISSING]: Object.freeze({
    status: 503,
    message: 'El servicio de análisis no está configurado. Falta OPENAI_API_KEY en el backend.',
  }),
  [ERROR_CODES.AI_SERVICE_UNAVAILABLE]: Object.freeze({
    status: 502,
    message: 'El servicio de análisis no está disponible temporalmente.',
  }),
  [ERROR_CODES.AI_TIMEOUT]: Object.freeze({
    status: 504,
    message: 'El servicio de análisis tardó demasiado en responder. Intenta nuevamente.',
  }),
  [ERROR_CODES.DATABASE_UNAVAILABLE]: Object.freeze({
    status: 503,
    message: 'No se pudo acceder a la información solicitada. Intenta nuevamente.',
  }),
  [ERROR_CODES.INTERNAL_ERROR]: Object.freeze({
    status: 500,
    message: 'Ocurrió un error interno en el servidor.',
  }),
});

export class AppError extends Error {
  constructor(code, options = {}) {
    const definition = ERROR_CATALOG[code] || ERROR_CATALOG[ERROR_CODES.INTERNAL_ERROR];
    super(options.internalMessage || definition.message, { cause: options.cause });
    this.name = 'AppError';
    this.code = ERROR_CATALOG[code] ? code : ERROR_CODES.INTERNAL_ERROR;
    this.status = options.status || definition.status;
    this.publicMessage = options.publicMessage || definition.message;
  }
}

export const createAppError = (code, options = {}) => new AppError(code, options);

export const getPublicError = (errorOrCode, options = {}) => {
  if (errorOrCode instanceof AppError) {
    return {
      code: errorOrCode.code,
      status: errorOrCode.status,
      message: errorOrCode.publicMessage,
    };
  }

  const code = ERROR_CATALOG[errorOrCode]
    ? errorOrCode
    : ERROR_CODES.INTERNAL_ERROR;
  const definition = ERROR_CATALOG[code];

  return {
    code,
    status: options.status || definition.status,
    message: options.publicMessage || definition.message,
  };
};

export const sendError = (res, errorOrCode, options = {}) => {
  const publicError = getPublicError(errorOrCode, options);

  return res.status(publicError.status).json({
    error: publicError.message,
    code: publicError.code,
  });
};

export const isTimeoutError = (error) => {
  const name = String(error?.name || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();
  const status = Number(error?.status || error?.statusCode || 0);

  return name.includes('timeout')
    || name === 'aborterror'
    || ['ETIMEDOUT', 'ESOCKETTIMEDOUT'].includes(code)
    || [408, 504].includes(status);
};

const redactSensitiveText = (value) => String(value || '')
  .replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/gi, '$1[REDACTED]@')
  .replace(/(sk-[A-Za-z0-9_-]{8})[A-Za-z0-9_-]+/g, '$1[REDACTED]')
  .replace(/(password|secret|api[_-]?key)\s*[=:]\s*[^\s,;]+/gi, '$1=[REDACTED]');

export const logServerError = (context, error) => {
  const code = error instanceof AppError ? error.code : ERROR_CODES.INTERNAL_ERROR;
  console.error(`[${context}]`, {
    code,
    name: String(error?.name || 'Error'),
    message: redactSensitiveText(error?.message || 'Sin detalle técnico.'),
  });
};
