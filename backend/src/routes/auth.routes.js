import { Router } from 'express';
import {
  authUser,
  hashPassword,
  hashesMatch,
} from '../config/auth.config.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createAuthToken } from '../services/token.service.js';
import {
  hashSecurePassword,
  verifySecurePassword,
} from '../services/password.service.js';
import {
  createRegisteredUser,
  findUserByEmail,
} from '../services/user.service.js';

const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ECUADOR_MOBILE_PATTERN = /^09\d{8}$/;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function buildPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

router.post('/register', async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
  } = req.body || {};

  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.replace(/\s+/g, '') : '';

  if (
    !normalizedName ||
    !normalizedEmail ||
    !normalizedPhone ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return res.status(400).json({ error: 'Completa todos los campos del registro.' });
  }

  if (normalizedName.length < 3) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }

  if (!ECUADOR_MOBILE_PATTERN.test(normalizedPhone)) {
    return res.status(400).json({
      error: 'El celular debe tener formato ecuatoriano 09XXXXXXXX.',
    });
  }

  if (!STRONG_PASSWORD_PATTERN.test(password)) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  }

  try {
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }

    const passwordHash = await hashSecurePassword(password);
    const createdUser = await createRegisteredUser({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
    });

    return res.status(201).json({
      message: 'Cuenta creada correctamente. Ya puedes iniciar sesión.',
      user: buildPublicUser(createdUser),
    });
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }

    console.error('[auth.routes] Error al registrar usuario:', error.message);
    return res.status(500).json({ error: 'No se pudo crear la cuenta.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ error: 'Ingresa el correo y la contraseña.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const databaseUser = await findUserByEmail(normalizedEmail);

    if (databaseUser) {
      if (!databaseUser.active) {
        return res.status(401).json({ error: 'La cuenta no se encuentra activa.' });
      }

      const validPassword = await verifySecurePassword(
        password,
        databaseUser.passwordHash,
      );

      if (!validPassword) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      }

      const publicUser = buildPublicUser(databaseUser);

      return res.json({
        token: createAuthToken(publicUser),
        user: publicUser,
      });
    }
  } catch (error) {
    const legacyHash = hashPassword(password);
    const legacyCredentialsAreValid =
      normalizedEmail === authUser.email &&
      hashesMatch(legacyHash, authUser.passwordHash);

    if (!legacyCredentialsAreValid) {
      console.error('[auth.routes] Error consultando usuarios:', error.message);
      return res.status(500).json({ error: 'No se pudo validar la cuenta.' });
    }
  }

  // Compatibilidad temporal con el usuario local previo a AFB-309.
  const legacyHash = hashPassword(password);
  const legacyCredentialsAreValid =
    normalizedEmail === authUser.email &&
    hashesMatch(legacyHash, authUser.passwordHash);

  if (!legacyCredentialsAreValid) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  const publicUser = {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
  };

  return res.json({
    token: createAuthToken(publicUser),
    user: publicUser,
  });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    user: {
      id: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
