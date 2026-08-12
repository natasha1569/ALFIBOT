import { roleHasPermission } from '../config/permissions.js';

export function requireRoles(...allowedRoles) {
  return function roleAuthorizationMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Debes iniciar sesión para continuar.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso.',
      });
    }

    return next();
  };
}

export function requirePermission(permission) {
  return function permissionAuthorizationMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Debes iniciar sesión para continuar.',
      });
    }

    if (!roleHasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta operación.',
      });
    }

    return next();
  };
}
