import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import useDebounce from '../hooks/useDebounce';
import useSort from '../hooks/useSort';
import Layout from '../components/Layout';
import SortableTable from '../components/SortableTable';
import RatingStars from '../components/RatingStars';

export default function UserStores() {
  const [filters, setFilters] = useState({ name: '', address: '' });
  const debounced = useDebounce(filters);
  const { sortBy, order, onSort } = useSort('name');
  const [stores, setStores] = useState([]);
  const [draft, setDraft] = useState({}); // storeId -> selected rating
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/stores', { params: { ...debounced, sortBy, order } });
      setStores(data.stores);
    } catch (err) {
      setMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [debounced, sortBy, order]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (store) => {
    const rating = draft[store.id];
    if (!rating) return;
    try {
      await api.put(`/stores/${store.id}/rating`, { rating });
      setMsg({
        type: 'success',
        text: `Your rating for "${store.name}" was ${store.my_rating ? 'updated' : 'submitted'}`,
      });
      setDraft((d) => ({ ...d, [store.id]: undefined }));
      load();
    } catch (err) {
      setMsg({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const columns = [
    { key: 'name', label: 'Store name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'rating',
      label: 'Overall rating',
      sortable: true,
      render: (s) => (Number(s.overall_rating) ? `★ ${Number(s.overall_rating).toFixed(1)}` : 'No ratings'),
    },
    {
      key: 'my_rating',
      label: 'Your rating',
      render: (s) => (s.my_rating ? `★ ${s.my_rating}` : 'Not rated'),
    },
    {
      key: 'action',
      label: 'Submit / modify rating',
      render: (s) => {
        const selected = draft[s.id] ?? s.my_rating ?? 0;
        const changed = draft[s.id] && draft[s.id] !== s.my_rating;
        return (
          <div className="rate-cell">
            <RatingStars value={selected} onChange={(n) => setDraft({ ...draft, [s.id]: n })} />
            <button className="btn btn-primary btn-sm" disabled={!changed} onClick={() => submit(s)}>
              {s.my_rating ? 'Modify' : 'Submit'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Layout title="Stores">
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="filters">
        <input
          placeholder="Search by store name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>
      {loading ? (
        <p className="muted">Loading stores...</p>
      ) : (
        <SortableTable columns={columns} rows={stores} sortBy={sortBy} order={order} onSort={onSort} />
      )}
    </Layout>
  );
}
