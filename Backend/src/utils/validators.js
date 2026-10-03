const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

// Each validator returns an error string or null

const validateName = (v) =>
  typeof v === 'string' && v.trim().length >= 20 && v.trim().length <= 60
    ? null
    : 'Name must be between 20 and 60 characters';

const validateAddress = (v) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= 400
    ? null
    : 'Address is required and must be at most 400 characters';

const validateEmail = (v) =>
  typeof v === 'string' && EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email address';

const validatePassword = (v) =>
  typeof v === 'string' && PASSWORD_RE.test(v)
    ? null
    : 'Password must be 8-16 characters with at least one uppercase letter and one special character';

const validateRating = (v) =>
  Number.isInteger(v) && v >= 1 && v <= 5 ? null : 'Rating must be an integer between 1 and 5';

// Collects errors for the fields given, e.g. collect({ name: validateName(...) })
const collect = (checks) => {
  const errors = {};
  Object.entries(checks).forEach(([field, err]) => {
    if (err) errors[field] = err;
  });
  return Object.keys(errors).length ? errors : null;
};

// Safe ORDER BY builder (whitelist => no SQL injection)
const buildOrder = (sortBy, order, allowed, fallback) => {
  const column = allowed[sortBy] || allowed[fallback];
  const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${column} ${dir}`;
};

const validateRole = (v) =>
  ['ADMIN', 'USER', 'OWNER'].includes(v) ? null : 'Role must be ADMIN, USER or OWNER';

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRating,
  validateRole,
  collect,
  buildOrder,
};
