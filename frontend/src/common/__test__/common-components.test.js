import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const COMMON_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('AFB-407 define al menos cinco componentes React atómicos en directorios propios', async () => {
  const entries = await readdir(COMMON_ROOT, { withFileTypes: true });
  const componentDirectories = entries.filter((entry) => entry.isDirectory() && entry.name !== '__test__');
  assert.ok(componentDirectories.length >= 5);
  for (const entry of componentDirectories) {
    const source = await readFile(path.join(COMMON_ROOT, entry.name, `${entry.name}.jsx`), 'utf8');
    assert.match(source, /export default/);
  }
});
