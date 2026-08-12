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

const router = Router();

function sendKnownError(error, res, fallbackMessage) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error('[admin]', error.message);
  return res.status(500).json({ error: fallbackMessage });
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
          return res.status(409).json({
            error: 'No puedes quitarte el rol administrador ni desactivar tu propia sesión.',
          });
        }
      }

      const user = await updateUserAdministration({
        id,
        ...changes,
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
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
