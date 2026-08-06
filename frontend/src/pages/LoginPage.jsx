import { useState } from 'react';
import { saveAuthSession } from '../auth/authStorage.js';
import { login } from '../services/api.js';

export default function LoginPage({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
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

  return (
    <main className="alfi-login-page">
      <section className="alfi-login-card">
        <div className="alfi-login-visual">
          <img src="/alfi-robot-mini.png" alt="ALFI BOT" />
        </div>

        <p className="section-kicker mb-2">Acceso protegido</p>
        <h1>Iniciar sesión en ALFI BOT</h1>
        <p className="alfi-login-copy">
          Ingresa con el usuario autorizado para utilizar el analizador preventivo.
        </p>

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
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <button className="btn btn-alfi btn-lg w-100" type="submit" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <small className="alfi-login-hint">
          Usuario: rsarevalo@puce.edu.ec · Contraseña: 12345678
        </small>
      </section>
    </main>
  );
}
