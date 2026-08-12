import { useEffect, useState } from 'react';
import { fetchFraudTrends } from '../services/api.js';
import {
  FRAUD_CATEGORY_LABELS,
  getFraudCategoryLabel,
} from '../utils/fraudCategory.js';

const RISK_LABELS = Object.freeze({
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
});

const TYPE_LABELS = Object.freeze({
  text: 'Texto',
  link: 'Enlace',
  image: 'Imagen',
});

export default function FraudTrendsDashboard() {
  const [filters, setFilters] = useState({
    category: '',
    risk: '',
    type: '',
    period: '',
  });
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
    loadReport();
  }, []);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    loadReport(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { category: '', risk: '', type: '', period: '' };
    setFilters(emptyFilters);
    loadReport(emptyFilters);
  };

  return (
    <section className="card border-0 shadow-sm mt-5">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <p className="section-kicker mb-1">Analítica agregada</p>
            <h2 className="h4 mb-2">Tendencias de fraude</h2>
            <p className="text-secondary mb-0">
              Información agrupada por categoría, riesgo, tipo de contenido y periodo; no expone identidad individual.
            </p>
          </div>
          <span className="badge text-bg-light border px-3 py-2">
            <i className="bi bi-shield-lock me-2"></i>
            Datos agregados
          </span>
        </div>

        <form className="row g-3 mb-4" onSubmit={applyFilters}>
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="fraud-category-filter">Categoría</label>
            <select
              id="fraud-category-filter"
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
            <label className="form-label" htmlFor="risk-filter">Riesgo</label>
            <select
              id="risk-filter"
              className="form-select"
              name="risk"
              value={filters.risk}
              onChange={updateFilter}
            >
              <option value="">Todos</option>
              {Object.entries(RISK_LABELS).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="content-type-filter">Contenido</label>
            <select
              id="content-type-filter"
              className="form-select"
              name="type"
              value={filters.type}
              onChange={updateFilter}
            >
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="period-filter">Periodo</label>
            <input
              id="period-filter"
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
            <div className="border rounded-3 p-3 h-100">
              <small className="text-secondary d-block">Análisis agregados</small>
              <strong className="fs-3">{report.totals?.totalAnalyses ?? 0}</strong>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <small className="text-secondary d-block">Señales detectadas</small>
              <strong className="fs-3">{report.totals?.totalWarningSigns ?? 0}</strong>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <small className="text-secondary d-block">Recomendaciones</small>
              <strong className="fs-3">{report.totals?.totalRecommendations ?? 0}</strong>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-secondary py-4">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Cargando tendencias…
          </div>
        ) : report.rows?.length > 0 ? (
          <div className="table-responsive">
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
        ) : (
          <div className="alert alert-light border mb-0">
            No existen datos agregados para los filtros seleccionados.
          </div>
        )}
      </div>
    </section>
  );
}
