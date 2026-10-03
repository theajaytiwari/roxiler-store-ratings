const pool = require('../config/db');
const v = require('../utils/validators');

// Normal user: all stores + overall rating + this user's own rating
// Search: name, address | Sort: name, address, rating
exports.listStores = async (req, res, next) => {
  try {
    const { name, address, sortBy, order } = req.query;
    // $1 is always user_id — filter params start from $2
    const params = [req.user.id];
    const where = [];
    if (name) {
      params.push(`%${name}%`);
      where.push(`s.name ILIKE $${params.length}`);
    }
    if (address) {
      params.push(`%${address}%`);
      where.push(`s.address ILIKE $${params.length}`);
    }

    const orderBy = v.buildOrder(
      sortBy,
      order,
      { name: 's.name', address: 's.address', rating: 'overall_rating' },
      'name'
    );

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS overall_rating,
              (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) AS my_rating
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
