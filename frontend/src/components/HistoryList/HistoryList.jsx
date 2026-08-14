import { normalizeRiskLevel } from '../../utils/risk.js';
import { getFraudCategoryLabel } from '../../utils/fraudCategory.js';
import { getHistoryPreview } from '../../utils/history.js';
import { Button, LoadingIndicator, SectionHeader } from '../../common/index.js';

const TYPE_LABELS = { text: 'Texto', link: 'Enlace', image: 'Imagen' };
const TYPE_ICONS = { text: 'bi-card-text', link: 'bi-link-45deg', image: 'bi-image' };
const RISK_LABELS = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' };


const HistoryList = ({ items, onClear, isLoading }) => {
  return (
    <section className="history-card card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="mb-3">
          <SectionHeader kicker="Registro personal" title="Historial de consultas" actions={items.length > 0 ? (
            <Button variant="outline-secondary" className="btn-sm" onClick={onClear} disabled={isLoading}>
              <i className="bi bi-trash3 me-1"></i>
              Borrar
            </Button>
          ) : null} />
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-clock-history"></i>
            <p className="mb-0">
              {isLoading ? <LoadingIndicator label="Cargando historial…" /> : 'Todavía no hay análisis guardados. Los resultados aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="history-list">
            {items.map((item) => {
              const riskLevel = normalizeRiskLevel(item.riskLevel);
              const fraudCategoryLabel = getFraudCategoryLabel(item.fraudCategory);
              const preview = getHistoryPreview(item);
              return (
                <article key={item.id} className={`history-item risk-${riskLevel}`}>
                  <div className="history-item-top">
                    <span className="history-type">
                      <i className={`bi ${TYPE_ICONS[item.type] || 'bi-file-earmark-text'} me-1`}></i>
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    <span className={`mini-risk-badge risk-${riskLevel}`}>{RISK_LABELS[riskLevel]}</span>
                  </div>
                  {preview && <p className="history-preview">“{preview}”</p>}
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
};

export default HistoryList;
