const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:8080@localhost:5432/ncrm' });

async function fix() {
  // Check LocationMaster entries
  const { rows: locations } = await pool.query('SELECT * FROM locationmaster ORDER BY id LIMIT 10');
  console.log('LocationMaster entries:', JSON.stringify(locations, null, 2));

  // Check which org the admin is using (from screenshot, KAVAS has org 1002)
  const { rows: kavas } = await pool.query("SELECT id, firstname, organizationid, locationid FROM leadpersonaldetails WHERE firstname = 'KAVAS'");
  console.log('\nKAVAS lead:', JSON.stringify(kavas, null, 2));

  // Check mobile-created leads
  const { rows: mobile } = await pool.query("SELECT id, firstname, organizationid, locationid FROM leadpersonaldetails WHERE connectorid = 1000 ORDER BY id DESC LIMIT 5");
  console.log('\nMobile-created leads (connectorid=1000):', JSON.stringify(mobile, null, 2));

  // Test getunassignedcontactlist for org 1002
  const { rows: unassigned1002 } = await pool.query('SELECT id, firstname FROM getunassignedcontactlist($1) LIMIT 5', [1002]);
  console.log('\nUnassigned contacts for org 1002:', JSON.stringify(unassigned1002, null, 2));

  await pool.end();
}
fix();
