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
const ADR_DIRECTORY = path.join(REPOSITORY_ROOT, 'docs', 'adr');

const readRepositoryFile = (relativePath) => (
  readFile(path.join(REPOSITORY_ROOT, relativePath), 'utf8')
);

test('ADRs use sequential identifiers and the required English structure', async () => {
  const entries = await readdir(ADR_DIRECTORY);
  const adrFiles = entries
    .filter((name) => /^ADR-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name))
    .sort();

  const requiredAdrFiles = [
    'ADR-0001-single-company-scope.md',
    'ADR-0002-javascript-react-code-conventions.md',
    'ADR-0003-routing-authentication-rbac.md',
    'ADR-0004-fraud-category-taxonomy.md',
  ];

  for (const requiredFile of requiredAdrFiles) {
    assert.ok(adrFiles.includes(requiredFile), `${requiredFile} is missing`);
  }

  for (const [index, fileName] of adrFiles.entries()) {
    const expectedId = String(index + 1).padStart(4, '0');
    const content = await readFile(path.join(ADR_DIRECTORY, fileName), 'utf8');

    assert.match(content, new RegExp(`^# ADR-${expectedId}: .+`, 'm'));
    assert.match(content, /^- Status: (Proposed|Accepted|Deprecated|Superseded by ADR-\d{4})$/m);
    assert.match(content, /^- Date: \d{4}-\d{2}-\d{2}$/m);
    assert.match(content, /^## Context$/m);
    assert.match(content, /^## Decision$/m);
    assert.match(content, /^## Consequences$/m);
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
