import { ALL_APP_ROLES } from '../config/permissions.js';


export function parsePositiveInteger(value, fieldName = 'Identificador') {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} no es válido.`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

export function parseOptionalBoolean(value, fieldName = 'Estado') {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;

  const error = new Error(`${fieldName} no es válido.`);
  error.statusCode = 400;
  throw error;
}

export function normalizeUserFilters(query = {}) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const role = typeof query.role === 'string' ? query.role.trim() : '';
  const active = parseOptionalBoolean(query.active, 'El estado de usuario');

  if (search.length > 100) {
    const error = new Error('La búsqueda no puede superar 100 caracteres.');
    error.statusCode = 400;
    throw error;
  }

  if (role && !ALL_APP_ROLES.includes(role)) {
    const error = new Error('El rol indicado no es válido.');
    error.statusCode = 400;
    throw error;
  }

  return { search, role, active };
}

export function normalizeUserUpdate(body = {}) {
  const role = typeof body.role === 'string' ? body.role.trim() : '';
  const active = parseOptionalBoolean(body.active, 'El estado de usuario');

  if (!role || !ALL_APP_ROLES.includes(role)) {
    const error = new Error('Selecciona un rol válido.');
    error.statusCode = 400;
    throw error;
  }

  if (active === null) {
    const error = new Error('Selecciona el estado del usuario.');
    error.statusCode = 400;
    throw error;
  }

  return { role, active };
}
