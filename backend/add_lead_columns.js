const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});

async function migrate() {
    console.log('Starting DB migration for leadpersonaldetails...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Add columns if they do not exist
        await client.query(`
            ALTER TABLE leadpersonaldetails 
            ADD COLUMN IF NOT EXISTS loantype VARCHAR(100),
            ADD COLUMN IF NOT EXISTS loanamount VARCHAR(50),
            ADD COLUMN IF NOT EXISTS annualincome VARCHAR(50),
            ADD COLUMN IF NOT EXISTS employmenttype VARCHAR(100),
            ADD COLUMN IF NOT EXISTS notes TEXT
        `);
        
        await client.query('COMMIT');
        console.log('Migration successful: Added 5 columns to leadpersonaldetails.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e.message);
    } finally {
        client.release();
        await pool.end();
        process.exit();
    }
}

migrate();
