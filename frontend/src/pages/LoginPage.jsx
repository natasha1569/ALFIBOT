import { useState } from 'react';
import { saveAuthSession } from '../auth/authStorage.js';
import { login, registerUser } from '../services/api.js';

const EMPTY_REGISTRATION = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [registration, setRegistration] = useState(EMPTY_REGISTRATION);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  }

  function handleRegistrationChange(event) {
    const { name, value } = event.target;
    setRegistration((current) => ({ ...current, [name]: value }));
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccessMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const session = await login(credentials);
      saveAuthSession(session);
      onLogin(session.user);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await registerUser(registration);
      setCredentials({ email: registration.email.trim().toLowerCase(), password: '' });
      setRegistration(EMPTY_REGISTRATION);
      setMode('login');
      setSuccessMessage(result.message || 'Cuenta creada correctamente.');
    } catch (requestError) {
      setError(requestError.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="alfi-login-page">
      <section className="alfi-login-card">
        <div className="alfi-login-visual">
          <img src="/alfi-robot-mini.png" alt="ALFI BOT" />
        </div>

        <p className="section-kicker mb-2">Acceso protegido</p>
        <h1>{mode === 'login' ? 'Iniciar sesión en ALFI BOT' : 'Crear cuenta en ALFI BOT'}</h1>
        <p className="alfi-login-copy">
          {mode === 'login'
            ? 'Ingresa con tus credenciales para utilizar el analizador preventivo.'
            : 'Registra tus datos. El rol de acceso se asignará automáticamente de forma interna.'}
        </p>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="alfi-login-form">
            <label htmlFor="email">Correo electrónico</label>
            <div className="alfi-login-input">
              <i className="bi bi-envelope"></i>
              <input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="password">Contraseña</label>
            <div className="alfi-login-input">
              <i className="bi bi-lock"></i>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                minLength={8}
                required
              />
            </div>

            {successMessage && (
              <div className="alert alert-success py-2" role="status">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <button className="btn btn-alfi btn-lg w-100" type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </button>

            <button
              className="btn btn-outline-alfi w-100"
              type="button"
              onClick={() => changeMode('register')}
              disabled={isLoading}
            >
              <i className="bi bi-person-plus me-2"></i>
              Registrarme
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="alfi-login-form">
            <label htmlFor="register-name">Nombre completo</label>
            <div className="alfi-login-input">
              <i className="bi bi-person"></i>
              <input
                id="register-name"
                name="name"
                type="text"
                value={registration.name}
                onChange={handleRegistrationChange}
                autoComplete="name"
                minLength={3}
                maxLength={100}
                required
              />
            </div>

            <label htmlFor="register-email">Correo electrónico</label>
            <div className="alfi-login-input">
              <i className="bi bi-envelope"></i>
              <input
                id="register-email"
                name="email"
                type="email"
                value={registration.email}
                onChange={handleRegistrationChange}
                autoComplete="email"
                maxLength={120}
                required
              />
            </div>

            <label htmlFor="register-phone">Celular</label>
            <div className="alfi-login-input">
              <i className="bi bi-phone"></i>
              <input
                id="register-phone"
                name="phone"
                type="tel"
                value={registration.phone}
                onChange={handleRegistrationChange}
                autoComplete="tel"
                inputMode="numeric"
                pattern="09[0-9]{8}"
                maxLength={10}
                placeholder="09XXXXXXXX"
                required
              />
            </div>

            <label htmlFor="register-password">Contraseña</label>
            <div className="alfi-login-input">
              <i className="bi bi-lock"></i>
              <input
                id="register-password"
                name="password"
                type="password"
                value={registration.password}
                onChange={handleRegistrationChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <small className="text-secondary">
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </small>

            <label htmlFor="register-confirm-password">Confirmar contraseña</label>
            <div className="alfi-login-input">
              <i className="bi bi-shield-lock"></i>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                value={registration.confirmPassword}
                onChange={handleRegistrationChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <button className="btn btn-alfi btn-lg w-100" type="submit" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <button
              className="btn btn-outline-alfi w-100"
              type="button"
              onClick={() => changeMode('login')}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a iniciar sesión
            </button>
          </form>
        )}

        <small className="alfi-login-hint">
          ALFI BOT protege tus credenciales y nunca almacena contraseñas en texto plano.
        </small>
      </section>
    </main>
  );
}
