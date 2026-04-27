const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log('Adding reset_token column...');
    await pool.query('ALTER TABLE connector ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)');
    
    console.log('Adding reset_token_expiry column...');
    await pool.query('ALTER TABLE connector ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP');
    
    console.log('Adding profile_picture column...');
    await pool.query('ALTER TABLE connector ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)');
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
