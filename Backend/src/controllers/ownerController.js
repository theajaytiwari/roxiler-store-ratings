const pool = require('../config/db');
const v = require('../utils/validators');

// Owner dashboard: their store's average rating + list of users who rated
exports.dashboard = async (req, res, next) => {
  try {
    const store = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
              COUNT(r.id) AS total_ratings
       FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1 GROUP BY s.id`,
      [req.user.id]
    );
    if (!store.rows[0]) return res.status(404).json({ message: 'No store is assigned to this owner' });

    const { sortBy, order } = req.query;
    const orderBy = v.buildOrder(
      sortBy,
      order,
      { name: 'u.name', email: 'u.email', rating: 'r.rating', date: 'r.updated_at' },
      'date'
    );

    const raters = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.updated_at
       FROM ratings r JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1 ${orderBy}`,
      [store.rows[0].id]
    );
    res.json({ store: store.rows[0], raters: raters.rows });
  } catch (err) {
    next(err);
  }
};
