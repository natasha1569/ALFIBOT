import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.routes.js';
import authRoutes from './routes/auth.routes.js';
import authMiddleware from './middlewares/auth.middleware.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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
// PROBAR CONEXIÓN A POSTGRESQL
// ======================================================

app.get('/api/database/test', async (req, res) => {
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
    console.error(error);

    res.status(500).json({
      connected: false,
      message: 'Error al conectar con PostgreSQL.',
      error: error.message,
    });
  }
});


// ======================================================
// CONSULTAR LA TABLA ANALISIS
// ======================================================

app.get('/api/database/analisis', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM alfi.analisis
      ORDER BY analisis_id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});


// ======================================================
// RUTAS DEL PROYECTO
// ======================================================

app.use('/api/auth', authRoutes);

app.use('/api/analysis', authMiddleware, analysisRoutes);


// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada.',
  });
});


// ======================================================
// ERRORES
// ======================================================

app.use((err, req, res, next) => {
  console.error('[server] Error no controlado:', err.message);

  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor.',
  });
});


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);

  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === 'coloca_tu_api_key_aqui'
  ) {
    console.warn(
      'Aviso: OPENAI_API_KEY no está configurada en .env.'
    );
  }
});