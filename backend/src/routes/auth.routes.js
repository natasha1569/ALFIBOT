import { Router } from 'express';
import {
  authUser,
  hashPassword,
  hashesMatch,
} from '../config/auth.config.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createAuthToken } from '../services/token.service.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ error: 'Ingresa el correo y la contraseña.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);
  const validCredentials =
    normalizedEmail === authUser.email &&
    hashesMatch(passwordHash, authUser.passwordHash);

  if (!validCredentials) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  const publicUser = {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
  };

  return res.json({
    token: createAuthToken(publicUser),
    user: publicUser,
  });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    user: {
      id: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
