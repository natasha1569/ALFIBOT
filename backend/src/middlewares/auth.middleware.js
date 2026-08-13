import { verifyAuthToken } from '../services/token.service.js';
import { isKnownRole } from '../config/permissions.js';

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    req.user = verifyAuthToken(token);

    if (!isKnownRole(req.user?.role)) {
      return res.status(403).json({
        error: 'La cuenta no tiene un rol de aplicación autorizado.',
      });
    }

    return next();
  } catch {
    return res.status(401).json({ error: 'La sesión es inválida o ha expirado.' });
  }
};

export default authMiddleware;
