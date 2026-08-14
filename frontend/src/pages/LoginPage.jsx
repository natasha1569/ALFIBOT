import { useState } from 'react';
import {
  clearRememberedEmail,
  getRememberedEmail,
  saveAuthSession,
  saveRememberedEmail,
} from '../auth/authStorage.js';
import { login, registerUser } from '../services/api.js';

const PROVINCES = [
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
];

const AGE_RANGES = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
];

const FINANCIAL_INTERESTS = [
  { code: 'ahorro', label: 'Ahorro' },
  { code: 'creditos_financiamiento', label: 'Créditos y financiamiento' },
  { code: 'inversiones', label: 'Inversiones' },
  { code: 'seguros', label: 'Seguros' },
  { code: 'emprendimiento', label: 'Emprendimiento' },
  { code: 'educacion_financiera', label: 'Educación financiera' },
];

const EMPTY_REGISTRATION = {
  name: '',
  email: '',
  phone: '',
  province: '',
  ageRange: '',
  interests: [],
  termsAccepted: false,
  password: '',
  confirmPassword: '',
};

const LoginPage = ({
  onLogin,
  onBack,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState(initialMode);
  const rememberedEmail = getRememberedEmail();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail));

  const [credentials, setCredentials] = useState({
    email: rememberedEmail,
    password: '',
  });

  const [registration, setRegistration] = useState(EMPTY_REGISTRATION);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCredentials((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRememberEmailChange = (event) => {
    const { checked } = event.target;

    setRememberEmail(checked);

    if (!checked) {
      clearRememberedEmail();
    }
  };

  const handleRegistrationChange = (event) => {
    const { name, value, type, checked } = event.target;

    setRegistration((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInterestChange = (code) => {
    setRegistration((current) => {
      const alreadySelected = current.interests.includes(code);

      return {
        ...current,
        interests: alreadySelected
          ? current.interests.filter((interest) => interest !== code)
          : [...current.interests, code],
      };
    });
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const session = await login(credentials);

      if (rememberEmail) {
        saveRememberedEmail(credentials.email);
      } else {
        clearRememberedEmail();
      }

      saveAuthSession(session);

      onLogin(session.user);
    } catch (requestError) {
      setError(
        requestError.message || 'No se pudo iniciar sesión.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!registration.province || !registration.ageRange) {
      setError('Selecciona tu provincia y rango de edad.');
      return;
    }

    if (registration.interests.length === 0) {
      setError('Selecciona al menos un interés financiero.');
      return;
    }

    if (!registration.termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(registration);

      setCredentials({
        email: registration.email.trim().toLowerCase(),
        password: '',
      });

      setRegistration(EMPTY_REGISTRATION);

      setMode('login');

      setSuccessMessage(
        result.message || 'Cuenta creada correctamente.',
      );
    } catch (requestError) {
      setError(
        requestError.message || 'No se pudo crear la cuenta.',
      );
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
          <img
            src="/alfi-robot-low.png"
            alt="ALFI BOT"
          />
        </div>

        <p className="section-kicker mb-2">
          Acceso protegido
        </p>

        <h1>
          {mode === 'login'
            ? 'Iniciar sesión en ALFI BOT'
            : 'Crear cuenta en ALFI BOT'}
        </h1>

        <p className="alfi-login-copy">
          {mode === 'login'
            ? 'Ingresa con tus credenciales para utilizar el analizador preventivo.'
            : 'Registra tus datos. El rol de acceso se asignará automáticamente de forma interna.'}
        </p>

        {mode === 'login' ? (
          <form
            onSubmit={handleSubmit}
            className="alfi-login-form"
          >
            <label htmlFor="email">
              Correo electrónico
            </label>

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

            <label htmlFor="password">
              Contraseña
            </label>

            <div className="alfi-login-input">
              <i className="bi bi-lock"></i>

              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                minLength={8}
                required
              />

              <button
                className="btn btn-link text-secondary p-0 border-0"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
              </button>
            </div>

            <label className="form-check d-flex align-items-center gap-2 m-0 fw-normal">
              <input
                className="form-check-input m-0"
                type="checkbox"
                checked={rememberEmail}
                onChange={handleRememberEmailChange}
              />
              <span>Recordar correo</span>
            </label>

            {successMessage && (
              <div
                className="alert alert-success py-2"
                role="status"
              >
                {successMessage}
              </div>
            )}

            {error && (
              <div
                className="alert alert-danger py-2"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              className="btn btn-alfi btn-lg w-100"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Verificando...'
                : 'Ingresar'}
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
          <form
            onSubmit={handleRegister}
            className="alfi-login-form"
          >
            <label htmlFor="register-name">
              Nombre completo
            </label>

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

            <label htmlFor="register-email">
              Correo electrónico
            </label>

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

            <label htmlFor="register-phone">
              Celular
            </label>

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

            <label htmlFor="register-province">
              Provincia
            </label>

            <div className="alfi-login-input">
              <i className="bi bi-geo-alt"></i>

              <select
                id="register-province"
                name="province"
                className="form-select border-0 bg-transparent shadow-none"
                value={registration.province}
                onChange={handleRegistrationChange}
                required
              >
                <option value="">Selecciona una provincia</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <label htmlFor="register-age-range">
              Rango de edad
            </label>

            <div className="alfi-login-input">
              <i className="bi bi-calendar3"></i>

              <select
                id="register-age-range"
                name="ageRange"
                className="form-select border-0 bg-transparent shadow-none"
                value={registration.ageRange}
                onChange={handleRegistrationChange}
                required
              >
                <option value="">Selecciona un rango</option>
                {AGE_RANGES.map((ageRange) => (
                  <option key={ageRange} value={ageRange}>
                    {ageRange}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="border rounded-3 p-3 mb-2">
              <legend className="float-none w-auto px-2 fs-6 fw-bold mb-1">
                Intereses financieros
              </legend>

              <small className="text-secondary d-block mb-2">
                Selecciona al menos uno.
              </small>

              <div className="row g-2">
                {FINANCIAL_INTERESTS.map((interest) => (
                  <div className="col-12 col-sm-6" key={interest.code}>
                    <label className="form-check d-flex align-items-center gap-2 m-0">
                      <input
                        className="form-check-input m-0"
                        type="checkbox"
                        checked={registration.interests.includes(interest.code)}
                        onChange={() => handleInterestChange(interest.code)}
                      />
                      <span className="fw-normal">
                        {interest.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            <label htmlFor="register-password">
              Contraseña
            </label>

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
              Mínimo 8 caracteres, con mayúscula,
              minúscula y número.
            </small>

            <label htmlFor="register-confirm-password">
              Confirmar contraseña
            </label>

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

            <details className="border rounded-3 p-3 bg-light">
              <summary className="fw-bold">
                Ver Términos, Privacidad y uso de datos
              </summary>

              <div className="small text-secondary mt-2">
                <p className="mb-2">
                  ALFI BOT utiliza los datos de registro para crear y proteger tu cuenta,
                  operar el servicio y elaborar analítica agregada del producto.
                </p>
                <p className="mb-0">
                  Los intereses financieros y datos generales de perfil pueden utilizarse
                  de forma segmentada para mejorar contenidos y mostrar publicidad relevante
                  de entidades financieras. ALFI BOT no requiere almacenar saldos, cuentas
                  bancarias, patrimonio ni historial financiero para este propósito.
                </p>
              </div>
            </details>

            <label className="form-check d-flex align-items-start gap-2 my-2">
              <input
                id="register-terms"
                name="termsAccepted"
                className="form-check-input mt-1"
                type="checkbox"
                checked={registration.termsAccepted}
                onChange={handleRegistrationChange}
                required
              />
              <span className="fw-normal">
                Acepto los Términos y Condiciones, la Política de Privacidad y
                declaro haber leído la información sobre uso de datos y publicidad.
              </span>
            </label>

            {error && (
              <div
                className="alert alert-danger py-2"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              className="btn btn-alfi btn-lg w-100"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Creando cuenta...'
                : 'Crear cuenta'}
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
          ALFI BOT protege tus credenciales y nunca
          almacena contraseñas en texto plano.
        </small>

      </section>
    </main>
  );
};

export default LoginPage;