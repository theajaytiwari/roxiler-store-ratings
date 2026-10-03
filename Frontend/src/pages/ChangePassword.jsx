import { useState } from 'react';
import api, { getErrorMessage, getFieldErrors } from '../api/client';
import { validatePassword } from '../utils/validators';
import Layout from '../components/Layout';
import FormField from '../components/FormField';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const found = {};
    if (!form.currentPassword) found.currentPassword = 'Current password is required';
    const pwErr = validatePassword(form.newPassword);
    if (pwErr) found.newPassword = pwErr;
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      await api.put('/auth/password', form);
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setMsg({ type: 'error', text: getErrorMessage(err) });
    }
  };

  return (
    <Layout title="Change password">
      <form className="card form-card" onSubmit={onSubmit} noValidate>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        <FormField
          label="Current password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={onChange}
          error={errors.currentPassword}
        />
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={onChange}
          error={errors.newPassword}
          hint="8-16 characters, one uppercase letter and one special character"
        />
        <button className="btn btn-primary">Update password</button>
      </form>
    </Layout>
  );
}
