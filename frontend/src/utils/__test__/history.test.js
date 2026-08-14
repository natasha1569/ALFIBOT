import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getHistoryPreview,
  normalizeHistoryItem,
  normalizeHistoryItems,
} from '../history.js';

test('AFB-268 muestra la vista previa devuelta por PostgreSQL', () => {
  assert.equal(
    getHistoryPreview({ preview: 'Oferta de inversión analizada' }),
    'Oferta de inversión analizada',
  );
});

test('AFB-268 conserva compatibilidad con el contrato histórico', () => {
  assert.equal(
    getHistoryPreview({ inputPreview: 'Registro anterior' }),
    'Registro anterior',
  );
});

test('AFB-268 usa el valor histórico si preview está vacío', () => {
  assert.equal(
    getHistoryPreview({ preview: '   ', inputPreview: 'Respaldo compatible' }),
    'Respaldo compatible',
  );
});

test('AFB-268 normaliza colecciones y respuestas inválidas', () => {
  assert.deepEqual(normalizeHistoryItems(null), []);
  assert.deepEqual(
    normalizeHistoryItems([{ id: 1, preview: '  Prueba  ' }]),
    [{ id: 1, preview: 'Prueba' }],
  );
  assert.equal(normalizeHistoryItem({ id: 2 }).preview, '');
});
