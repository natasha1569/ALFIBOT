import './LandingPage.css';

export default function LandingPage({ onStart, onLogin }) {
  return (
    <main className="public-page">
      <header className="public-header">
        <div className="public-container nav-content">
          <div className="public-brand">
            <img src="/alfi-robot-mini.png" alt="ALFI BOT" />

            <div>
              <strong>ALFI BOT</strong>
              <span>Seguridad financiera inteligente</span>
            </div>
          </div>

          <div className="nav-actions">
            <button
              className="login-link"
              type="button"
              onClick={onLogin}
            >
              Iniciar sesión
            </button>

            <button
              className="primary-btn small-btn"
              type="button"
              onClick={onStart}
            >
              Probar ALFI BOT
            </button>
          </div>
        </div>
      </header>

      <section className="public-hero">
        <div className="public-container hero-grid">
          <div className="hero-info">
            <span className="hero-label">
              <i className="bi bi-shield-check"></i>
              Prevención financiera con IA
            </span>

            <h1>
              Toma decisiones financieras
              <span> con mayor seguridad.</span>
            </h1>

            <p>
              ALFI BOT analiza textos, enlaces e imágenes para ayudarte
              a detectar señales relacionadas con posibles fraudes,
              inversiones engañosas y préstamos sospechosos.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                type="button"
                onClick={onStart}
              >
                <i className="bi bi-stars"></i>
                Iniciar prueba gratuita
              </button>

              <a href="#funciones" className="secondary-btn">
                Conocer más
              </a>
            </div>

            <div className="hero-features-new">
              <span>
                <i className="bi bi-check-circle-fill"></i>
                Fácil de usar
              </span>

              <span>
                <i className="bi bi-check-circle-fill"></i>
                Análisis preventivo
              </span>

              <span>
                <i className="bi bi-check-circle-fill"></i>
                Resultados claros
              </span>
            </div>
          </div>

          <div className="robot-area">
            <div className="robot-card">
              <span className="online-badge">
                <i className="bi bi-circle-fill"></i>
                ALFI BOT activo
              </span>

              <img
                src="/alfi-robot-mini.png"
                alt="Asistente ALFI BOT"
                className="landing-robot"
              />

              <div className="robot-message">
                <i className="bi bi-shield-check"></i>

                <div>
                  <strong>Prevención inteligente</strong>
                  <span>Analiza antes de confiar o invertir.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" className="functions-section">
        <div className="public-container">
          <div className="section-title">
            <span>Cómo funciona</span>
            <h2>Analiza contenido en tres pasos</h2>
          </div>

          <div className="function-grid">
            <article>
              <i className="bi bi-file-earmark-text"></i>
              <h3>1. Ingresa contenido</h3>
              <p>Escribe un texto, pega un enlace o carga una imagen.</p>
            </article>

            <article>
              <i className="bi bi-cpu"></i>
              <h3>2. ALFI BOT analiza</h3>
              <p>Busca señales relacionadas con posibles riesgos financieros.</p>
            </article>

            <article>
              <i className="bi bi-shield-exclamation"></i>
              <h3>3. Recibe el resultado</h3>
              <p>Consulta el nivel de riesgo y recomendaciones preventivas.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-container">
          <strong>ALFI BOT</strong>
          <span>© 2026 · Proyecto académico PUCE TEC</span>
        </div>
      </footer>
    </main>
  );
}