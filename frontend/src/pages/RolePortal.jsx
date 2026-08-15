import { useState } from 'react';
import FraudTrendsDashboard from '../components/FraudTrendsDashboard/FraudTrendsDashboard.jsx';
import AdminManagement from '../components/AdminManagement/AdminManagement.jsx';
import AuditTrailPanel from '../components/AuditTrailPanel/AuditTrailPanel.jsx';
import { Button } from '../common/index.js';

const PORTAL_CONFIG = {
  administrador: {
    kicker: 'Administración',
    title: 'Panel administrativo',
    copy: 'Gestión protegida de usuarios y accesos de ALFI BOT sobre la matriz RBAC vigente.',
    defaultSection: 'users',
    cards: [
      { section: 'users', icon: 'bi-people', title: 'Usuarios', copy: 'Administrar roles y estado de las cuentas.' },
      { section: 'reporting', icon: 'bi-bar-chart', title: 'Reportería BI', copy: 'Consultar distribuciones agregadas y gráficos.' },
      { section: 'audit', icon: 'bi-clipboard-data', title: 'Auditoría', copy: 'Revisar trazabilidad técnica autorizada.' },
      { section: 'trends', icon: 'bi-graph-up', title: 'Tendencias', copy: 'Analizar la evolución mensual de los análisis.' },
    ],
  },
  auditor: {
    kicker: 'Auditoría',
    title: 'Centro de auditoría',
    copy: 'Espacio de consulta sin funciones administrativas sobre usuarios o control de accesos.',
    defaultSection: 'reporting',
    cards: [
      { section: 'reporting', icon: 'bi-bar-chart', title: 'Reportería BI', copy: 'Consultar patrones y gráficos agregados por riesgo y contenido.' },
      { section: 'audit', icon: 'bi-clipboard-data', title: 'Auditoría', copy: 'Revisar trazabilidad técnica y actividad autorizada.' },
      { section: 'trends', icon: 'bi-graph-up', title: 'Tendencias', copy: 'Analizar evolución por periodo y tipo de contenido.' },
    ],
  },
};

const RolePortal = ({
  user,
  onLogout,
}) => {
  const portal = PORTAL_CONFIG[user.role];
  const [activeSection, setActiveSection] = useState(portal.defaultSection);

  const openSection = (section) => {
    setActiveSection(section);
    window.setTimeout(() => {
      document
        .getElementById(`portal-${section}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

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
          <Button variant="outline-secondary" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="row g-4">
        {portal.cards.map(({ section, icon, title, copy }) => (
          <div className="col-12 col-md-6" key={section}>
            <button
              className={`card border-0 shadow-sm h-100 w-100 text-start portal-card-button ${activeSection === section ? 'active' : ''}`}
              type="button"
              onClick={() => openSection(section)}
              aria-pressed={activeSection === section}
              aria-controls={`portal-${section}`}
            >
              <span className="card-body p-4 d-block">
                <i className={`bi ${icon} fs-2`}></i>
                <span className="h5 mt-3 d-block">{title}</span>
                <span className="text-secondary d-block">{copy}</span>
                <span className="portal-card-action mt-3">
                  Abrir sección <i className="bi bi-arrow-right ms-1"></i>
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="portal-section mt-5" id={`portal-${activeSection}`} tabIndex="-1">
        {activeSection === 'users' && user.role === 'administrador' && (
          <AdminManagement currentUser={user} />
        )}

        {activeSection === 'reporting' && (
          <FraudTrendsDashboard mode="reporting" />
        )}

        {activeSection === 'audit' && (
          <AuditTrailPanel />
        )}

        {activeSection === 'trends' && (
          <FraudTrendsDashboard mode="trends" />
        )}
      </div>
    </main>
  );
};

export default RolePortal;
