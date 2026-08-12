import { Router } from 'express';
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

const PROVINCES = new Set([
  'Azuay',
  'Bolívar',
  'Cañar',
  'Carchi',
  'Chimborazo',
  'Cotopaxi',
  'El Oro',
  'Esmeraldas',
  'Galápagos',
  'Guayas',
  'Imbabura',
  'Loja',
  'Los Ríos',
  'Manabí',
  'Morona Santiago',
  'Napo',
  'Orellana',
  'Pastaza',
  'Pichincha',
  'Santa Elena',
  'Santo Domingo de los Tsáchilas',
  'Sucumbíos',
  'Tungurahua',
  'Zamora Chinchipe',
]);

const AGE_RANGES = new Set([
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
]);

const FINANCIAL_INTERESTS = new Set([
  'ahorro',
  'creditos_financiamiento',
  'inversiones',
  'seguros',
  'emprendimiento',
  'educacion_financiera',
]);

const TERMS_VERSION = '2026-08-12';

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
    province,
    ageRange,
    interests,
    termsAccepted,
    password,
    confirmPassword,
  } = req.body || {};

  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.replace(/\s+/g, '') : '';
  const normalizedProvince = typeof province === 'string' ? province.trim() : '';
  const normalizedAgeRange = typeof ageRange === 'string' ? ageRange.trim() : '';
  const normalizedInterests = Array.isArray(interests)
    ? [...new Set(
      interests
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim()),
    )]
    : [];

  if (
    !normalizedName ||
    !normalizedEmail ||
    !normalizedPhone ||
    !normalizedProvince ||
    !normalizedAgeRange ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return res.status(400).json({ error: 'Completa todos los campos del registro.' });
  }

  if (normalizedName.length < 3 || normalizedName.length > 100) {
    return res.status(400).json({
      error: 'El nombre debe tener entre 3 y 100 caracteres.',
    });
  }

  if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 120) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }

  if (!ECUADOR_MOBILE_PATTERN.test(normalizedPhone)) {
    return res.status(400).json({
      error: 'El celular debe tener formato ecuatoriano 09XXXXXXXX.',
    });
  }

  if (!PROVINCES.has(normalizedProvince)) {
    return res.status(400).json({
      error: 'Selecciona una provincia válida del Ecuador.',
    });
  }

  if (!AGE_RANGES.has(normalizedAgeRange)) {
    return res.status(400).json({
      error: 'Selecciona un rango de edad válido.',
    });
  }

  if (
    normalizedInterests.length === 0 ||
    normalizedInterests.some((interest) => !FINANCIAL_INTERESTS.has(interest))
  ) {
    return res.status(400).json({
      error: 'Selecciona al menos un interés financiero válido.',
    });
  }

  if (termsAccepted !== true) {
    return res.status(400).json({
      error: 'Debes aceptar los Términos y Condiciones y la Política de Privacidad.',
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
      province: normalizedProvince,
      ageRange: normalizedAgeRange,
      interests: normalizedInterests,
      termsAccepted: true,
      termsVersion: TERMS_VERSION,
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

    if (error?.code === 'ALFI_INVALID_INTERESTS') {
      return res.status(400).json({
        error: 'Uno o más intereses financieros no son válidos.',
      });
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

      if (databaseUser.role !== 'usuario') {
        return res.status(403).json({
          error: 'Esta cuenta debe ingresar desde su acceso institucional.',
        });
      }

      const publicUser = buildPublicUser(databaseUser);

      return res.json({
        token: createAuthToken(publicUser),
        user: publicUser,
      });
    }

    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  } catch (error) {
    console.error('[auth.routes] Error consultando usuarios:', error.message);
    return res.status(500).json({ error: 'No se pudo validar la cuenta.' });
  }
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
