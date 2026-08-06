import { verifyAuthToken } from '../services/token.service.js';

export default function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'La sesión es inválida o ha expirado.' });
  }
}
