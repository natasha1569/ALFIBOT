import { useState } from 'react';
import { saveAuthSession } from '../auth/authStorage.js';
import {
  loginAdmin,
  loginAuditor,
} from '../services/api.js';
import { AlertMessage, Button, FormField } from '../common/index.js';

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

const RoleLoginPage = ({
  role,
  onLogin,
  onBack,
}) => {
  const portal = PORTALS[role];
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
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
  };

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
          <FormField
            id={`${role}-email`}
            label="Correo electrónico"
            icon="bi-envelope"
            type="email"
            value={credentials.email}
            onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
            autoComplete="username"
            required
          />
          <FormField
            id={`${role}-password`}
            label="Contraseña"
            icon="bi-lock"
            type="password"
            value={credentials.password}
            onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
            autoComplete="current-password"
            required
          />
          <AlertMessage className="py-2">{error}</AlertMessage>
          <Button className="btn-alfi btn-lg w-100" loading={isLoading} type="submit">
            Ingresar al portal
          </Button>
        </form>
      </section>
    </main>
  );
};

export default RoleLoginPage;
