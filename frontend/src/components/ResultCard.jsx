import { normalizeRiskLevel } from '../utils/risk.js';

const RISK_CONFIG = {
  bajo: {
    label: 'Riesgo bajo',
    shortLabel: 'Bajo',
    icon: 'bi-check-circle-fill',
    className: 'risk-low',
    message: 'No se observan señales fuertes de fraude, aunque conviene verificar la fuente.',
  },
  medio: {
    label: 'Riesgo medio',
    shortLabel: 'Medio',
    icon: 'bi-exclamation-triangle-fill',
    className: 'risk-medium',
    message: 'Existen señales que requieren precaución y verificación adicional antes de actuar.',
  },
  alto: {
    label: 'Riesgo alto',
    shortLabel: 'Alto',
    icon: 'bi-x-octagon-fill',
    className: 'risk-high',
    message: 'El contenido presenta señales críticas. Evita transferir dinero o entregar datos sin verificar.',
  },
};

const ORDERED_RISKS = ['bajo', 'medio', 'alto'];


export default function ResultCard({
  result,
  onShare,
  onSpeak,
  isSpeaking = false,
  speechSupported = true,
}) {
  if (!result) return null;

  if (result.allowed === false) {
    return (
      <section className="out-of-scope-card card border-0 shadow-sm">
        <div className="card-body p-4 d-flex gap-3 align-items-start">
          <div className="scope-icon">
            <i className="bi bi-slash-circle"></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 align-items-sm-start">
              <div>
                <p className="section-kicker mb-1">Consulta fuera del alcance</p>
                <p className="mb-0">{result.message}</p>
              </div>
              {onSpeak && (
                <button
                  type="button"
                  className={`btn btn-light voice-result-button ${isSpeaking ? "is-speaking" : ""}`}
                  onClick={() => onSpeak(result)}
                  disabled={!speechSupported}
                >
                  <i className={`bi ${isSpeaking ? "bi-stop-circle-fill" : "bi-volume-up-fill"} me-2`}></i>
                  {isSpeaking ? "Detener voz" : "Escuchar respuesta"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const riskLevel = normalizeRiskLevel(result.riskLevel);
  const config = RISK_CONFIG[riskLevel];

  return (
    <section className={`result-card card border-0 shadow-lg ${config.className}`}>
      <div className="card-body p-4 p-lg-5">
        <div className="result-top mb-4">
          <div>
            <p className="section-kicker mb-1">Resultado del análisis</p>
            <h2 className="h4 fw-bold mb-0">Semáforo de riesgo financiero</h2>
          </div>
          <div className="result-actions">
            {onSpeak && (
              <button
                type="button"
                className={`btn btn-light voice-result-button ${isSpeaking ? "is-speaking" : ""}`}
                onClick={() => onSpeak(result)}
                disabled={!speechSupported}
                title={
                  speechSupported
                    ? "Escuchar el resultado completo"
                    : "La lectura por voz no está disponible en este navegador"
                }
              >
                <i className={`bi ${isSpeaking ? "bi-stop-circle-fill" : "bi-volume-up-fill"} me-2`}></i>
                {isSpeaking ? "Detener voz" : "Escuchar resultado"}
              </button>
            )}
            {onShare && (
              <button type="button" className="btn btn-light share-button" onClick={() => onShare(result)}>
                <i className="bi bi-share me-2"></i>
                Compartir
              </button>
            )}
          </div>
        </div>

        <div className="risk-dashboard">
          <div className="risk-main">
            <div className={`risk-icon-orb ${config.className}`}>
              <i className={`bi ${config.icon}`}></i>
            </div>
            <div>
              <span className={`risk-label ${config.className}`}>{config.label}</span>
              <p className="risk-message mb-0">{config.message}</p>
            </div>
          </div>

          <div className="traffic-light" aria-label={`Semáforo activo: ${config.label}`}>
            {ORDERED_RISKS.map((level) => {
              const item = RISK_CONFIG[level];
              const isActive = level === riskLevel;
              return (
                <div key={level} className={`traffic-light-item ${item.className} ${isActive ? 'active' : ''}`}>
                  <span className="traffic-bulb"></span>
                  <span>{item.shortLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`risk-meter ${config.className}`} aria-hidden="true">
          <span></span>
        </div>

        {result.summary && <p className="result-summary lead mb-4">{result.summary}</p>}

        <div className="row g-4">
          {result.warningSigns?.length > 0 && (
            <div className="col-lg-6">
              <div className="detail-box h-100">
                <h3>
                  <i className="bi bi-exclamation-diamond me-2"></i>
                  Señales detectadas
                </h3>
                <ul className="clean-list">
                  {result.warningSigns.map((sign, index) => (
                    <li key={index}>{sign}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div className="col-lg-6">
              <div className="detail-box h-100">
                <h3>
                  <i className="bi bi-shield-check me-2"></i>
                  Recomendaciones
                </h3>
                <ul className="clean-list">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {result.disclaimer && (
          <div className="result-disclaimer mt-4">
            <i className="bi bi-info-circle me-2"></i>
            {result.disclaimer}
          </div>
        )}
      </div>
    </section>
  );
}
