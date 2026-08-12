import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAssistantState,
  normalizeRiskLevel,
} from '../src/utils/risk.js';

test('normalizeRiskLevel reconoce niveles de riesgo en español e inglés', () => {
  assert.equal(normalizeRiskLevel('Riesgo ALTO'), 'alto');
  assert.equal(normalizeRiskLevel('medium risk'), 'medio');
  assert.equal(normalizeRiskLevel('Low'), 'bajo');
});

test('normalizeRiskLevel usa riesgo medio como valor seguro por defecto', () => {
  assert.equal(normalizeRiskLevel('desconocido'), 'medio');
  assert.equal(normalizeRiskLevel(null), 'medio');
});

test('getAssistantState prioriza los estados de carga y error', () => {
  assert.equal(
    getAssistantState({ isAnalyzing: true, error: new Error('fallo'), result: null }),
    'analyzing',
  );
  assert.equal(
    getAssistantState({ isAnalyzing: false, error: new Error('fallo'), result: null }),
    'error',
  );
});

test('getAssistantState diferencia resultados fuera de alcance y sin resultado', () => {
  assert.equal(
    getAssistantState({ isAnalyzing: false, error: null, result: { allowed: false } }),
    'out-of-scope',
  );
  assert.equal(
    getAssistantState({ isAnalyzing: false, error: null, result: null }),
    'idle',
  );
});

test('getAssistantState traduce cada nivel de riesgo al estado visual de ALFI', () => {
  const baseState = { isAnalyzing: false, error: null };

  assert.equal(getAssistantState({ ...baseState, result: { riskLevel: 'bajo' } }), 'low');
  assert.equal(getAssistantState({ ...baseState, result: { riskLevel: 'medio' } }), 'medium');
  assert.equal(getAssistantState({ ...baseState, result: { riskLevel: 'alto' } }), 'high');
});
