const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:8080@localhost:5432/ncrm' });

async function checkSchema() {
  try {
    console.log('--- Checking Column info ---');
    const cols = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('leadpersonaldetails', 'leadtrackdetails', 'leadtrackhistorydetails')
      ORDER BY table_name, ordinal_position;
    `);
    console.log(JSON.stringify(cols.rows, null, 2));

    console.log('\n--- Checking Constraints ---');
    const constraints = await pool.query(`
      SELECT 
        conname AS constraint_name, 
        pg_get_constraintdef(c.oid) AS constraint_definition
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid IN ('leadpersonaldetails'::regclass, 'leadtrackdetails'::regclass, 'leadtrackhistorydetails'::regclass);
    `);
    console.log(JSON.stringify(constraints.rows, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
