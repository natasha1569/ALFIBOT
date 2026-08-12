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

export async function createRegisteredUser({
  name,
  email,
  phone,
  province,
  ageRange,
  interests,
  termsAccepted,
  termsVersion,
  passwordHash,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

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
          r.rol_id,
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          CURRENT_TIMESTAMP,
          $7,
          $8
        FROM alfi.roles r
        WHERE r.nombre = 'usuario'
        RETURNING
          usuario_id AS id,
          nombre AS name,
          correo AS email,
          celular AS phone,
          provincia AS province,
          rango_edad AS "ageRange",
          activo AS active
      `,
      [
        name,
        email,
        phone,
        province,
        ageRange,
        termsAccepted,
        termsVersion,
        passwordHash,
      ],
    );

    const createdUser = userResult.rows[0];

    if (!createdUser) {
      const error = new Error('No existe el rol interno de usuario.');
      error.code = 'ALFI_ROLE_NOT_FOUND';
      throw error;
    }

    const interestsResult = await client.query(
      `
        SELECT interes_id, codigo
        FROM alfi.intereses_financieros
        WHERE activo = true
          AND codigo = ANY($1::varchar[])
      `,
      [interests],
    );

    if (interestsResult.rows.length !== interests.length) {
      const error = new Error(
        'Uno o más intereses financieros no existen o están inactivos.',
      );
      error.code = 'ALFI_INVALID_INTERESTS';
      throw error;
    }

    await client.query(
      `
        INSERT INTO alfi.usuario_intereses_financieros (
          usuario_id,
          interes_id
        )
        SELECT
          $1,
          unnest($2::int[])
      `,
      [
        createdUser.id,
        interestsResult.rows.map((interest) => interest.interes_id),
      ],
    );

    await client.query('COMMIT');

    return {
      ...createdUser,
      role: 'usuario',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
