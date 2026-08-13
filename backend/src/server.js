import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.routes.js';
import authRoutes from './routes/auth.routes.js';
import privilegedAuthRoutes from './routes/privileged-auth.routes.js';
import reportingRoutes from './routes/reporting.routes.js';
import adminRoutes from './routes/admin.routes.js';
import auditRoutes from './routes/audit.routes.js';
import authMiddleware from './middlewares/auth.middleware.js';
import { requirePermission } from './middlewares/authorization.middleware.js';
import { PERMISSIONS } from './config/permissions.js';
import pool from './config/database.js';
import {
  ERROR_CODES,
  logServerError,
  sendError,
} from './errors/errorCatalog.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const diagnosticsEnabled = process.env.ENABLE_DB_DIAGNOSTICS === 'true';

app.use(cors());

// Límite ampliado porque las imágenes en base64 viajan dentro del JSON.
app.use(express.json({ limit: '10mb' }));

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend de Fraud AI Checker funcionando correctamente.',
  });
});


// ======================================================
// DIAGNÓSTICOS DE POSTGRESQL
// Deshabilitados por defecto y protegidos por autenticación.
// ======================================================

if (diagnosticsEnabled) {
  app.get(
    '/api/database/test',
    authMiddleware,
    requirePermission(PERMISSIONS.DATABASE_DIAGNOSTICS),
    async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          CURRENT_DATABASE() AS database,
          CURRENT_USER AS usuario,
          CURRENT_TIMESTAMP AS fecha
      `);

      res.json({
        connected: true,
        message: 'PostgreSQL conectado correctamente.',
        data: result.rows[0],
      });
    } catch (error) {
      logServerError('database/test', error);
      return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, {
        publicMessage: 'No se pudo comprobar la conexión de datos.',
      });
    }
    },
  );

  app.get(
    '/api/database/analisis',
    authMiddleware,
    requirePermission(PERMISSIONS.DATABASE_DIAGNOSTICS),
    async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT *
        FROM alfi.analisis
        ORDER BY analisis_id DESC
      `);

      res.json(result.rows);
    } catch (error) {
      logServerError('database/analisis', error);
      return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE);
    }
    },
  );
}


// ======================================================
// RUTAS DEL PROYECTO
// ======================================================

app.use('/api/auth', authRoutes);
app.use('/api/auth', privilegedAuthRoutes);

app.use('/api/analysis', authMiddleware, analysisRoutes);
app.use('/api/reporting', authMiddleware, reportingRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);


// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  return sendError(res, ERROR_CODES.NOT_FOUND, {
    publicMessage: 'Ruta no encontrada.',
  });
});


// ======================================================
// ERRORES
// ======================================================

app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return sendError(res, ERROR_CODES.INVALID_JSON);
  }

  if (err?.type === 'entity.too.large') {
    return sendError(res, ERROR_CODES.PAYLOAD_TOO_LARGE);
  }

  logServerError('server/unhandled', err);
  return sendError(res, ERROR_CODES.INTERNAL_ERROR);
});


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);

  if (diagnosticsEnabled) {
    console.warn(
      '[security] ENABLE_DB_DIAGNOSTICS=true: endpoints de diagnóstico habilitados.'
    );
  }

  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === 'coloca_tu_api_key_aqui'
  ) {
    console.warn(
      'Aviso: OPENAI_API_KEY no está configurada en .env.'
    );
  }
});
