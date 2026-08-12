import 'dotenv/config';
import pool from './src/config/database.js';
import { hashSecurePassword } from './src/services/password.service.js';
import {
  listUsers,
  updateUserAdministration,
} from './src/services/user.service.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const client = await pool.connect();
  const suffix = Date.now();
  const email = `afb333.${suffix}@example.com`;

  try {
    await client.query('BEGIN');

    const passwordHash = await hashSecurePassword('AlfiTest123');

    const userResult = await client.query(
      `
        INSERT INTO alfi.usuarios (
          rol_id,
          nombre,
          correo,
          celular,
          provincia,
          rango_edad,
          terminos_aceptados,
          terminos_aceptados_en,
          terminos_version,
          password_hash
        )
        SELECT
          rol_id,
          $1,
          $2,
          '0999999999',
          'Pichincha',
          '25-34',
          true,
          CURRENT_TIMESTAMP,
          '2026-08-12',
          $3
        FROM alfi.roles
        WHERE nombre = 'usuario'
        RETURNING usuario_id
      `,
      ['Prueba HU-17', email, passwordHash],
    );

    const userId = userResult.rows[0]?.usuario_id;
    assert(userId, 'No se pudo crear el usuario temporal de AFB-333.');

    const users = await listUsers({ search: email }, client);
    assert(users.length === 1, 'El listado administrativo no encontró al usuario temporal.');
    assert(users[0].role === 'usuario', 'El usuario temporal no inició con el rol usuario.');
    assert(users[0].active === true, 'El usuario temporal no inició activo.');

    const editedRole = await updateUserAdministration({
      id: userId,
      role: 'auditor',
      active: true,
    }, client);
    assert(editedRole?.role === 'auditor', 'No se actualizó el rol del usuario.');

    const deactivated = await updateUserAdministration({
      id: userId,
      role: 'auditor',
      active: false,
    }, client);
    assert(deactivated?.active === false, 'El usuario no quedó desactivado lógicamente.');

    const inactiveUsers = await listUsers({ search: email, active: false }, client);
    assert(
      inactiveUsers.length === 1 && inactiveUsers[0].id === userId,
      'El filtro por estado no encontró al usuario desactivado.',
    );

    const roleCatalog = await client.query(
      `
        SELECT nombre
        FROM alfi.roles
        WHERE nombre = 'analista'
      `,
    );
    assert(
      roleCatalog.rowCount === 0,
      'El rol analista continúa en el catálogo; ejecuta primero backend/sql/AFB-333-usuarios-accesos.sql.',
    );

    console.log(
      'AFB-333 OK: listado, filtros, edición de rol, desactivación de usuario y retiro de analista validados dentro de una transacción.',
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('AFB-333 ERROR:', error.message);
  process.exitCode = 1;
});
