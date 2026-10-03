import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import useSort from '../../hooks/useSort';
import SortableTable from '../../components/SortableTable';

const ROLE_LABEL = { ADMIN: 'Admin', USER: 'Normal user', OWNER: 'Store owner' };

export default function UsersTab() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const debounced = useDebounce(filters);
  const { sortBy, order, onSort } = useSort('name');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/users', { params: { ...debounced, sortBy, order } })
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [debounced, sortBy, order]);

  const openDetails = async (row) => {
    try {
      const { data } = await api.get(`/admin/users/${row.id}`);
      setSelected(data.user);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (u) => ROLE_LABEL[u.role] },
  ];

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={set('name')} />
        <input placeholder="Filter by email" value={filters.email} onChange={set('email')} />
        <input placeholder="Filter by address" value={filters.address} onChange={set('address')} />
        <select value={filters.role} onChange={set('role')}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal user</option>
          <option value="OWNER">Store owner</option>
        </select>
      </div>

      {selected && (
        <div className="card details">
          <div className="details-head">
            <h3>User details</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <dl>
            <dt>Name</dt>
            <dd>{selected.name}</dd>
            <dt>Email</dt>
            <dd>{selected.email}</dd>
            <dt>Address</dt>
            <dd>{selected.address}</dd>
            <dt>Role</dt>
            <dd>{ROLE_LABEL[selected.role]}</dd>
            {selected.role === 'OWNER' && (
              <>
                <dt>Store rating</dt>
                <dd>{selected.rating ? `★ ${Number(selected.rating).toFixed(1)}` : 'No ratings yet'}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      <p className="muted small">Click a row to view full details.</p>
      {loading ? (
        <p className="muted">Loading users...</p>
      ) : (
        <SortableTable
          columns={columns}
          rows={users}
          sortBy={sortBy}
          order={order}
          onSort={onSort}
          onRowClick={openDetails}
        />
      )}
    </>
  );
}
