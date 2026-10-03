import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, homePath } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import FormField from '../components/FormField';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homePath(user.role)} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      navigate(homePath(u.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h2>Welcome back</h2>
        <p className="muted">Log in to rate stores or manage the platform.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
        />
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="muted center">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
