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
    </main>
  );
}