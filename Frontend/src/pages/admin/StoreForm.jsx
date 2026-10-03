import { useEffect, useState } from 'react';
import api, { getErrorMessage, getFieldErrors } from '../../api/client';
import { validateForm, validateName, validateEmail, validateAddress } from '../../utils/validators';
import FormField from '../../components/FormField';

const rules = { name: validateName, email: validateEmail, address: validateAddress };

export default function StoreForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  // Owners dropdown: users with OWNER role
  useEffect(() => {
    api
      .get('/admin/users', { params: { role: 'OWNER' } })
      .then((res) => setOwners(res.data.users))
      .catch(() => {});
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const found = validateForm(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId ? Number(form.ownerId) : undefined });
      onCreated();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form-card" onSubmit={onSubmit} noValidate>
      <h3>Add a new store</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <FormField label="Store name" name="name" value={form.name} onChange={onChange} error={errors.name} hint="3 to 60 characters" />
      <FormField label="Store email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <FormField label="Address" name="address" as="textarea" rows={3} value={form.address} onChange={onChange} error={errors.address} />
      <FormField label="Store owner (optional)" name="ownerId" as="select" value={form.ownerId} onChange={onChange} hint="Create the owner first under Add user, with role Store owner">
        <option value="">No owner assigned</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} ({o.email})
          </option>
        ))}
      </FormField>
      <button className="btn btn-primary">Create store</button>
    </form>
  );
}
