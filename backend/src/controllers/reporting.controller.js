import { AppError, ERROR_CODES, logServerError, sendError } from '../errors/errorCatalog.js';
import { getFraudTrends, normalizeReportingFilters } from '../services/reporting.service.js';

export const getFraudTrendReport = async (req, res) => {
  try {
    return res.status(200).json(await getFraudTrends(normalizeReportingFilters(req.query)));
  } catch (error) {
    if (error instanceof AppError) return sendError(res, error);
    logServerError('reporting/fraud-trends', error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo consultar la reportería agregada de fraudes.' });
  }
};
