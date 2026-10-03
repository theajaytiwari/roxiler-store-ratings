import { useState } from 'react';
import api, { getErrorMessage, getFieldErrors } from '../../api/client';
import {
  validateForm,
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../../utils/validators';
import FormField from '../../components/FormField';

const rules = {
  name: validateName,
  email: validateEmail,
  address: validateAddress,
  password: validatePassword,
};

export default function UserForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const found = validateForm(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api.post('/admin/users', form);
      onCreated();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form-card" onSubmit={onSubmit} noValidate>
      <h3>Add a new user</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <FormField label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} hint="3 to 60 characters" />
      <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <FormField label="Address" name="address" as="textarea" rows={3} value={form.address} onChange={onChange} error={errors.address} />
      <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} hint="8-16 characters, one uppercase letter and one special character" />
      <FormField label="Role" name="role" as="select" value={form.role} onChange={onChange} error={errors.role}>
        <option value="USER">Normal user</option>
        <option value="OWNER">Store owner</option>
        <option value="ADMIN">Admin</option>
      </FormField>
      <button className="btn btn-primary">Create user</button>
    </form>
  );
}
