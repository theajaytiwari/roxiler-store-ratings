const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export const validateName = (v) =>
  typeof v === 'string' && v.trim().length >= 20 && v.trim().length <= 60
    ? ''
    : 'Name must be between 20 and 60 characters';

export const validateEmail = (v) => (EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address');

export const validateAddress = (v) =>
  v.trim().length > 0 && v.length <= 400 ? '' : 'Address is required (max 400 characters)';

export const validatePassword = (v) =>
  PASSWORD_RE.test(v)
    ? ''
    : 'Password must be 8-16 characters with at least one uppercase letter and one special character';

// Runs validators over a form and returns { field: message } for failures only
export const validateForm = (values, rules) => {
  const errors = {};
  Object.keys(rules).forEach((field) => {
    const msg = rules[field](values[field] ?? '');
    if (msg) errors[field] = msg;
  });
  return errors;
};

export const validateRole = (v) =>
  ['ADMIN', 'USER', 'OWNER'].includes(v) ? '' : 'Role must be ADMIN, USER or OWNER';
