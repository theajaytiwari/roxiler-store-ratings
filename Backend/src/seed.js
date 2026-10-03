// Creates demo accounts + a demo store. Run once after schema.sql: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

(async () => {
  try {
    const pw = await bcrypt.hash('Admin@123', 10);
    const ins = (name, email, address, role) =>
      pool.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [name, email, pw, address, role]
      );

    await ins('System Administrator Account', 'admin@example.com', 'Pune, Maharashtra, India', 'ADMIN');
    await ins('Normal Demo User Account One', 'user@example.com', 'Bhopal, Madhya Pradesh, India', 'USER');
    const owner = await ins('Demo Store Owner Account One', 'owner@example.com', 'Pune, Maharashtra, India', 'OWNER');

    await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ('Sunrise General Store Pune Branch', 'sunrise@example.com', 'FC Road, Pune', $1)
       ON CONFLICT (email) DO NOTHING`,
      [owner.rows[0].id]
    );
    console.log('Seeded. Password for all demo accounts: Admin@123');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
