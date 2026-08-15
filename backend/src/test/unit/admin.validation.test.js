import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APP_ROLES,
  PERMISSIONS,
  roleHasPermission,
} from '../../config/permissions.js';
import {
  normalizeUserFilters,
  normalizeUserUpdate,
} from '../../services/admin.validation.js';

test('AFB-333 restringe administración de usuarios al administrador', () => {
  assert.equal(
    roleHasPermission(APP_ROLES.ADMIN, PERMISSIONS.USERS_ADMIN),
    true,
  );
  assert.equal(
    roleHasPermission(APP_ROLES.AUDITOR, PERMISSIONS.USERS_ADMIN),
    false,
  );
  assert.equal(
    roleHasPermission(APP_ROLES.USER, PERMISSIONS.USERS_ADMIN),
    false,
  );
});

test('AFB-333 valida filtros y actualización de usuario', () => {
  assert.deepEqual(
    normalizeUserFilters({
      search: 'Ana',
      role: 'usuario',
      active: 'true',
    }),
    {
      search: 'Ana',
      role: 'usuario',
      active: true,
    },
  );

  assert.deepEqual(
    normalizeUserUpdate({
      role: 'auditor',
      active: false,
    }),
    {
      role: 'auditor',
      active: false,
    },
  );

  assert.throws(
    () => normalizeUserUpdate({ role: 'analista', active: true }),
    /rol válido/i,
  );
});
