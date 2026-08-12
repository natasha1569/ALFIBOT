import { normalizeRiskLevel } from '../utils/risk.js';
import { getFraudCategoryLabel } from '../utils/fraudCategory.js';

const TYPE_LABELS = { text: 'Texto', link: 'Enlace', image: 'Imagen' };
const TYPE_ICONS = { text: 'bi-card-text', link: 'bi-link-45deg', image: 'bi-image' };
const RISK_LABELS = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' };


export default function HistoryList({ items, onClear, isLoading }) {
  return (
    <section className="history-card card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <p className="section-kicker mb-1">Registro local</p>
            <h2 className="h5 fw-bold mb-0">Historial de consultas</h2>
          </div>
          {items.length > 0 && (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClear} disabled={isLoading}>
              <i className="bi bi-trash3 me-1"></i>
              Borrar
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-clock-history"></i>
            <p className="mb-0">
              {isLoading ? 'Cargando historial…' : 'Todavía no hay análisis guardados. Los resultados aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="history-list">
            {items.map((item) => {
              const riskLevel = normalizeRiskLevel(item.riskLevel);
              const fraudCategoryLabel = getFraudCategoryLabel(item.fraudCategory);
              return (
                <article key={item.id} className={`history-item risk-${riskLevel}`}>
                  <div className="history-item-top">
                    <span className="history-type">
                      <i className={`bi ${TYPE_ICONS[item.type] || 'bi-file-earmark-text'} me-1`}></i>
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    <span className={`mini-risk-badge risk-${riskLevel}`}>{RISK_LABELS[riskLevel]}</span>
                  </div>
                  {item.inputPreview && <p className="history-preview">“{item.inputPreview}”</p>}
                  {fraudCategoryLabel && (
                    <p className="history-summary mb-2">
                      <i className="bi bi-shield-exclamation me-1"></i>
                      <strong>{fraudCategoryLabel}</strong>
                    </p>
                  )}
                  {item.summary && <p className="history-summary">{item.summary}</p>}
                  <small className="text-secondary">{new Date(item.createdAt).toLocaleString()}</small>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
