const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:8080@localhost:5432/ncrm'
});

async function check() {
  try {
    const { rows } = await pool.query(`
      SELECT pg_get_functiondef(p.oid) 
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public' AND p.proname = 'getassignedleadlist';
    `);

    if (rows.length === 0) {
      console.log('Function getassignedleadlist NOT FOUND');
    } else {
      console.log('DEFINITION:\n', rows[0].pg_get_functiondef);
    }

    const { rows: counts } = await pool.query('SELECT status, COUNT(*) FROM leadpersonaldetails GROUP BY status');
    console.log('\nStatus counts in leadpersonaldetails:', counts);

    const { rows: statuses } = await pool.query('SELECT * FROM statuscode ORDER BY id');
    console.log('\nStatus codes mapping:', statuses);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
