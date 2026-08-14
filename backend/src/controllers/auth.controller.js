import { createAuthToken } from '../services/token.service.js';
import { hashSecurePassword, verifySecurePassword } from '../services/password.service.js';
import { createRegisteredUser, findUserByEmail, toPublicUser } from '../services/user.service.js';
import { ERROR_CODES, logServerError, sendError } from '../errors/errorCatalog.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^09\d{8}$/;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PROVINCES = new Set(['Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe']);
const AGE_RANGES = new Set(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']);
const FINANCIAL_INTERESTS = new Set(['ahorro', 'creditos_financiamiento', 'inversiones', 'seguros', 'emprendimiento', 'educacion_financiera']);
const TERMS_VERSION = '2026-08-12';
const invalid = (res, publicMessage) => sendError(res, ERROR_CODES.INVALID_REQUEST, { publicMessage });

const normalizeRegistration = (body = {}) => ({
  name: typeof body.name === 'string' ? body.name.trim() : '',
  email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
  phone: typeof body.phone === 'string' ? body.phone.replace(/\s+/g, '') : '',
  province: typeof body.province === 'string' ? body.province.trim() : '',
  ageRange: typeof body.ageRange === 'string' ? body.ageRange.trim() : '',
  interests: Array.isArray(body.interests)
    ? [...new Set(body.interests.filter((item) => typeof item === 'string').map((item) => item.trim()))]
    : [],
  termsAccepted: body.termsAccepted,
  password: body.password,
  confirmPassword: body.confirmPassword,
});

const validateRegistration = (registration) => {
  const required = ['name', 'email', 'phone', 'province', 'ageRange', 'password', 'confirmPassword'];
  if (required.some((field) => !registration[field])) return 'Completa todos los campos del registro.';
  if (registration.name.length < 3 || registration.name.length > 100) return 'El nombre debe tener entre 3 y 100 caracteres.';
  if (!EMAIL_PATTERN.test(registration.email) || registration.email.length > 120) return 'Ingresa un correo electrónico válido.';
  if (!MOBILE_PATTERN.test(registration.phone)) return 'El celular debe tener formato ecuatoriano 09XXXXXXXX.';
  if (!PROVINCES.has(registration.province)) return 'Selecciona una provincia válida del Ecuador.';
  if (!AGE_RANGES.has(registration.ageRange)) return 'Selecciona un rango de edad válido.';
  if (!registration.interests.length || registration.interests.some((item) => !FINANCIAL_INTERESTS.has(item))) return 'Selecciona al menos un interés financiero válido.';
  if (registration.termsAccepted !== true) return 'Debes aceptar los Términos y Condiciones y la Política de Privacidad.';
  if (!STRONG_PASSWORD_PATTERN.test(registration.password)) return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';
  if (registration.password !== registration.confirmPassword) return 'Las contraseñas no coinciden.';
  return null;
};

export const register = async (req, res) => {
  const registration = normalizeRegistration(req.body);
  const validationError = validateRegistration(registration);
  if (validationError) return invalid(res, validationError);
  try {
    if (await findUserByEmail(registration.email)) {
      return sendError(res, ERROR_CODES.CONFLICT, { publicMessage: 'Ya existe una cuenta con ese correo.' });
    }
    const passwordHash = await hashSecurePassword(registration.password);
    const user = await createRegisteredUser({
      ...registration,
      termsVersion: TERMS_VERSION,
      passwordHash,
    });
    return res.status(201).json({ message: 'Cuenta creada correctamente. Ya puedes iniciar sesión.', user: toPublicUser(user) });
  } catch (error) {
    if (error?.code === '23505') return sendError(res, ERROR_CODES.CONFLICT, { publicMessage: 'Ya existe una cuenta con ese correo.' });
    if (error?.code === 'ALFI_INVALID_INTERESTS') return invalid(res, 'Uno o más intereses financieros no son válidos.');
    logServerError('auth/register', error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo crear la cuenta. Intenta nuevamente.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) return invalid(res, 'Ingresa el correo y la contraseña.');
  try {
    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) return sendError(res, ERROR_CODES.INVALID_CREDENTIALS);
    if (!user.active) return sendError(res, ERROR_CODES.ACCOUNT_INACTIVE);
    if (!(await verifySecurePassword(password, user.passwordHash))) return sendError(res, ERROR_CODES.INVALID_CREDENTIALS);
    if (user.role !== 'usuario') return sendError(res, ERROR_CODES.FORBIDDEN, { publicMessage: 'Esta cuenta debe ingresar desde su acceso institucional.' });
    const publicUser = toPublicUser(user);
    return res.json({ token: createAuthToken(publicUser), user: publicUser });
  } catch (error) {
    logServerError('auth/login', error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo validar la cuenta. Intenta nuevamente.' });
  }
};

export const getCurrentUser = (req, res) => res.json({
  user: { id: req.user.sub, name: req.user.name, email: req.user.email, role: req.user.role },
});
