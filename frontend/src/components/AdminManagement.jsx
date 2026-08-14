import UsersAdminPanel from './UsersAdminPanel.jsx';

const AdminManagement = ({ currentUser }) => {
  return (
    <section className="mt-5" aria-labelledby="admin-users-title">
      <div className="mb-4">
        <p className="section-kicker mb-2">Gestión administrativa</p>
        <h2 id="admin-users-title" className="h3 mb-2">Administración de usuarios</h2>
        <p className="text-secondary mb-0">
          Consulta cuentas, filtra por rol o estado y administra el acceso sin eliminar registros físicamente.
        </p>
      </div>

      <UsersAdminPanel currentUser={currentUser} />
    </section>
  );
};

export default AdminManagement;
