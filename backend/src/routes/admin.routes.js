import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions.js';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import { getUsers, patchUser } from '../controllers/admin.controller.js';

const router = Router();
router.get('/users', requirePermission(PERMISSIONS.USERS_ADMIN), getUsers);
router.patch('/users/:id', requirePermission(PERMISSIONS.USERS_ADMIN), patchUser);
export default router;
