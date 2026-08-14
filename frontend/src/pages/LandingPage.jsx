import './LandingPage.css';

const LandingPage = ({ onStart, onLogin }) => {
  return (
    <main className="alfi-landing">
      <header className="alfi-header">
        <div className="alfi-container alfi-nav">
          <div className="alfi-brand">
            <img src="/alfi-robot-low.png" alt="ALFI BOT" />
            <div>
              <strong>ALFI BOT</strong>
              <span>Seguridad financiera inteligente</span>
            </div>
          </div>

          <div className="alfi-nav-actions">
            <button
              type="button"
              className="landing-login-button"
              onClick={onLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="landing-primary-button"
              onClick={onStart}
            >
              Iniciar prueba gratuita
            </button>
          </div>
        </div>
      </header>

      <section className="alfi-hero" id="proyecto">
        <div className="alfi-container landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="landing-hero-badge">
              <i className="bi bi-shield-check"></i>
              Aplicación preventiva con inteligencia artificial
            </span>

            <p className="landing-hero-kicker">
              ALFI BOT · ALERTAS FINANCIERAS
            </p>

            <h1 className="landing-hero-title">ALFI BOT</h1>

            <p className="landing-hero-tagline">
              Detecta señales de riesgo antes de tomar una decisión
              financiera.
            </p>

            <p className="landing-hero-description">
              Analiza textos, enlaces, imágenes y capturas sospechosas para
              identificar indicios de phishing, suplantación, créditos falsos,
              inversiones engañosas y otras posibles estafas financieras.
              Recibe un nivel de riesgo, las señales encontradas y
              recomendaciones preventivas antes de compartir datos, transferir
              dinero o aceptar una oferta.
            </p>

            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-primary-button landing-large-button"
                onClick={onStart}
              >
                <i className="bi bi-stars"></i>
                Iniciar prueba gratuita
              </button>

              <a
                className="landing-secondary-button landing-large-button"
                href="#como-funciona"
              >
                Conocer más
              </a>
            </div>

            <div
              className="landing-hero-points"
              aria-label="Ventajas de ALFI BOT"
            >
              <span>
                <i className="bi bi-check-circle-fill"></i>
                Texto, enlace o imagen
              </span>

              <span>
                <i className="bi bi-check-circle-fill"></i>
                Nivel de riesgo claro
              </span>

              <span>
                <i className="bi bi-check-circle-fill"></i>
                Recomendaciones preventivas
              </span>
            </div>
          </div>

          <figure className="landing-hero-artwork">
            <img
              src="/alfi-finance-hero.png"
              alt="Elfiboy, asistente de ALFI BOT, junto a paneles de análisis de riesgo y alertas financieras"
              className="landing-hero-image"
            />
            <figcaption>
              <i className="bi bi-shield-check"></i>
              Elfiboy te ayuda a analizar antes de confiar.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="landing-process-section" id="como-funciona">
        <div className="alfi-container">
          <div className="landing-section-heading">
            <span>CÓMO FUNCIONA</span>
            <h2>Una alerta clara en tres pasos</h2>
            <p>
              ALFI BOT ofrece orientación preventiva para ayudarte a verificar
              una oferta financiera antes de actuar.
            </p>
          </div>

          <div className="landing-process-grid">
            <article>
              <span className="landing-step-icon">
                <i className="bi bi-file-earmark-arrow-up"></i>
              </span>
              <div>
                <strong>1. Ingresa el contenido</strong>
                <p>Escribe un texto, pega un enlace o carga una captura.</p>
              </div>
            </article>

            <article>
              <span className="landing-step-icon">
                <i className="bi bi-cpu"></i>
              </span>
              <div>
                <strong>2. ALFI BOT analiza</strong>
                <p>
                  Busca patrones y señales frecuentes de fraude financiero.
                </p>
              </div>
            </article>

            <article>
              <span className="landing-step-icon">
                <i className="bi bi-shield-exclamation"></i>
              </span>
              <div>
                <strong>3. Revisa la alerta</strong>
                <p>Consulta el nivel de riesgo y las recomendaciones.</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
