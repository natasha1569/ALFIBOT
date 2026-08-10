import pool from '../config/database.js';

export async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        u.usuario_id AS id,
        u.nombre AS name,
        u.correo AS email,
        u.celular AS phone,
        u.password_hash AS "passwordHash",
        u.activo AS active,
        r.nombre AS role
      FROM alfi.usuarios u
      INNER JOIN alfi.roles r
        ON r.rol_id = u.rol_id
      WHERE lower(u.correo) = lower($1)
      LIMIT 1
    `,
    [email],
  );

  return result.rows[0] || null;
}

export async function createRegisteredUser({ name, email, phone, passwordHash }) {
  const result = await pool.query(
    `
      INSERT INTO alfi.usuarios (
        rol_id,
        nombre,
        correo,
        celular,
        password_hash
      )
      SELECT
        r.rol_id,
        $1,
        $2,
        $3,
        $4
      FROM alfi.roles r
      WHERE r.nombre = 'usuario'
      RETURNING
        usuario_id AS id,
        nombre AS name,
        correo AS email,
        celular AS phone,
        activo AS active
    `,
    [name, email, phone, passwordHash],
  );

  if (!result.rows[0]) {
    const error = new Error('No existe el rol interno de usuario.');
    error.code = 'ALFI_ROLE_NOT_FOUND';
    throw error;
  }

  return {
    ...result.rows[0],
    role: 'usuario',
  };
}
