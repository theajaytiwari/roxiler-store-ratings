import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import useSort from '../../hooks/useSort';
import SortableTable from '../../components/SortableTable';

export default function StoresTab() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const debounced = useDebounce(filters);
  const { sortBy, order, onSort } = useSort('name');
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/stores', { params: { ...debounced, sortBy, order } })
      .then((res) => setStores(res.data.stores))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [debounced, sortBy, order]);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (s) => (Number(s.rating) ? `★ ${Number(s.rating).toFixed(1)}` : 'No ratings'),
    },
  ];

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={set('name')} />
        <input placeholder="Filter by email" value={filters.email} onChange={set('email')} />
        <input placeholder="Filter by address" value={filters.address} onChange={set('address')} />
      </div>
      {loading ? (
        <p className="muted">Loading stores...</p>
      ) : (
        <SortableTable columns={columns} rows={stores} sortBy={sortBy} order={order} onSort={onSort} />
      )}
    </>
  );
}
