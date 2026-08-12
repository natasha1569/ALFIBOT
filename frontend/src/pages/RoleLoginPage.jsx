import { useState } from 'react';
import { saveAuthSession } from '../auth/authStorage.js';
import {
  loginAdmin,
  loginAuditor,
} from '../services/api.js';

const PORTALS = {
  administrador: {
    title: 'Acceso administrativo',
    copy: 'Portal restringido para gestión y supervisión de ALFI BOT.',
    icon: 'bi-shield-lock',
    login: loginAdmin,
  },
  auditor: {
    title: 'Acceso de auditoría',
    copy: 'Portal de solo lectura para auditoría, reportería y tendencias.',
    icon: 'bi-clipboard-data',
    login: loginAuditor,
  },
};

export default function RoleLoginPage({
  role,
  onLogin,
  onBack,
}) {
  const portal = PORTALS[role];
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await portal.login(credentials);
      saveAuthSession(session);
      onLogin(session.user);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="alfi-login-page">
      <section className="alfi-login-card">
        <button
          className="alfi-back-home"
          type="button"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left"></i>
          Volver al inicio
        </button>

        <div className="alfi-login-visual">
          <i
            className={`bi ${portal.icon}`}
            style={{ fontSize: '4rem' }}
            aria-hidden="true"
          ></i>
        </div>

        <p className="section-kicker mb-2">
          Acceso institucional
        </p>

        <h1>{portal.title}</h1>
        <p className="alfi-login-copy">{portal.copy}</p>

        <form onSubmit={handleSubmit} className="alfi-login-form">
          <label htmlFor={`${role}-email`}>Correo electrónico</label>
          <div className="alfi-login-input">
            <i className="bi bi-envelope"></i>
            <input
              id={`${role}-email`}
              type="email"
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({
                ...current,
                email: event.target.value,
              }))}
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor={`${role}-password`}>Contraseña</label>
          <div className="alfi-login-input">
            <i className="bi bi-lock"></i>
            <input
              id={`${role}-password`}
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({
                ...current,
                password: event.target.value,
              }))}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <button className="btn btn-alfi btn-lg w-100" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Ingresar al portal'}
          </button>
        </form>
      </section>
    </main>
  );
}
