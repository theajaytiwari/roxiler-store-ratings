import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import useSort from '../hooks/useSort';
import Layout from '../components/Layout';
import SortableTable from '../components/SortableTable';
import RatingStars from '../components/RatingStars';

export default function OwnerDashboard() {
  const { sortBy, order, onSort } = useSort('date', 'desc');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/owner/dashboard', { params: { sortBy, order } })
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [sortBy, order]);

  const columns = [
    { key: 'name', label: 'User', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (r) => <RatingStars value={r.rating} readOnly />,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (r) => new Date(r.updated_at).toLocaleDateString(),
    },
  ];

  return (
    <Layout title="Store dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading dashboard...</p>
      ) : (
        data && (
          <>
            <div className="stat-grid">
              <div className="card stat">
                <span className="stat-label">Store</span>
                <strong className="stat-text">{data.store.name}</strong>
                <small className="muted">{data.store.address}</small>
              </div>
              <div className="card stat">
                <span className="stat-label">Average rating</span>
                <strong className="stat-value">
                  {Number(data.store.average_rating) ? `★ ${Number(data.store.average_rating).toFixed(1)}` : '-'}
                </strong>
              </div>
              <div className="card stat">
                <span className="stat-label">Total ratings</span>
                <strong className="stat-value">{data.store.total_ratings}</strong>
              </div>
            </div>
            <h2 className="section-title">Users who rated your store</h2>
            <SortableTable
              columns={columns}
              rows={data.raters}
              sortBy={sortBy}
              order={order}
              onSort={onSort}
              emptyText="No one has rated your store yet"
            />
          </>
        )
      )}
    </Layout>
  );
}
