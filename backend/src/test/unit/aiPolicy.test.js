import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fraudCategories,
  fraudCategoryValues,
  normalizeFraudCategory,
  outputFormatDescription,
  systemPrompt,
} from '../../config/aiPolicy.js';
import { normalizeResult } from '../../services/openai.service.js';

const EXPECTED_CATEGORIES = [
  'credito_falso',
  'ponzi',
  'piramidal',
  'inversion_fraudulenta',
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
  assert.equal(normalizeFraudCategory('Esquema piramidal'), 'piramidal');
});

test('normalizeFraudCategory devuelve null ante valores vacíos o desconocidos', () => {
  assert.equal(normalizeFraudCategory('modalidad no catalogada'), null);
  assert.equal(normalizeFraudCategory(null), null);
});

test('el prompt central enumera todas las categorías formales', () => {
  for (const category of fraudCategories) {
    assert.match(systemPrompt, new RegExp(`- ${category.value}:`));
  }
});

test('el formato de salida exige fraudCategory con los valores canónicos', () => {
  assert.match(outputFormatDescription, /"fraudCategory"/);

  for (const category of fraudCategoryValues) {
    assert.match(outputFormatDescription, new RegExp(`"${category}"`));
  }
});

test('normalizeResult incluye una categoría válida en respuestas permitidas', () => {
  const result = normalizeResult({
    allowed: true,
    riskLevel: 'alto',
    fraudCategory: 'Esquema Ponzi',
    summary: 'Promesa de rentabilidad garantizada.',
    warningSigns: ['Rentabilidad garantizada'],
    recommendations: ['No transferir dinero'],
  });

  assert.equal(result.allowed, true);
  assert.equal(result.riskLevel, 'alto');
  assert.equal(result.fraudCategory, 'ponzi');
});

test('normalizeResult conserva categoría nula cuando la IA omite o inventa la categoría', () => {
  assert.equal(
    normalizeResult({ allowed: true, fraudCategory: 'categoría inventada' }).fraudCategory,
    null,
  );
  assert.equal(
    normalizeResult({ allowed: true }).fraudCategory,
    null,
  );
});
