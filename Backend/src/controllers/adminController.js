const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const v = require('../utils/validators');

exports.dashboard = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)   AS total_users,
        (SELECT COUNT(*) FROM stores)  AS total_stores,
        (SELECT COUNT(*) FROM ratings) AS total_ratings`);
    const r = rows[0];
    res.json({
      totalUsers: Number(r.total_users),
      totalStores: Number(r.total_stores),
      totalRatings: Number(r.total_ratings),
    });
  } catch (err) {
    next(err);
  }
};

// Admin can create ADMIN / USER / OWNER accounts
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;
    const errors = v.collect({
      name: v.validateName(name),
      email: v.validateEmail(email),
      address: v.validateAddress(address),
      password: v.validatePassword(password),
      role: v.validateRole(role),
    });
    if (errors) return res.status(400).json({ message: 'Validation failed', errors });

    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), hash, address.trim(), role]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Admin creates a store; optionally assigns an existing OWNER user via ownerId
exports.createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const errors = v.collect({
      name: v.validateName(name),
      email: v.validateEmail(email),
      address: v.validateAddress(address),
    });
    if (errors) return res.status(400).json({ message: 'Validation failed', errors });

    if (ownerId) {
      const owner = await pool.query("SELECT 1 FROM users WHERE id = $1 AND role = 'OWNER'", [ownerId]);
      if (!owner.rowCount) return res.status(400).json({ message: 'ownerId must belong to a user with OWNER role' });
      const taken = await pool.query('SELECT 1 FROM stores WHERE owner_id = $1', [ownerId]);
      if (taken.rowCount) return res.status(409).json({ message: 'This owner already has a store' });
    }

    const exists = await pool.query('SELECT 1 FROM stores WHERE email = $1', [email.trim().toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ message: 'Store email already exists' });

    const { rows } = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id`,
      [name.trim(), email.trim().toLowerCase(), address.trim(), ownerId || null]
    );
    res.status(201).json({ store: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Filters: name, email, address, role | Sort: sortBy, order
exports.listUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;
    const where = [];
    const params = [];
    const add = (clause, value) => {
      params.push(value);
      where.push(clause.replace('?', `$${params.length}`));
    };
    if (name) add('u.name ILIKE ?', `%${name}%`);
    if (email) add('u.email ILIKE ?', `%${email}%`);
    if (address) add('u.address ILIKE ?', `%${address}%`);
    if (role) add('u.role = ?', role);

    const orderBy = v.buildOrder(
      sortBy,
      order,
      { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' },
      'name'
    );

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
              CASE WHEN u.role = 'OWNER' THEN (
                SELECT ROUND(AVG(r.rating), 1) FROM ratings r
                JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id
              ) END AS rating
       FROM users u
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ${orderBy}`,
      params
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
              CASE WHEN u.role = 'OWNER' THEN (
                SELECT ROUND(AVG(r.rating), 1) FROM ratings r
                JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id
              ) END AS rating
       FROM users u WHERE u.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Admin store listing: Name, Email, Address, Rating (+ filters + sorting)
exports.listStores = async (req, res, next) => {
  try {
    const { name, email, address, sortBy, order } = req.query;
    const where = [];
    const params = [];
    const add = (clause, value) => {
      params.push(value);
      where.push(clause.replace('?', `$${params.length}`));
    };
    if (name) add('s.name ILIKE ?', `%${name}%`);
    if (email) add('s.email ILIKE ?', `%${email}%`);
    if (address) add('s.address ILIKE ?', `%${address}%`);

    const orderBy = v.buildOrder(
      sortBy,
      order,
      { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' },
      'name'
    );

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating
       FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       GROUP BY s.id
       ${orderBy}`,
      params
    );
    res.json({ stores: rows });
  } catch (err) {
    next(err);
  }
};
