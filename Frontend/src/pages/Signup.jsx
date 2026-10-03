import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, homePath } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../api/client';
import {
  validateForm,
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../utils/validators';
import FormField from '../components/FormField';

const rules = {
  name: validateName,
  email: validateEmail,
  address: validateAddress,
  password: validatePassword,
};

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homePath(user.role)} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const found = validateForm(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const u = await signup(form);
      navigate(homePath(u.role), { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h2>Create your account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <FormField
          label="Full name"
          name="name"
          value={form.name}
          onChange={onChange}
          error={errors.name}
          hint="3 to 60 characters"
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          error={errors.email}
        />
        <FormField
          label="Address"
          name="address"
          as="textarea"
          rows={3}
          value={form.address}
          onChange={onChange}
          error={errors.address}
          hint="Max 400 characters"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
          hint="8-16 characters, one uppercase letter and one special character"
        />
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <p className="muted center">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
