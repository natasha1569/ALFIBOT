import assert from 'node:assert/strict';
import test from 'node:test';
import {
  listAuditEvents,
  normalizeAuditQuery,
} from '../src/services/audit.service.js';

test('normalizeAuditQuery accepts safe filters and pagination', () => {
  assert.deepEqual(
    normalizeAuditQuery({
      table: 'Analisis',
      operation: 'update',
      from: '2026-08-01',
      to: '2026-08-12',
      page: '2',
      pageSize: '25',
    }),
    {
      table: 'analisis',
      operation: 'UPDATE',
      from: '2026-08-01',
      to: '2026-08-12',
      page: 2,
      pageSize: 25,
    },
  );
});

test('normalizeAuditQuery rejects invalid filters', () => {
  const assertPublicError = (callback, pattern) => {
    assert.throws(callback, (error) => {
      assert.match(error.publicMessage, pattern);
      return true;
    });
  };

  assertPublicError(
    () => normalizeAuditQuery({ table: 'roles' }),
    /no forma parte de la auditoría pública/,
  );
  assertPublicError(
    () => normalizeAuditQuery({ operation: 'SELECT' }),
    /operación de auditoría no es válida/,
  );
  assertPublicError(
    () => normalizeAuditQuery({ from: '2026-08-13', to: '2026-08-12' }),
    /fecha inicial no puede ser posterior/,
  );
  assertPublicError(
    () => normalizeAuditQuery({ pageSize: '101' }),
    /no puede superar 100/,
  );
});

test('listAuditEvents returns only the public audit contract', async () => {
  const calls = [];
  const db = {
    async query(sql, values) {
      calls.push({ sql, values });

      if (calls.length === 1) {
        return { rows: [{ total: 1 }] };
      }

      return {
        rows: [{
          id: '18',
          tableName: 'usuarios',
          operation: 'UPDATE',
          recordId: '7',
          databaseUser: 'alfi_app',
          occurredAt: '2026-08-12T20:00:00.000Z',
        }],
      };
    },
  };

  const filters = normalizeAuditQuery({
    table: 'usuarios',
    operation: 'UPDATE',
    page: 1,
    pageSize: 20,
  });
  const result = await listAuditEvents(filters, db);

  assert.equal(result.events.length, 1);
  assert.equal(result.pagination.total, 1);
  assert.equal(result.pagination.totalPages, 1);
  assert.deepEqual(calls[0].values, ['usuarios', 'UPDATE']);
  assert.deepEqual(calls[1].values, ['usuarios', 'UPDATE', 20, 0]);
  assert.doesNotMatch(calls[1].sql, /datos_anteriores|datos_nuevos|password_hash|contenido/i);
  assert.deepEqual(Object.keys(result.events[0]), [
    'id',
    'tableName',
    'operation',
    'recordId',
    'databaseUser',
    'occurredAt',
  ]);
});
