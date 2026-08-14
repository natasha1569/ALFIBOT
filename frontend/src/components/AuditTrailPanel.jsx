import { useEffect, useState } from 'react';
import { fetchAuditEvents } from '../services/api.js';

const TABLE_LABELS = Object.freeze({
  usuarios: 'Usuarios',
  analisis: 'Análisis',
  recomendaciones: 'Recomendaciones',
});

const OPERATION_STYLES = Object.freeze({
  INSERT: 'text-bg-success',
  UPDATE: 'text-bg-primary',
  DELETE: 'text-bg-danger',
});

const EMPTY_FILTERS = Object.freeze({
  table: '',
  operation: '',
  from: '',
  to: '',
});

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const AuditTrailPanel = () => {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [query, setQuery] = useState({ ...EMPTY_FILTERS, page: 1, pageSize: 20 });
  const [result, setResult] = useState({ events: [], pagination: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchAuditEvents(query);
        if (isCurrent) setResult(data);
      } catch (requestError) {
        if (isCurrent) setError(requestError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadEvents();

    return () => {
      isCurrent = false;
    };
  }, [query]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setQuery({ ...filters, page: 1, pageSize: 20 });
  };

  const clearFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setQuery({ ...EMPTY_FILTERS, page: 1, pageSize: 20 });
  };

  const changePage = (page) => {
    setQuery((current) => ({ ...current, page }));
  };

  const pagination = result.pagination || {};

  return (
    <section className="card border-0 shadow-sm" aria-labelledby="audit-panel-title">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <p className="section-kicker mb-1">Trazabilidad protegida</p>
            <h2 className="h4 mb-2" id="audit-panel-title">Eventos de auditoría</h2>
            <p className="text-secondary mb-0">
              Operaciones técnicas registradas por PostgreSQL; los datos anteriores y nuevos permanecen ocultos.
            </p>
          </div>
          <span className="badge text-bg-light border px-3 py-2">
            <i className="bi bi-eye me-2"></i>
            Solo lectura
          </span>
        </div>

        <form className="row g-3 mb-4" onSubmit={applyFilters}>
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="audit-table-filter">Entidad</label>
            <select
              className="form-select"
              id="audit-table-filter"
              name="table"
              value={filters.table}
              onChange={updateFilter}
            >
              <option value="">Todas</option>
              {Object.entries(TABLE_LABELS).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="audit-operation-filter">Operación</label>
            <select
              className="form-select"
              id="audit-operation-filter"
              name="operation"
              value={filters.operation}
              onChange={updateFilter}
            >
              <option value="">Todas</option>
              <option value="INSERT">Creación</option>
              <option value="UPDATE">Actualización</option>
              <option value="DELETE">Eliminación</option>
            </select>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="audit-from-filter">Desde</label>
            <input
              className="form-control"
              id="audit-from-filter"
              type="date"
              name="from"
              value={filters.from}
              onChange={updateFilter}
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label" htmlFor="audit-to-filter">Hasta</label>
            <input
              className="form-control"
              id="audit-to-filter"
              type="date"
              name="to"
              value={filters.to}
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

        {isLoading ? (
          <div className="text-secondary py-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            Cargando eventos…
          </div>
        ) : result.events?.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Entidad</th>
                    <th>Operación</th>
                    <th>Registro</th>
                    <th>Usuario BD</th>
                  </tr>
                </thead>
                <tbody>
                  {result.events.map((event) => (
                    <tr key={event.id}>
                      <td>{formatDateTime(event.occurredAt)}</td>
                      <td>{TABLE_LABELS[event.tableName] || event.tableName}</td>
                      <td>
                        <span className={`badge ${OPERATION_STYLES[event.operation] || 'text-bg-secondary'}`}>
                          {event.operation}
                        </span>
                      </td>
                      <td>#{event.recordId}</td>
                      <td><code>{event.databaseUser}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
              <small className="text-secondary">
                Página {pagination.page || 1} de {pagination.totalPages || 1} · {pagination.total || 0} eventos
              </small>
              <div className="btn-group" aria-label="Paginación de auditoría">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  disabled={(pagination.page || 1) <= 1 || isLoading}
                  onClick={() => changePage(pagination.page - 1)}
                >
                  Anterior
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  disabled={(pagination.page || 1) >= (pagination.totalPages || 1) || isLoading}
                  onClick={() => changePage(pagination.page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-light border mb-0">
            No existen eventos para los filtros seleccionados.
          </div>
        )}
      </div>
    </section>
  );
};

export default AuditTrailPanel;
