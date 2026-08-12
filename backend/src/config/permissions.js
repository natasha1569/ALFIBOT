export const APP_ROLES = Object.freeze({
  ADMIN: 'administrador',
  AUDITOR: 'auditor',
  USER: 'usuario',
});

export const ALL_APP_ROLES = Object.freeze(Object.values(APP_ROLES));

export const PERMISSIONS = Object.freeze({
  ANALYZE_CONTENT: 'analysis:create',
  OWN_HISTORY_READ: 'history:own:read',
  OWN_HISTORY_DELETE: 'history:own:delete',
  REPORTING_READ: 'reporting:read',
  AUDIT_READ: 'audit:read',
  USERS_ADMIN: 'users:admin',
  DATABASE_DIAGNOSTICS: 'database:diagnostics',
});

export const ROLE_PERMISSIONS = Object.freeze({
  [APP_ROLES.USER]: Object.freeze([
    PERMISSIONS.ANALYZE_CONTENT,
    PERMISSIONS.OWN_HISTORY_READ,
    PERMISSIONS.OWN_HISTORY_DELETE,
  ]),
  [APP_ROLES.AUDITOR]: Object.freeze([
    PERMISSIONS.ANALYZE_CONTENT,
    PERMISSIONS.OWN_HISTORY_READ,
    PERMISSIONS.REPORTING_READ,
    PERMISSIONS.AUDIT_READ,
  ]),
  [APP_ROLES.ADMIN]: Object.freeze([
    ...Object.values(PERMISSIONS),
  ]),
});

export function roleHasPermission(role, permission) {
  return Boolean(
    ROLE_PERMISSIONS[role]?.includes(permission),
  );
}

export function isKnownRole(role) {
  return ALL_APP_ROLES.includes(role);
}
