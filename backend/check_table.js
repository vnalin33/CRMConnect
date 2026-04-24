const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});

async function check() {
    try {
        // Get function signature
        const sig = await pool.query(
            "SELECT pg_get_functiondef(oid) AS definition FROM pg_proc WHERE proname = 'getunassignedcontactlist'"
        );
        console.log('Function definition:');
        console.log(sig.rows[0]?.definition || 'Not found');

        // Also check getassignedcontactlist
        const sig2 = await pool.query(
            "SELECT pg_get_functiondef(oid) AS definition FROM pg_proc WHERE proname = 'getassignedcontactlist'"
        );
        console.log('\n\ngetassignedcontactlist definition:');
        console.log(sig2.rows[0]?.definition || 'Not found');
    } catch (e) {
        console.error('Error:', e.message);
    }
    await pool.end();
    process.exit();
}
check();
