import './LandingPage.css';

export default function LandingPage({ onStart, onLogin }) {
  return (
    <main className="alfi-landing">
      <header className="alfi-header">
        <div className="alfi-container alfi-nav">
          <div className="alfi-brand">
            <img src="/alfi-robot-mini.png" alt="ALFI BOT" />
            <div>
              <strong>ALFI BOT</strong>
              <span>Seguridad financiera inteligente</span>
            </div>
          </div>

          <nav className="alfi-menu">
            <a href="#proyecto">Proyecto</a>
            <a href="#funciones">Funciones</a>
            <a href="#como-funciona">Cómo funciona</a>
          </nav>

          <div className="alfi-nav-actions">
            <button
              type="button"
              className="btn-login"
              onClick={onLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={onStart}
            >
              Probar ALFI BOT
            </button>
          </div>
        </div>
      </header>

      <section className="alfi-hero" id="proyecto">
        <div className="alfi-container hero-grid">
          <div className="hero-copy">
            <span className="hero-badge">
              <i className="bi bi-shield-check"></i>
              Aplicación preventiva
            </span>

            <p className="hero-kicker">
              ALFI BOT · ALERTAS FINANCIERAS
            </p>

            <h1>
              Detecta riesgos
              <span> antes de tomar una decisión.</span>
            </h1>

            <p className="hero-description">
              ALFI BOT analiza textos, enlaces e imágenes para ayudarte a
              identificar patrones comunes en estafas, créditos falsos e
              inversiones engañosas.
            </p>

            <p className="hero-description">
              Recibe un nivel de riesgo claro y recomendaciones preventivas
              antes de compartir datos o realizar pagos.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary btn-large"
                onClick={onStart}
              >
                <i className="bi bi-search"></i>
                Iniciar Prueba Gratuita
              </button>

              <a href="#como-funciona" className="btn-secondary">
                <i className="bi bi-play-circle"></i>
                Ver cómo funciona
              </a>
            </div>

            <div className="hero-points">
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

          <div className="hero-visual">
            <div className="risk-card card-top-left">
              <strong>ANÁLISIS DE RIESGO</strong>

              <div className="mini-chart">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <p>RIESGO <b>BAJO</b></p>
              <p>PATRONES <b>12</b></p>
              <p>AMENAZAS <b>2</b></p>
            </div>

            <div className="risk-card alert-card">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>
                <strong>ALERTA</strong>
                <span>FINANCIERA</span>
              </div>
            </div>

            <div className="risk-card suspicious-card">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>
                <strong>PATRÓN</strong>
                <span>SOSPECHOSO</span>
              </div>
            </div>

            <div className="robot-wrapper">
              <img
                src="/alfi-robot-mini.png"
                alt="ALFI BOT saludando"
                className="hero-robot"
              />
            </div>

            <div className="risk-card activity-card">
              <strong>ACTIVIDAD RECIENTE</strong>

              <div className="bars">
                <span style={{ height: '35%' }}></span>
                <span style={{ height: '48%' }}></span>
                <span style={{ height: '60%' }}></span>
                <span style={{ height: '78%' }}></span>
                <span style={{ height: '50%' }}></span>
                <span style={{ height: '65%' }}></span>
                <span style={{ height: '88%' }}></span>
              </div>
            </div>

            <div className="risk-card meter-card">
              <strong>NIVEL DE RIESGO</strong>

              <div className="risk-meter">
                <div className="needle"></div>
              </div>

              <b>BAJO</b>
            </div>

            <div className="risk-card threats-card">
              <strong>TIPOS DE AMENAZAS</strong>

              <p>Phishing <span>35%</span></p>
              <p>Créditos falsos <span>25%</span></p>
              <p>Inversiones <span>20%</span></p>
              <p>Suplantación <span>10%</span></p>
            </div>

            <div className="risk-card protected-card">
              <i className="bi bi-shield-check"></i>
              <span>SISTEMA PROTEGIDO</span>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits-section" id="funciones">
        <div className="alfi-container benefits-grid">
          <article>
            <div className="benefit-icon">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <h3>Prevención inteligente</h3>
              <p>Identifica señales de riesgo antes de que sea tarde.</p>
            </div>
          </article>

          <article>
            <div className="benefit-icon">
              <i className="bi bi-lock"></i>
            </div>

            <div>
              <h3>Protege tu información</h3>
              <p>Evita compartir tus datos con fuentes no confiables.</p>
            </div>
          </article>

          <article>
            <div className="benefit-icon">
              <i className="bi bi-clock"></i>
            </div>

            <div>
              <h3>Ahorra tiempo</h3>
              <p>Obtén análisis rápidos y claros.</p>
            </div>
          </article>

          <article>
            <div className="benefit-icon">
              <i className="bi bi-check-circle"></i>
            </div>

            <div>
              <h3>Decisiones seguras</h3>
              <p>Toma decisiones financieras con mayor confianza.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="alfi-container">
          <div className="section-title">
            <span>CÓMO FUNCIONA</span>
            <h2>Analiza contenido en tres pasos</h2>
          </div>

          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <h3>Ingresa contenido</h3>
              <p>Escribe un texto, pega un enlace o carga una imagen.</p>
            </article>

            <article>
              <span className="step-number">02</span>
              <h3>ALFI BOT revisa</h3>
              <p>El sistema identifica señales relacionadas con posibles riesgos.</p>
            </article>

            <article>
              <span className="step-number">03</span>
              <h3>Consulta el resultado</h3>
              <p>Recibe nivel de riesgo y recomendaciones preventivas.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}