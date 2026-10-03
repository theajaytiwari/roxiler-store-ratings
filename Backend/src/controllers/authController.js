const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const v = require('../utils/validators');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// Public signup => always a NORMAL USER
exports.signup = async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const errors = v.collect({
      name: v.validateName(name),
      email: v.validateEmail(email),
      address: v.validateAddress(address),
      password: v.validatePassword(password),
    });
    if (errors) return res.status(400).json({ message: 'Validation failed', errors });

    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'USER') RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), hash, address.trim()]
    );
    res.status(201).json({ user: rows[0], token: signToken(rows[0]) });
  } catch (err) {
    next(err);
  }
};

// Single login for all roles
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// All logged-in roles can change their own password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const errors = v.collect({ newPassword: v.validatePassword(newPassword) });
    if (errors) return res.status(400).json({ message: 'Validation failed', errors });

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(currentPassword || '', rows[0].password_hash))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};
