const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:8080@localhost:5432/ncrm' });

async function fix() {
  // Fix mobile-created leads: set org to 1002 and locationid to 5005
  const res = await pool.query(`
    UPDATE leadpersonaldetails 
    SET organizationid = 1002, locationid = 5005 
    WHERE connectorid = 1000 AND (organizationid != 1002 OR locationid NOT IN (SELECT id FROM locationmaster))
  `);
  console.log('Updated', res.rowCount, 'mobile leads -> org 1002, locationid 5005');

  // Verify
  const { rows } = await pool.query('SELECT id, firstname, organizationid, locationid FROM leadpersonaldetails WHERE connectorid = 1000 ORDER BY id DESC LIMIT 5');
  console.log('Verified:', JSON.stringify(rows, null, 2));

  await pool.end();
}
fix();
