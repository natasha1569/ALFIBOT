import { getAnalysisDiagnostics, getDatabaseStatus } from '../repositories/diagnostics.repository.js';
import { ERROR_CODES, logServerError, sendError } from '../errors/errorCatalog.js';

const handleDiagnostic = (scope, operation) => async (req, res) => {
  try {
    return res.json(await operation());
  } catch (error) {
    logServerError(scope, error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo comprobar la conexión de datos.' });
  }
};

export const testDatabase = handleDiagnostic('database/test', async () => ({
  connected: true,
  message: 'PostgreSQL conectado correctamente.',
  data: await getDatabaseStatus(),
}));
export const listAnalysisDiagnostics = handleDiagnostic('database/analisis', getAnalysisDiagnostics);
