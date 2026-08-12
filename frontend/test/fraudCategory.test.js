import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FRAUD_CATEGORY_LABELS,
  getFraudCategoryLabel,
} from '../src/utils/fraudCategory.js';

test('AFB-336 mantiene únicamente las cuatro categorías soportadas', () => {
  assert.deepEqual(Object.keys(FRAUD_CATEGORY_LABELS), [
    'credito_falso',
    'ponzi',
    'piramidal',
    'inversion_fraudulenta',
  ]);
});

test('AFB-336 no inventa etiqueta para una categoría nula o no soportada', () => {
  assert.equal(getFraudCategoryLabel(null), null);
  assert.equal(getFraudCategoryLabel('otro'), null);
});
