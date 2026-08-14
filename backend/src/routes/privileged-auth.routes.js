import { Router } from 'express';
import { APP_ROLES } from '../config/permissions.js';
import { createAuthToken } from '../services/token.service.js';
import { verifySecurePassword } from '../services/password.service.js';
import { findUserByEmail, toPublicUser } from '../services/user.service.js';
import {
  ERROR_CODES,
  logServerError,
  sendError,
} from '../errors/errorCatalog.js';

const router = Router();

const createRoleLogin = (expectedRole) => {
  return async (req, res) => {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return sendError(res, ERROR_CODES.INVALID_REQUEST, {
        publicMessage: 'Ingresa el correo y la contraseña.',
      });
    }

    try {
      const user = await findUserByEmail(email.trim().toLowerCase());

      if (!user || !user.active) {
        return sendError(res, ERROR_CODES.INVALID_CREDENTIALS);
      }

      const validPassword = await verifySecurePassword(
        password,
        user.passwordHash,
      );

      if (!validPassword) {
        return sendError(res, ERROR_CODES.INVALID_CREDENTIALS);
      }

      if (user.role !== expectedRole) {
        return sendError(res, ERROR_CODES.FORBIDDEN, {
          publicMessage: 'La cuenta no está autorizada para este portal.',
        });
      }

      const publicUser = toPublicUser(user);

      return res.json({
        token: createAuthToken(publicUser),
        user: publicUser,
      });
    } catch (error) {
      logServerError('privileged-auth/login', error);
      return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, {
        publicMessage: 'No se pudo validar la cuenta. Intenta nuevamente.',
      });
    }
  };
};

router.post(
  '/admin/login',
  createRoleLogin(APP_ROLES.ADMIN),
);

router.post(
  '/auditor/login',
  createRoleLogin(APP_ROLES.AUDITOR),
);

export default router;
