import { useEffect, useMemo, useState } from 'react';
import {
  fetchAdminUsers,
  updateAdminUser,
} from '../../services/api.js';
import AdminFilters from '../AdminFilters/AdminFilters.jsx';
import AdminForm from '../AdminForm/AdminForm.jsx';
import AdminModal from '../AdminModal/AdminModal.jsx';
import AdminResourceTable from '../AdminResourceTable/AdminResourceTable.jsx';

const EMPTY_FILTERS = { search: '', role: '', active: '' };

const ROLE_OPTIONS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'usuario', label: 'Usuario' },
];

const UsersAdminPanel = ({ currentUser }) => {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ role: 'usuario', active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetchAdminUsers(nextFilters);
      setUsers(Array.isArray(response?.users) ? response.users : []);
    } catch (requestError) {
      setUsers([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(filters);
  }, [filters]);

  const filterFields = useMemo(() => [
    {
      name: 'search',
      label: 'Buscar',
      type: 'search',
      placeholder: 'Nombre, correo o celular',
      columnClass: 'col-12 col-lg-5',
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        ...ROLE_OPTIONS,
      ],
      columnClass: 'col-12 col-md-4 col-lg-3',
    },
    {
      name: 'active',
      label: 'Estado',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' },
      ],
      columnClass: 'col-12 col-md-4 col-lg-2',
    },
  ], []);

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Usuario',
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          <small className="d-block text-secondary">{row.email}</small>
        </div>
      ),
    },
    { key: 'phone', label: 'Celular' },
    { key: 'province', label: 'Provincia' },
    {
      key: 'role',
      label: 'Rol',
      render: (value) => (
        <span className="badge text-bg-light border text-capitalize">{value}</span>
      ),
    },
    {
      key: 'active',
      label: 'Estado',
      render: (value) => (
        <span className={`badge ${value ? 'text-bg-success' : 'text-bg-secondary'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_value, row) => (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => openEdit(row)}
          type="button"
        >
          Editar
        </button>
      ),
    },
  ], []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({ ...draftFilters });
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      role: user.role,
      active: Boolean(user.active),
    });
    setError('');
    setMessage('');
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await updateAdminUser(editing.id, form);
      setMessage(response.message);
      setEditing(null);
      await loadUsers(filters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const userFormFields = [
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      options: ROLE_OPTIONS,
      required: true,
      disabled: editing?.id === currentUser?.id,
    },
    {
      name: 'active',
      label: 'Cuenta activa',
      type: 'checkbox',
      disabled: editing?.id === currentUser?.id,
    },
  ];

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
        <div>
          <h3 className="h5 mb-1">Usuarios</h3>
          <p className="text-secondary mb-0">
            Consulta, filtra y administra rol y estado sin borrado físico.
          </p>
        </div>
        <span className="badge rounded-pill text-bg-primary align-self-start">
          {loading ? 'Consultando…' : `${users.length} usuarios`}
        </span>
      </div>

      <AdminFilters
        disabled={loading}
        fields={filterFields}
        onChange={handleFilterChange}
        onClear={clearFilters}
        onSubmit={applyFilters}
        values={draftFilters}
      />

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border" aria-label="Cargando usuarios" />
        </div>
      ) : (
        <AdminResourceTable
          columns={columns}
          rows={users}
          emptyMessage="No hay usuarios que coincidan con los filtros."
        />
      )}

      <AdminModal
        open={Boolean(editing)}
        title={`Editar usuario · ${editing?.name || ''}`}
        onClose={() => setEditing(null)}
      >
        <AdminForm
          disabled={saving}
          fields={userFormFields}
          onCancel={() => setEditing(null)}
          onChange={handleFormChange}
          onSubmit={saveUser}
          submitLabel="Guardar usuario"
          values={form}
        />
      </AdminModal>
    </section>
  );
};

export default UsersAdminPanel;
