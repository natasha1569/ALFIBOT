import { AppError, ERROR_CODES, logServerError, sendError } from '../errors/errorCatalog.js';
import { listAuditEvents, normalizeAuditQuery } from '../services/audit.service.js';

export const getAuditEvents = async (req, res) => {
  try {
    return res.status(200).json(await listAuditEvents(normalizeAuditQuery(req.query)));
  } catch (error) {
    if (error instanceof AppError) return sendError(res, error);
    logServerError('audit/events', error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo consultar la trazabilidad de auditoría.' });
  }
};
