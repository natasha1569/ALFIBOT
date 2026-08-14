import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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
    const dates = content.match(/^Date: \d{4}-\d{2}-\d{2}$/gm) || [];
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
  assert.match(editorConfig, /^end_of_line = lf$/m);
});

test('all tracked project JavaScript uses the arrow-function convention', async () => {
  const codeFiles = execFileSync(
    'git',
    ['ls-files', '-z', '--', '*.js', '*.jsx', '*.mjs', '*.cjs'],
    {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
    },
  )
    .split('\0')
    .filter(Boolean)
    .filter((relativePath) => existsSync(
      path.join(REPOSITORY_ROOT, relativePath),
    ));

  const functionKeyword = ['fun', 'ction'].join('');
  const traditionalFunctionPattern = new RegExp(
    `(^|[^A-Za-z0-9_$])(?:async\\s+)?${functionKeyword}(?:\\s*\\*)?(?:\\s+[A-Za-z_$][A-Za-z0-9_$]*)?\\s*\\(`,
    'm',
  );

  for (const relativePath of codeFiles) {
    const content = await readRepositoryFile(relativePath);

    assert.doesNotMatch(
      content,
      traditionalFunctionPattern,
      `${relativePath} contains a traditional function declaration or expression`,
    );
  }
});
