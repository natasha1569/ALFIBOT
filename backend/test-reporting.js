import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { getDataSource } from './src/database/data-source.js';
import { findFraudTrendRows } from './src/repositories/reporting.repository.js';

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

const SENSITIVE_COLUMNS = new Set([
  'nombre',
  'usuario',
  'correo',
  'celular',
  'password_hash',
  'contenido',
  'vista_previa',
]);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  const dataSource = await getDataSource();

  try {
    const analysisMetadata = dataSource.getMetadata('Analysis');
    const categoryColumn = analysisMetadata.columns.find(
      ({ propertyName }) => propertyName === 'fraudCategory',
    );
    assert(categoryColumn?.isNullable, 'categoria_fraude debe aceptar NULL.');

    const reportMetadata = dataSource.getMetadata('FraudTrendReport');
    assert(
      reportMetadata.schema === 'alfi'
        && reportMetadata.tableName === 'vw_reporte_fraude_riesgo',
      'TypeORM no mapea la vista BI principal esperada.',
    );

    const exposedSensitiveColumns = reportMetadata.columns
      .map(({ databaseName }) => databaseName)
      .filter((name) => SENSITIVE_COLUMNS.has(name));
    assert(
      exposedSensitiveColumns.length === 0,
      `La vista BI mapeada expone columnas sensibles: ${JSON.stringify(exposedSensitiveColumns)}`,
    );

    const canonicalSql = await readFile(
      new URL('./sql/ALFI_BOT_DATABASE.sql', import.meta.url),
      'utf8',
    );
    for (const viewName of REPORTING_VIEWS) {
      assert(
        canonicalSql.includes(viewName),
        `La fuente SQL canónica no contiene la vista ${viewName}.`,
      );
    }

    // La consulta real pasa por el repository TypeORM. Si la vista principal no existe
    // en PostgreSQL, esta operación falla sin recurrir a SQL crudo en este test.
    const rows = await findFraudTrendRows({});
    const invalidCategories = rows.filter(
      ({ fraudCategory }) => fraudCategory && !EXPECTED_CATEGORIES.includes(fraudCategory),
    );
    assert(
      invalidCategories.length === 0,
      'La vista mapeada contiene categorías fuera de la taxonomía vigente.',
    );

    console.table([
      { vista: 'vw_reporte_fraude_riesgo', filas: rows.length, validacion: 'TypeORM + PostgreSQL' },
      { vista: 'vw_reporte_contenido_perfil', filas: '-', validacion: 'SQL canónico + instalador' },
    ]);
    console.log(
      'AFB-253 OK: mapeo BI, consulta real, taxonomía, nulabilidad y privacidad validados sin SQL crudo en JavaScript.',
    );
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
};

run().catch((error) => {
  console.error('AFB-253 ERROR:', error.message);
  process.exitCode = 1;
});
