import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/client';
import Layout from '../../components/Layout';
import UsersTab from './UsersTab';
import StoresTab from './StoresTab';
import UserForm from './UserForm';
import StoreForm from './StoreForm';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'stores', label: 'Stores' },
  { id: 'addUser', label: 'Add user' },
  { id: 'addStore', label: 'Add store' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  const onCreated = (nextTab) => {
    setRefreshKey((k) => k + 1);
    setTab(nextTab);
  };

  return (
    <Layout title="Admin dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="stat-grid">
        <div className="card stat">
          <span className="stat-label">Total users</span>
          <strong className="stat-value">{statsLoading ? '…' : (stats ? stats.totalUsers : '-')}</strong>
        </div>
        <div className="card stat">
          <span className="stat-label">Total stores</span>
          <strong className="stat-value">{statsLoading ? '…' : (stats ? stats.totalStores : '-')}</strong>
        </div>
        <div className="card stat">
          <span className="stat-label">Total ratings</span>
          <strong className="stat-value">{statsLoading ? '…' : (stats ? stats.totalRatings : '-')}</strong>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab key={refreshKey} />}
      {tab === 'stores' && <StoresTab key={refreshKey} />}
      {tab === 'addUser' && <UserForm onCreated={() => onCreated('users')} />}
      {tab === 'addStore' && <StoreForm onCreated={() => onCreated('stores')} />}
    </Layout>
  );
}
