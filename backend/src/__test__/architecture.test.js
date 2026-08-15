import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { AppDataSource } from '../database/data-source.js';

const SRC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readDirectory = async (name) => Promise.all(
  (await readdir(path.join(SRC_ROOT, name)))
    .filter((fileName) => fileName.endsWith('.js'))
    .map((fileName) => readFile(path.join(SRC_ROOT, name, fileName), 'utf8')),
);

test('AFB-408 mantiene rutas y server libres de lógica SQL', async () => {
  const sources = [
    ...(await readDirectory('routes')),
    ...(await readDirectory('controllers')),
    await readFile(path.join(SRC_ROOT, 'server.js'), 'utf8'),
  ];
  for (const source of sources) {
    assert.doesNotMatch(source, /\b(SELECT|INSERT INTO|UPDATE\s+alfi|DELETE FROM)\b/i);
    assert.doesNotMatch(source, /\.query\s*\(/);
  }
});

test('AFB-409 mapea el esquema alfi con TypeORM sin sincronización destructiva', async () => {
  await AppDataSource.buildMetadatas();
  assert.equal(AppDataSource.options.synchronize, false);
  assert.deepEqual(
    AppDataSource.entityMetadatas.map(({ name }) => name).sort(),
    [
      'Analysis', 'AuditEvent', 'FinancialInterest', 'FraudTrendReport',
      'Recommendation', 'Role', 'User', 'UserFinancialInterest', 'WarningSign',
    ].sort(),
  );
  assert.ok(AppDataSource.entityMetadatas.every(({ schema }) => schema === 'alfi'));
});
