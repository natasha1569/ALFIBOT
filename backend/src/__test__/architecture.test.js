import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { AppDataSource } from '../database/data-source.js';

const SRC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const readProductionSources = async (directory = SRC_ROOT) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const sources = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__test__') continue;
      sources.push(...await readProductionSources(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      sources.push({
        filePath: fullPath,
        source: await readFile(fullPath, 'utf8'),
      });
    }
  }

  return sources;
};

const sqlWords = (...words) => words.join('\\s+');
const RAW_SQL_PATTERNS = [
  /\.query\s*\(/,
  new RegExp(`\\b${sqlWords('INSERT', 'INTO')}\\b`, 'i'),
  new RegExp(`\\b${sqlWords('DELETE', 'FROM')}\\b`, 'i'),
  new RegExp(`\\bUPDATE\\s+(?:[a-z_][\\w]*\\.)?[a-z_][\\w]*\\s+SET\\b`, 'i'),
  new RegExp(`\\bSELECT\\b[\\s\\S]{0,300}\\bFROM\\b`, 'i'),
];

test('AFB-408 mantiene backend/src libre de SQL crudo operativo fuera de tests', async () => {
  const sources = await readProductionSources();

  for (const { filePath, source } of sources) {
    for (const pattern of RAW_SQL_PATTERNS) {
      assert.doesNotMatch(
        source,
        pattern,
        `SQL crudo detectado en ${path.relative(SRC_ROOT, filePath)}`,
      );
    }
    assert.doesNotMatch(
      source,
      /from\s+['"]pg['"]/,
      `Import directo de pg detectado en ${path.relative(SRC_ROOT, filePath)}`,
    );
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
