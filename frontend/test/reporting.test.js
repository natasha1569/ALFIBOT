import assert from 'node:assert/strict';
import test from 'node:test';
import {
  aggregateReportRows,
  buildLineChartPoints,
  buildMonthlySeries,
} from '../src/utils/reporting.js';

const rows = [
  { period: '2026-07', riskLevel: 'alto', type: 'text', totalAnalyses: 3 },
  { period: '2026-07', riskLevel: 'bajo', type: 'link', totalAnalyses: 2 },
  { period: '2026-08', riskLevel: 'alto', type: 'image', totalAnalyses: 1 },
];

test('aggregateReportRows groups report rows for charts', () => {
  assert.deepEqual(aggregateReportRows(rows, 'riskLevel'), [
    { key: 'alto', total: 4 },
    { key: 'bajo', total: 2 },
  ]);
});

test('buildMonthlySeries orders and totals periods', () => {
  assert.deepEqual(buildMonthlySeries(rows), [
    { period: '2026-07', total: 5 },
    { period: '2026-08', total: 1 },
  ]);
});

test('buildLineChartPoints creates finite SVG coordinates', () => {
  const points = buildLineChartPoints(buildMonthlySeries(rows), {
    width: 200,
    height: 100,
    padding: 10,
  });

  assert.deepEqual(points, [
    { period: '2026-07', total: 5, x: 10, y: 10 },
    { period: '2026-08', total: 1, x: 190, y: 74 },
  ]);
});
