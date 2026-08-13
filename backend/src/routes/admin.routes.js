import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions.js';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import {
  normalizeUserFilters,
  normalizeUserUpdate,
  parsePositiveInteger,
} from '../services/admin.validation.js';
import {
  listUsers,
  updateUserAdministration,
} from '../services/user.service.js';
import {
  ERROR_CODES,
  logServerError,
  sendError,
} from '../errors/errorCatalog.js';

const router = Router();

function sendKnownError(error, res, fallbackMessage) {
  if (Number(error?.statusCode) >= 400 && Number(error?.statusCode) < 500) {
    return sendError(res, ERROR_CODES.INVALID_REQUEST, {
      status: Number(error.statusCode),
      publicMessage: error.message,
    });
  }

  logServerError('admin', error);
  return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, {
    publicMessage: fallbackMessage,
  });
}

router.get(
  '/users',
  requirePermission(PERMISSIONS.USERS_ADMIN),
  async (req, res) => {
    try {
      const filters = normalizeUserFilters(req.query);
      const users = await listUsers(filters);
      return res.json({ users, total: users.length, filters });
    } catch (error) {
      return sendKnownError(
        error,
        res,
        'No se pudo consultar el listado de usuarios.',
      );
    }
  },
);

router.patch(
  '/users/:id',
  requirePermission(PERMISSIONS.USERS_ADMIN),
  async (req, res) => {
    try {
      const id = parsePositiveInteger(req.params.id, 'El usuario');
      const changes = normalizeUserUpdate(req.body);

      if (Number(req.user.sub) === id) {
        const currentRoleChanges =
          changes.role !== req.user.role || changes.active === false;

        if (currentRoleChanges) {
          return sendError(res, ERROR_CODES.CONFLICT, {
            publicMessage: 'No puedes quitarte el rol administrador ni desactivar tu propia sesión.',
          });
        }
      }

      const user = await updateUserAdministration({
        id,
        ...changes,
      });

      if (!user) {
        return sendError(res, ERROR_CODES.NOT_FOUND, {
          publicMessage: 'Usuario no encontrado.',
        });
      }

      return res.json({
        message: 'Usuario actualizado correctamente.',
        user,
      });
    } catch (error) {
      return sendKnownError(
        error,
        res,
        'No se pudo actualizar el usuario.',
      );
    }
  },
);

export default router;
