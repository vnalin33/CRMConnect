const path = require('path');
const { Pool } = require('pg');

// Ensure .env is loaded from the backend root regardless of cwd
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Build pool config: validate DATABASE_URL first, fall back to individual vars
let poolConfig;

if (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'))) {
  try {
    new URL(process.env.DATABASE_URL);
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  } catch (err) {
    console.warn('⚠️ DATABASE_URL is invalid, falling back to individual DB parameters:', err.message);
  }
}

if (!poolConfig) {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'ncrm',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('PostgreSQL database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Quick connection test — call once at startup to fail fast.
 */
async function testConnection() {
  try {
    const res = await pool.query('SELECT current_database() AS db, NOW() AS server_time');
    const { db, server_time } = res.rows[0];
    console.log(`Connected to database "${db}" at ${server_time}`);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
