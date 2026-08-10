const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const suffix = Date.now();
const registration = {
  name: 'Usuario Prueba ALFI',
  email: `prueba.afb309.${suffix}@example.com`,
  phone: '0999999999',
  password: 'AlfiTest123',
  confirmPassword: 'AlfiTest123',
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function assertStatus(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: se esperaba HTTP ${expected} y se recibió ${actual}.`);
  }
}

async function run() {
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

  console.log('AFB-309 OK: registro, duplicado, contraseña débil y login validados.');
}

run().catch((error) => {
  console.error('AFB-309 ERROR:', error.message);
  process.exitCode = 1;
});
