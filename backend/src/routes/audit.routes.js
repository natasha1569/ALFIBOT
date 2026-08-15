import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions.js';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import { getAuditEvents } from '../controllers/audit.controller.js';

const router = Router();
router.get('/events', requirePermission(PERMISSIONS.AUDIT_READ), getAuditEvents);
export default router;
