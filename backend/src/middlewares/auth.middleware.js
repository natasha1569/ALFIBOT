import { verifyAuthToken } from '../services/token.service.js';
import { isKnownRole } from '../config/permissions.js';
import { ERROR_CODES, sendError } from '../errors/errorCatalog.js';

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return sendError(res, ERROR_CODES.AUTHENTICATION_REQUIRED);
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    req.user = verifyAuthToken(token);

    if (!isKnownRole(req.user?.role)) {
      return sendError(res, ERROR_CODES.FORBIDDEN, {
        publicMessage: 'La cuenta no tiene un rol de aplicación autorizado.',
      });
    }

    return next();
  } catch {
    return sendError(res, ERROR_CODES.INVALID_SESSION);
  }
};

export default authMiddleware;
