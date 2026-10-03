const pool = require('../config/db');
const v = require('../utils/validators');

// Submit OR modify: one rating per (user, store) thanks to UNIQUE + upsert
exports.submitRating = async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;
    const errors = v.collect({ rating: v.validateRating(rating) });
    if (errors) return res.status(400).json({ message: 'Validation failed', errors });

    const store = await pool.query('SELECT 1 FROM stores WHERE id = $1', [storeId]);
    if (!store.rowCount) return res.status(404).json({ message: 'Store not found' });

    const { rows } = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
       RETURNING id, store_id, rating`,
      [req.user.id, storeId, rating]
    );
    res.json({ rating: rows[0] });
  } catch (err) {
    next(err);
  }
};
