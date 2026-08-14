import { findAuditEvents } from '../repositories/audit.repository.js';
import { ERROR_CODES, createAppError } from '../errors/errorCatalog.js';

export const AUDIT_TABLES = Object.freeze(['usuarios', 'analisis', 'recomendaciones']);
export const AUDIT_OPERATIONS = Object.freeze(['INSERT', 'UPDATE', 'DELETE']);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const invalidRequest = (publicMessage) => createAppError(
  ERROR_CODES.INVALID_REQUEST,
  { publicMessage },
);

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized < 1) {
    throw invalidRequest(`${fieldName} debe ser un número entero positivo.`);
  }
  return normalized;
};

const normalizeDate = (value, fieldName) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  if (!DATE_PATTERN.test(normalized)) {
    throw invalidRequest(`${fieldName} debe tener formato YYYY-MM-DD.`);
  }
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw invalidRequest(`${fieldName} no contiene una fecha válida.`);
  }
  return normalized;
};

export const normalizeAuditQuery = (query = {}) => {
  const table = String(query.table || '').trim().toLowerCase();
  const operation = String(query.operation || '').trim().toUpperCase();
  const from = normalizeDate(query.from, 'La fecha inicial');
  const to = normalizeDate(query.to, 'La fecha final');
  const page = parsePositiveInteger(query.page, 1, 'La página');
  const pageSize = parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, 'El tamaño de página');
  if (table && !AUDIT_TABLES.includes(table)) {
    throw invalidRequest('La tabla solicitada no forma parte de la auditoría pública.');
  }
  if (operation && !AUDIT_OPERATIONS.includes(operation)) {
    throw invalidRequest('La operación de auditoría no es válida.');
  }
  if (pageSize > MAX_PAGE_SIZE) {
    throw invalidRequest(`El tamaño de página no puede superar ${MAX_PAGE_SIZE}.`);
  }
  if (from && to && from > to) {
    throw invalidRequest('La fecha inicial no puede ser posterior a la fecha final.');
  }
  return { table, operation, from, to, page, pageSize };
};

export const listAuditEvents = async (filters, repository = findAuditEvents) => {
  const { events, total } = await repository(filters);
  return {
    events: events.map(({ id, tableName, operation, recordId, databaseUser, occurredAt }) => ({
      id: String(id), tableName, operation, recordId, databaseUser, occurredAt,
    })),
    filters: {
      table: filters.table || null,
      operation: filters.operation || null,
      from: filters.from || null,
      to: filters.to || null,
    },
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
};
