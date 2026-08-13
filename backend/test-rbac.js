import {
  APP_ROLES,
  PERMISSIONS,
  roleHasPermission,
} from './src/config/permissions.js';
import {
  requirePermission,
  requireRoles,
} from './src/middlewares/authorization.middleware.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executeMiddleware(middleware, user) {
  let statusCode = 200;
  let responseBody = null;
  let nextCalled = false;

  const req = { user };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  middleware(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, responseBody, nextCalled };
}

const matrixCases = [
  [APP_ROLES.USER, PERMISSIONS.ANALYZE_CONTENT, true],
  [APP_ROLES.USER, PERMISSIONS.REPORTING_READ, false],
  [APP_ROLES.USER, PERMISSIONS.DATABASE_DIAGNOSTICS, false],
  [APP_ROLES.AUDITOR, PERMISSIONS.REPORTING_READ, true],
  [APP_ROLES.AUDITOR, PERMISSIONS.AUDIT_READ, true],
  [APP_ROLES.AUDITOR, PERMISSIONS.USERS_ADMIN, false],
  [APP_ROLES.ADMIN, PERMISSIONS.REPORTING_READ, true],
  [APP_ROLES.ADMIN, PERMISSIONS.AUDIT_READ, true],
  [APP_ROLES.ADMIN, PERMISSIONS.USERS_ADMIN, true],
  [APP_ROLES.ADMIN, PERMISSIONS.DATABASE_DIAGNOSTICS, true],
];

for (const [role, permission, expected] of matrixCases) {
  assert(
    roleHasPermission(role, permission) === expected,
    `Matriz inválida: ${role} / ${permission}`,
  );
}

const adminOnly = requireRoles(APP_ROLES.ADMIN);
const deniedRole = executeMiddleware(adminOnly, {
  role: APP_ROLES.USER,
});
assert(deniedRole.statusCode === 403, 'Usuario debe recibir 403 en ruta admin.');
assert(!deniedRole.nextCalled, 'Usuario no debe atravesar middleware admin.');

const allowedAdmin = executeMiddleware(adminOnly, {
  role: APP_ROLES.ADMIN,
});
assert(allowedAdmin.nextCalled, 'Administrador debe atravesar middleware admin.');

const reporting = requirePermission(PERMISSIONS.REPORTING_READ);
const allowedAuditor = executeMiddleware(reporting, {
  role: APP_ROLES.AUDITOR,
});
assert(allowedAuditor.nextCalled, 'Auditor debe acceder a reportería.');

const deniedUser = executeMiddleware(reporting, {
  role: APP_ROLES.USER,
});
assert(deniedUser.statusCode === 403, 'Usuario debe recibir 403 en reportería.');

const audit = requirePermission(PERMISSIONS.AUDIT_READ);
const allowedAuditAdmin = executeMiddleware(audit, {
  role: APP_ROLES.ADMIN,
});
assert(allowedAuditAdmin.nextCalled, 'Administrador debe acceder a auditoría.');

const allowedAuditAuditor = executeMiddleware(audit, {
  role: APP_ROLES.AUDITOR,
});
assert(allowedAuditAuditor.nextCalled, 'Auditor debe acceder a auditoría.');

const deniedAuditUser = executeMiddleware(audit, {
  role: APP_ROLES.USER,
});
assert(deniedAuditUser.statusCode === 403, 'Usuario debe recibir 403 en auditoría.');

const unauthenticated = executeMiddleware(reporting, null);
assert(
  unauthenticated.statusCode === 401,
  'Petición no autenticada debe recibir 401.',
);

console.table(
  matrixCases.map(([role, permission, allowed]) => ({
    role,
    permission,
    allowed,
  })),
);

console.log(
  'AFB-319 OK: matriz RBAC y respuestas 401/403 validadas para usuario, auditor y administrador.',
);
