import 'dotenv/config';
import pool from './src/config/database.js';

const EXPECTED_CATEGORIES = [
  'credito_falso',
  'ponzi',
  'piramidal',
  'inversion_fraudulenta',
];

const REPORTING_VIEWS = [
  'vw_reporte_fraude_riesgo',
  'vw_reporte_contenido_perfil',
];

const SENSITIVE_COLUMNS = [
  'nombre',
  'usuario',
  'correo',
  'celular',
  'password_hash',
  'contenido',
  'vista_previa',
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const categoryColumn = await pool.query(`
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'alfi'
      AND table_name = 'analisis'
      AND column_name = 'categoria_fraude'
  `);

  assert(
    categoryColumn.rowCount === 1,
    'No existe alfi.analisis.categoria_fraude.',
  );

  assert(
    categoryColumn.rows[0].is_nullable === 'YES',
    'categoria_fraude debe aceptar NULL para contenido fuera de la taxonomía.',
  );

  const views = await pool.query(
    `
      SELECT c.relname AS table_name
      FROM pg_catalog.pg_class c
      INNER JOIN pg_catalog.pg_namespace n
        ON n.oid = c.relnamespace
      WHERE n.nspname = 'alfi'
        AND c.relkind = 'v'
        AND c.relname = ANY($1::text[])
    `,
    [REPORTING_VIEWS],
  );

  assert(
    views.rowCount === REPORTING_VIEWS.length,
    'No existen las dos vistas BI de AFB-253 en pg_catalog.',
  );

  const connection = await pool.query(`
    SELECT current_user AS usuario
  `);
  const databaseUser = connection.rows[0].usuario;

  const privileges = await pool.query(
    `
      SELECT
        view_name,
        has_table_privilege(
          current_user,
          format('alfi.%I', view_name),
          'SELECT'
        ) AS puede_consultar
      FROM unnest($1::text[]) AS view_name
    `,
    [REPORTING_VIEWS],
  );

  const inaccessibleViews = privileges.rows.filter(
    ({ puede_consultar }) => !puede_consultar,
  );

  assert(
    inaccessibleViews.length === 0,
    `El usuario de conexión ${databaseUser} no puede consultar todas las vistas BI: ${JSON.stringify(inaccessibleViews)}`,
  );

  const sensitiveColumns = await pool.query(
    `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'alfi'
        AND table_name = ANY($1::text[])
        AND column_name = ANY($2::text[])
    `,
    [REPORTING_VIEWS, SENSITIVE_COLUMNS],
  );

  assert(
    sensitiveColumns.rowCount === 0,
    `Las vistas BI exponen columnas sensibles: ${JSON.stringify(sensitiveColumns.rows)}`,
  );

  const invalidCategories = await pool.query(
    `
      SELECT DISTINCT categoria_fraude
      FROM alfi.analisis
      WHERE categoria_fraude IS NOT NULL
        AND NOT (categoria_fraude = ANY($1::text[]))
    `,
    [EXPECTED_CATEGORIES],
  );

  assert(
    invalidCategories.rowCount === 0,
    'Existen categorías fuera de la taxonomía vigente de ALFI BOT.',
  );

  const reportRows = await Promise.all(
    REPORTING_VIEWS.map(async (viewName) => {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS filas FROM alfi.${viewName}`,
      );

      return {
        vista: viewName,
        filas: result.rows[0].filas,
      };
    }),
  );

  console.table(reportRows);
  console.log(
    'AFB-253 OK: taxonomía reducida, persistencia nullable, dos vistas BI y privacidad estructural validadas.',
  );
};

run()
  .catch((error) => {
    console.error('AFB-253 ERROR:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
