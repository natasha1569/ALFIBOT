import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
});

pool
  .query('SELECT 1')
  .then(() => {
    console.log('PostgreSQL conectado correctamente');
  })
  .catch((error) => {
    console.error('Error al conectar PostgreSQL:', error.message);
  });

export default pool;