require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaddrafts (
        id SERIAL PRIMARY KEY,
        connectorid INTEGER NOT NULL,
        draft_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('leaddrafts table created successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    pool.end();
  }
}

createTable();
