import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const BACKEND_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const REPOSITORY_ROOT = path.resolve(BACKEND_ROOT, '..');
const ADR_DIRECTORY = path.join(REPOSITORY_ROOT, 'ADRs');

const readRepositoryFile = (relativePath) => (
  readFile(path.join(REPOSITORY_ROOT, relativePath), 'utf8')
);

test('ADRs use the approved root folder and simplified decision format', async () => {
  const entries = await readdir(ADR_DIRECTORY);
  const adrFiles = entries
    .filter((name) => /^\d+\.Decision-[A-Za-z0-9-]+\.md$/.test(name))
    .sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10));

  const requiredAdrFiles = [
    '1.Decision-Frontend.md',
    '2.Decision-Backend.md',
    '3.Decision-Database.md',
    '4.Decision-Authentication-RBAC.md',
  ];

  assert.deepEqual(adrFiles, requiredAdrFiles);

  for (const fileName of adrFiles) {
    const content = await readFile(path.join(ADR_DIRECTORY, fileName), 'utf8');
    const dates = content.match(/^Fecha: \d{4}-\d{2}-\d{2}$/gm) || [];
    const decisions = content.match(/^\d+\. .+$/gm) || [];

    assert.match(content, /^# .+$/m);
    assert.equal(dates.length, 1, `${fileName} must contain exactly one date`);
    assert.ok(decisions.length >= 3, `${fileName} must contain numbered decisions`);
    assert.doesNotMatch(content, /^Status:/m);
    assert.doesNotMatch(content, /^## (Context|Decision|Consequences)$/m);
  }
});

test('repository documentation defines the agreed naming conventions', async () => {
  const contributing = await readRepositoryFile('CONTRIBUTING.md');
  const editorConfig = await readRepositoryFile('.editorconfig');

  for (const convention of [
    'camelCase',
    'PascalCase',
    'kebab-case',
    'snake_case',
    'UPPER_SNAKE_CASE',
    'async`/`await',
    'ES Modules',
  ]) {
    assert.match(contributing, new RegExp(convention));
  }

  assert.match(editorConfig, /^root = true$/m);
  assert.match(editorConfig, /^indent_style = space$/m);
  assert.match(editorConfig, /^insert_final_newline = true$/m);
});

test('modules migrated by AFB-337 use arrow functions', async () => {
  const standardizedFiles = [
    'backend/src/config/aiPolicy.js',
    'backend/src/config/permissions.js',
    'backend/src/middlewares/auth.middleware.js',
    'backend/src/middlewares/authorization.middleware.js',
    'frontend/src/App.jsx',
    'frontend/src/auth/authStorage.js',
    'frontend/src/utils/fraudCategory.js',
    'frontend/src/utils/history.js',
    'frontend/src/utils/risk.js',
  ];

  for (const relativePath of standardizedFiles) {
    const content = await readRepositoryFile(relativePath);
    assert.doesNotMatch(
      content,
      /^\s*(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+/m,
      `${relativePath} still contains a traditional function declaration`,
    );
  }
});
