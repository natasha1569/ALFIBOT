import { findFraudTrendRows } from '../repositories/reporting.repository.js';
import { ERROR_CODES, createAppError } from '../errors/errorCatalog.js';

const VALID_CATEGORIES = new Set(['credito_falso', 'ponzi', 'piramidal', 'inversion_fraudulenta']);
const VALID_RISKS = new Set(['bajo', 'medio', 'alto']);
const VALID_TYPES = new Set(['text', 'link', 'image']);
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const invalidRequest = (publicMessage) => createAppError(ERROR_CODES.INVALID_REQUEST, { publicMessage });
const normalize = (value) => String(value || '').trim().toLowerCase();

export const normalizeReportingFilters = (query = {}) => {
  const filters = {
    category: normalize(query.category),
    risk: normalize(query.risk),
    type: normalize(query.type),
    period: String(query.period || '').trim(),
  };
  if (filters.category && !VALID_CATEGORIES.has(filters.category)) throw invalidRequest('Categoría de fraude no válida.');
  if (filters.risk && !VALID_RISKS.has(filters.risk)) throw invalidRequest('Nivel de riesgo no válido.');
  if (filters.type && !VALID_TYPES.has(filters.type)) throw invalidRequest('Tipo de contenido no válido.');
  if (filters.period && !PERIOD_PATTERN.test(filters.period)) throw invalidRequest('El periodo debe tener formato YYYY-MM.');
  return filters;
};

export const getFraudTrends = async (filters) => {
  const rows = (await findFraudTrendRows(filters)).map((row) => ({
    ...row,
    period: String(row.period).slice(0, 7),
    totalAnalyses: Number(row.totalAnalyses || 0),
    totalWarningSigns: Number(row.totalWarningSigns || 0),
    totalRecommendations: Number(row.totalRecommendations || 0),
    monthlyPercentage: Number(row.monthlyPercentage || 0),
  }));
  const totals = rows.reduce((accumulator, row) => ({
    totalAnalyses: accumulator.totalAnalyses + row.totalAnalyses,
    totalWarningSigns: accumulator.totalWarningSigns + row.totalWarningSigns,
    totalRecommendations: accumulator.totalRecommendations + row.totalRecommendations,
  }), { totalAnalyses: 0, totalWarningSigns: 0, totalRecommendations: 0 });
  return {
    filters: Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value || null])),
    totals,
    rows,
  };
};
