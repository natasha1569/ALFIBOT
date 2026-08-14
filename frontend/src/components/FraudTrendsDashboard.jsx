import { useEffect, useMemo, useState } from 'react';
import { fetchFraudTrends } from '../services/api.js';
import {
  FRAUD_CATEGORY_LABELS,
  getFraudCategoryLabel,
} from '../utils/fraudCategory.js';
import {
  aggregateReportRows,
  buildLineChartPoints,
  buildMonthlySeries,
} from '../utils/reporting.js';

const RISK_LABELS = Object.freeze({
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  sin_dato: 'Sin dato',
});

const TYPE_LABELS = Object.freeze({
  text: 'Texto',
  link: 'Enlace',
  image: 'Imagen',
  sin_dato: 'Sin dato',
});

const RISK_COLORS = Object.freeze({
  bajo: '#16a34a',
  medio: '#f59e0b',
  alto: '#dc2626',
  sin_dato: '#64748b',
});

const TYPE_COLORS = Object.freeze({
  text: '#2563eb',
  link: '#7c3aed',
  image: '#0891b2',
  sin_dato: '#64748b',
});

const EMPTY_FILTERS = Object.freeze({
  category: '',
  risk: '',
  type: '',
  period: '',
});

const HorizontalBars = ({ data, labels, colors, title }) => {
  const maximum = Math.max(...data.map(({ total }) => total), 1);

  return (
    <section className="report-chart-panel" aria-label={title}>
      <h3 className="h6 mb-4">{title}</h3>
      <div className="report-bars">
        {data.map(({ key, total }) => (
          <div className="report-bar-row" key={key}>
            <div className="d-flex justify-content-between gap-3 mb-1">
              <span>{labels[key] || key}</span>
              <strong>{total}</strong>
            </div>
            <div
              className="report-bar-track"
              role="img"
              aria-label={`${labels[key] || key}: ${total} análisis`}
            >
              <span
                style={{
                  width: `${(total / maximum) * 100}%`,
                  backgroundColor: colors[key] || '#64748b',
                }}
              ></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const MonthlyLineChart = ({ series }) => {
  const width = 720;
  const height = 240;
  const points = buildLineChartPoints(series, { width, height, padding: 42 });
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <section className="report-chart-panel report-line-panel" aria-labelledby="monthly-trend-title">
      <h3 className="h6 mb-3" id="monthly-trend-title">Evolución mensual de análisis</h3>
      <div className="report-line-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="monthly-chart-title monthly-chart-description">
          <title id="monthly-chart-title">Tendencia mensual</title>
          <desc id="monthly-chart-description">Cantidad total de análisis agregados por mes.</desc>
          {[42, 94, 146, 198].map((y) => (
            <line className="report-grid-line" x1="42" x2="678" y1={y} y2={y} key={y} />
          ))}
          <polyline className="report-trend-line" points={line} />
          {points.map((point) => (
            <g key={point.period}>
              <circle className="report-trend-point" cx={point.x} cy={point.y} r="6">
                <title>{point.period}: {point.total} análisis</title>
              </circle>
              <text className="report-axis-label" x={point.x} y="226" textAnchor="middle">
                {point.period.slice(2)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {series.map(({ period, total }) => (
          <span className="badge text-bg-light border" key={period}>
            {period}: {total}
          </span>
        ))}
      </div>
    </section>
  );
};

const FraudTrendsDashboard = ({ mode = 'reporting' }) => {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [report, setReport] = useState({ rows: [], totals: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (nextFilters = filters) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchFraudTrends(nextFilters);
      setReport(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport({ ...EMPTY_FILTERS });
  }, []);

  const riskData = useMemo(
    () => aggregateReportRows(report.rows, 'riskLevel'),
    [report.rows],
  );
  const typeData = useMemo(
    () => aggregateReportRows(report.rows, 'type'),
    [report.rows],
  );
  const monthlySeries = useMemo(
    () => buildMonthlySeries(report.rows),
    [report.rows],
  );

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    loadReport(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { ...EMPTY_FILTERS };
    setFilters(emptyFilters);
    loadReport(emptyFilters);
  };

  const isTrendMode = mode === 'trends';
  const title = isTrendMode ? 'Evolución de tendencias' : 'Reportería BI de fraude';
  const description = isTrendMode
    ? 'Evolución mensual agregada para identificar cambios en el volumen de análisis.'
    : 'Distribución agregada por riesgo, contenido, categoría y periodo; no expone identidad individual.';

  return (
    <section className="card border-0 shadow-sm" aria-labelledby={`${mode}-dashboard-title`}>
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <p className="section-kicker mb-1">Analítica agregada</p>
            <h2 className="h4 mb-2" id={`${mode}-dashboard-title`}>{title}</h2>
            <p className="text-secondary mb-0">{description}</p>
          </div>
          <span className="badge text-bg-light border px-3 py-2">
            <i className="bi bi-shield-lock me-2"></i>
            Datos agregados
          </span>
        </div>

        <form className="row g-3 mb-4" onSubmit={applyFilters}>
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor={`${mode}-fraud-category-filter`}>Categoría</label>
            <select
              id={`${mode}-fraud-category-filter`}
              className="form-select"
              name="category"
              value={filters.category}
              onChange={updateFilter}
            >
              <option value="">Todas</option>
              {Object.entries(FRAUD_CATEGORY_LABELS).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor={`${mode}-risk-filter`}>Riesgo</label>
            <select
              id={`${mode}-risk-filter`}
              className="form-select"
              name="risk"
              value={filters.risk}
              onChange={updateFilter}
            >
              <option value="">Todos</option>
              {Object.entries(RISK_LABELS)
                .filter(([value]) => value !== 'sin_dato')
                .map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor={`${mode}-content-type-filter`}>Contenido</label>
            <select
              id={`${mode}-content-type-filter`}
              className="form-select"
              name="type"
              value={filters.type}
              onChange={updateFilter}
            >
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS)
                .filter(([value]) => value !== 'sin_dato')
                .map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor={`${mode}-period-filter`}>Periodo</label>
            <input
              id={`${mode}-period-filter`}
              className="form-control"
              type="month"
              name="period"
              value={filters.period}
              onChange={updateFilter}
            />
          </div>

          <div className="col-12 d-flex flex-wrap gap-2">
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              <i className="bi bi-funnel me-2"></i>
              Aplicar filtros
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={clearFilters} disabled={isLoading}>
              Limpiar
            </button>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="report-stat-card h-100">
              <small className="text-secondary d-block">Análisis agregados</small>
              <strong className="fs-3">{report.totals?.totalAnalyses ?? 0}</strong>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="report-stat-card h-100">
              <small className="text-secondary d-block">Señales detectadas</small>
              <strong className="fs-3">{report.totals?.totalWarningSigns ?? 0}</strong>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="report-stat-card h-100">
              <small className="text-secondary d-block">Recomendaciones</small>
              <strong className="fs-3">{report.totals?.totalRecommendations ?? 0}</strong>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-secondary py-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Cargando tendencias…
          </div>
        ) : report.rows?.length > 0 ? (
          <>
            {isTrendMode ? (
              <MonthlyLineChart series={monthlySeries} />
            ) : (
              <div className="report-chart-grid mb-4">
                <HorizontalBars
                  data={riskData}
                  labels={RISK_LABELS}
                  colors={RISK_COLORS}
                  title="Distribución por nivel de riesgo"
                />
                <HorizontalBars
                  data={typeData}
                  labels={TYPE_LABELS}
                  colors={TYPE_COLORS}
                  title="Distribución por tipo de contenido"
                />
              </div>
            )}

            <div className="table-responsive mt-4">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Categoría</th>
                    <th>Riesgo</th>
                    <th>Contenido</th>
                    <th className="text-end">Análisis</th>
                    <th className="text-end">% mensual</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr key={`${row.period}-${row.fraudCategory || 'sin-categoria'}-${row.riskLevel}-${row.type}`}>
                      <td>{row.period}</td>
                      <td>{getFraudCategoryLabel(row.fraudCategory) || 'Sin categoría soportada'}</td>
                      <td>{RISK_LABELS[row.riskLevel] || row.riskLevel}</td>
                      <td>{TYPE_LABELS[row.type] || row.type}</td>
                      <td className="text-end">{row.totalAnalyses}</td>
                      <td className="text-end">{row.monthlyPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="alert alert-light border mb-0">
            No existen datos agregados para los filtros seleccionados.
          </div>
        )}
      </div>
    </section>
  );
};

export default FraudTrendsDashboard;
