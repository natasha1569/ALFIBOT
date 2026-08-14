import { normalizeSpanishRiskLevel } from '../utils/risk.js';

const RISK_LABELS = {
  bajo: 'Riesgo bajo',
  medio: 'Riesgo medio',
  alto: 'Riesgo alto',
};

const ShareModal = ({
  result,
  isWorking,
  onClose,
  onWhatsapp,
  onDownloadPdf,
  onCopySummary,
}) => {
  if (!result) return null;

  const riskLevel = normalizeSpanishRiskLevel(result.riskLevel);

  return (
    <div className="share-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="share-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="share-modal-header">
          <div>
            <p className="section-kicker mb-1">Compartir alerta preventiva</p>
            <h2 id="share-modal-title" className="h4 fw-bold mb-1">
              Enviar resultado del análisis
            </h2>
            <p className="text-secondary mb-0">
              Comparte el informe con familiares, amigos o conocidos para que revisen la alerta antes de entregar dinero o datos personales.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light share-close-button"
            onClick={onClose}
            aria-label="Cerrar opciones de compartir"
            disabled={isWorking}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className={`share-risk-banner risk-${riskLevel}`}>
          <span className="share-risk-dot"></span>
          <strong>{RISK_LABELS[riskLevel]}</strong>
          <small>Informe preventivo de ALFI BOT</small>
        </div>

        <div className="share-action-list">
          <button type="button" className="share-action-card whatsapp" onClick={onWhatsapp} disabled={isWorking}>
            <span className="share-action-icon">
              <i className="bi bi-whatsapp"></i>
            </span>
            <span>
              <strong>1. Compartir por WhatsApp Web</strong>
              <small>Abre WhatsApp Web con el informe preventivo completo listo para enviar.</small>
            </span>
          </button>

          <button type="button" className="share-action-card pdf" onClick={onDownloadPdf} disabled={isWorking}>
            <span className="share-action-icon">
              <i className="bi bi-filetype-pdf"></i>
            </span>
            <span>
              <strong>2. Descargar PDF</strong>
              <small>Genera un informe con resumen, señales, recomendaciones y la imagen analizada si aplica.</small>
            </span>
          </button>

          <button type="button" className="share-action-card copy" onClick={onCopySummary} disabled={isWorking}>
            <span className="share-action-icon">
              <i className="bi bi-clipboard-check"></i>
            </span>
            <span>
              <strong>3. Copiar resumen</strong>
              <small>Copia un texto ordenado para pegarlo en cualquier chat, correo o documento.</small>
            </span>
          </button>
        </div>

        {isWorking && (
          <div className="share-working">
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
            Preparando informe compartible…
          </div>
        )}
      </section>
    </div>
  );
};

export default ShareModal;
