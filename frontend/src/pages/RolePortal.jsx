const PORTAL_CONFIG = {
  administrador: {
    kicker: 'Administración',
    title: 'Panel administrativo',
    copy: 'Gestión protegida de ALFI BOT. Los módulos de usuarios y licencias se incorporarán sobre esta base RBAC.',
    cards: [
      ['bi-people', 'Usuarios', 'Administrar roles y estado de las cuentas.'],
      ['bi-key', 'Licencias', 'Gestionar vigencia y estado de licencias.'],
      ['bi-bar-chart', 'Reportería', 'Consultar tendencias agregadas de ALFI BOT.'],
      ['bi-database-check', 'Diagnóstico', 'Acceso restringido a controles técnicos.'],
    ],
  },
  auditor: {
    kicker: 'Auditoría',
    title: 'Centro de auditoría',
    copy: 'Espacio de consulta sin funciones administrativas sobre usuarios o licencias.',
    cards: [
      ['bi-bar-chart', 'Reportería BI', 'Consultar patrones agregados por riesgo y categoría.'],
      ['bi-clipboard-data', 'Auditoría', 'Revisar trazabilidad técnica y actividad autorizada.'],
      ['bi-graph-up', 'Tendencias', 'Analizar evolución por periodo y tipo de contenido.'],
    ],
  },
};

export default function RolePortal({
  user,
  onLogout,
}) {
  const portal = PORTAL_CONFIG[user.role];

  return (
    <main className="container py-5">
      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center mb-5">
        <div>
          <p className="section-kicker mb-2">{portal.kicker}</p>
          <h1 className="mb-2">{portal.title}</h1>
          <p className="text-secondary mb-0">{portal.copy}</p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="fw-semibold">
            <i className="bi bi-person-circle me-2"></i>
            {user.name}
          </span>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="row g-4">
        {portal.cards.map(([icon, title, copy]) => (
          <div className="col-12 col-md-6" key={title}>
            <article className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <i className={`bi ${icon} fs-2`}></i>
                <h2 className="h5 mt-3">{title}</h2>
                <p className="text-secondary mb-0">{copy}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  );
}
