import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions.js';
import {
  AppError,
  ERROR_CODES,
  logServerError,
  sendError,
} from '../errors/errorCatalog.js';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import {
  listAuditEvents,
  normalizeAuditQuery,
} from '../services/audit.service.js';

const router = Router();

router.get(
  '/events',
  requirePermission(PERMISSIONS.AUDIT_READ),
  async (req, res) => {
    try {
      const filters = normalizeAuditQuery(req.query);
      const result = await listAuditEvents(filters);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return sendError(res, error);
      }

      logServerError('audit/events', error);
      return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, {
        publicMessage: 'No se pudo consultar la trazabilidad de auditoría.',
      });
    }
  },
);

export default router;
