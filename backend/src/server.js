import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.routes.js';
import authRoutes from './routes/auth.routes.js';
import privilegedAuthRoutes from './routes/privileged-auth.routes.js';
import reportingRoutes from './routes/reporting.routes.js';
import adminRoutes from './routes/admin.routes.js';
import auditRoutes from './routes/audit.routes.js';
import diagnosticsRoutes from './routes/diagnostics.routes.js';
import authMiddleware from './middlewares/auth.middleware.js';
import { initializeDataSource } from './database/data-source.js';
import { ERROR_CODES, logServerError, sendError } from './errors/errorCatalog.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const diagnosticsEnabled = process.env.ENABLE_DB_DIAGNOSTICS === 'true';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend de Fraud AI Checker funcionando correctamente.' }));
app.use('/api/auth', authRoutes);
app.use('/api/auth', privilegedAuthRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);
app.use('/api/reporting', authMiddleware, reportingRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
if (diagnosticsEnabled) app.use('/api/database', authMiddleware, diagnosticsRoutes);

app.use((req, res) => sendError(res, ERROR_CODES.NOT_FOUND, { publicMessage: 'Ruta no encontrada.' }));
app.use((error, req, res, next) => {
  if (error?.type === 'entity.parse.failed') return sendError(res, ERROR_CODES.INVALID_JSON);
  if (error?.type === 'entity.too.large') return sendError(res, ERROR_CODES.PAYLOAD_TOO_LARGE);
  logServerError('server/unhandled', error);
  return sendError(res, ERROR_CODES.INTERNAL_ERROR);
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  initializeDataSource()
    .then(() => console.log('PostgreSQL conectado correctamente mediante TypeORM.'))
    .catch((error) => logServerError('database/initialize', error));
  if (diagnosticsEnabled) console.warn('[security] ENABLE_DB_DIAGNOSTICS=true: endpoints de diagnóstico habilitados.');
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'coloca_tu_api_key_aqui') console.warn('Aviso: OPENAI_API_KEY no está configurada en .env.');
});

export default app;
