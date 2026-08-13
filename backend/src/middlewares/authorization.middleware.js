import { roleHasPermission } from '../config/permissions.js';
import { ERROR_CODES, sendError } from '../errors/errorCatalog.js';

export const requireRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
      return sendError(res, ERROR_CODES.AUTHENTICATION_REQUIRED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, ERROR_CODES.FORBIDDEN, {
        publicMessage: 'No tienes permisos para acceder a este recurso.',
      });
    }

    return next();
};

export const requirePermission = (permission) => (req, res, next) => {
    if (!req.user) {
      return sendError(res, ERROR_CODES.AUTHENTICATION_REQUIRED);
    }

    if (!roleHasPermission(req.user.role, permission)) {
      return sendError(res, ERROR_CODES.FORBIDDEN);
    }

    return next();
};
