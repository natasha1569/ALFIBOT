import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fraudCategories,
  fraudCategoryValues,
  normalizeFraudCategory,
  systemPrompt,
} from '../src/config/aiPolicy.js';

const EXPECTED_CATEGORIES = [
  'credito_falso',
  'ponzi',
  'piramidal',
  'inversion_fraudulenta',
  'phishing',
  'pago_anticipado',
  'robo_datos',
  'otro',
];

test('la taxonomía define valores canónicos únicos y reutilizables', () => {
  assert.deepEqual(fraudCategoryValues, EXPECTED_CATEGORIES);
  assert.equal(new Set(fraudCategoryValues).size, EXPECTED_CATEGORIES.length);

  for (const category of fraudCategories) {
    assert.ok(category.label.trim());
    assert.ok(category.description.trim());
  }
});

test('normalizeFraudCategory acepta valores canónicos y alias frecuentes', () => {
  assert.equal(normalizeFraudCategory('credito_falso'), 'credito_falso');
  assert.equal(normalizeFraudCategory('Préstamo fraudulento'), 'credito_falso');
  assert.equal(normalizeFraudCategory('Esquema Ponzi'), 'ponzi');
  assert.equal(normalizeFraudCategory('Fraude de inversión'), 'inversion_fraudulenta');
  assert.equal(normalizeFraudCategory('Robo de datos'), 'robo_datos');
});

test('normalizeFraudCategory usa otro ante valores vacíos o desconocidos', () => {
  assert.equal(normalizeFraudCategory('modalidad no catalogada'), 'otro');
  assert.equal(normalizeFraudCategory(null), 'otro');
});

test('el prompt central enumera todas las categorías formales', () => {
  for (const category of fraudCategories) {
    assert.match(systemPrompt, new RegExp(`- ${category.value}:`));
  }
});
