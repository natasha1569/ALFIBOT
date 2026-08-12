import { Router } from 'express';
import { APP_ROLES } from '../config/permissions.js';
import { createAuthToken } from '../services/token.service.js';
import { verifySecurePassword } from '../services/password.service.js';
import { findUserByEmail } from '../services/user.service.js';

const router = Router();

function buildPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function createRoleLogin(expectedRole) {
  return async function roleLogin(req, res) {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Ingresa el correo y la contraseña.',
      });
    }

    try {
      const user = await findUserByEmail(email.trim().toLowerCase());

      if (!user || !user.active) {
        return res.status(401).json({
          error: 'Correo o contraseña incorrectos.',
        });
      }

      const validPassword = await verifySecurePassword(
        password,
        user.passwordHash,
      );

      if (!validPassword) {
        return res.status(401).json({
          error: 'Correo o contraseña incorrectos.',
        });
      }

      if (user.role !== expectedRole) {
        return res.status(403).json({
          error: 'La cuenta no está autorizada para este portal.',
        });
      }

      const publicUser = buildPublicUser(user);

      return res.json({
        token: createAuthToken(publicUser),
        user: publicUser,
      });
    } catch (error) {
      console.error('[privileged-auth] Error de autenticación:', error.message);
      return res.status(500).json({
        error: 'No se pudo validar la cuenta.',
      });
    }
  };
}

router.post(
  '/admin/login',
  createRoleLogin(APP_ROLES.ADMIN),
);

router.post(
  '/auditor/login',
  createRoleLogin(APP_ROLES.AUDITOR),
);

export default router;
