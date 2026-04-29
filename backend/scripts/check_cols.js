const db = require('./src/config/db');

async function check() {
  try {
    const tracked = await db.query(`
      SELECT t.leadid, p.id as p_id 
      FROM leadtrackdetails t 
      LEFT JOIN leadpersonaldetails p ON t.leadid = p.id
      LIMIT 5
    `);
    console.log(tracked.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
