const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const suffix = Date.now();
const registration = {
  name: 'Usuario Prueba ALFI',
  email: `prueba.afb309.${suffix}@example.com`,
  phone: '0999999999',
  province: 'Pichincha',
  ageRange: '25-34',
  interests: ['ahorro', 'educacion_financiera'],
  termsAccepted: true,
  password: 'AlfiTest123',
  confirmPassword: 'AlfiTest123',
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
};

const assertStatus = (actual, expected, label) => {
  if (actual !== expected) {
    throw new Error(`${label}: se esperaba HTTP ${expected} y se recibió ${actual}.`);
  }
};

const run = async () => {
  const created = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registration),
  });
  assertStatus(created.response.status, 201, 'Registro válido');

  const duplicate = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registration),
  });
  assertStatus(duplicate.response.status, 409, 'Correo duplicado');

  const emptyFields = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: '',
    }),
  });
  assertStatus(emptyFields.response.status, 400, 'Campos vacíos');

  const invalidEmail = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: 'correo-invalido',
    }),
  });
  assertStatus(invalidEmail.response.status, 400, 'Correo inválido');

  const invalidPhone = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: `telefono.${suffix}@example.com`,
      phone: '123456',
    }),
  });
  assertStatus(invalidPhone.response.status, 400, 'Celular inválido');

  const invalidProvince = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: `provincia.${suffix}@example.com`,
      province: 'Provincia inexistente',
    }),
  });
  assertStatus(invalidProvince.response.status, 400, 'Provincia inválida');

  const noInterests = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: `intereses.${suffix}@example.com`,
      interests: [],
    }),
  });
  assertStatus(noInterests.response.status, 400, 'Intereses obligatorios');

  const termsNotAccepted = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: `terminos.${suffix}@example.com`,
      termsAccepted: false,
    }),
  });
  assertStatus(termsNotAccepted.response.status, 400, 'Términos obligatorios');

  const invalidPassword = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: `debil.${suffix}@example.com`,
      password: '12345678',
      confirmPassword: '12345678',
    }),
  });
  assertStatus(invalidPassword.response.status, 400, 'Contraseña débil');

  const differentPasswords = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      email: `distintas.${suffix}@example.com`,
      confirmPassword: 'OtraClave123',
    }),
  });
  assertStatus(differentPasswords.response.status, 400, 'Contraseñas distintas');

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: registration.email,
      password: registration.password,
    }),
  });
  assertStatus(login.response.status, 200, 'Login del usuario registrado');

  if (!login.data?.token || !login.data?.user?.id) {
    throw new Error('El login no devolvió token y usuario válidos.');
  }

  console.log(
    'AFB-309 OK: registro completo, validaciones, duplicado y login validados.',
  );
};

run().catch((error) => {
  console.error('AFB-309 ERROR:', error.message);
  process.exitCode = 1;
});
