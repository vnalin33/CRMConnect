

const API_URL = 'http://localhost:5005/api'; 

async function testDeletion() {
 
  
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: 'postgres://postgres:8080@localhost:5432/ncrm' });
  const leadModel = require('./src/models/leadModel');

  try {
    // Find a lead created by a connector (e.g., organizationid 1002)
    const res = await pool.query('SELECT id, firstname FROM leadpersonaldetails WHERE organizationid = 1002 LIMIT 1');
    if (res.rows.length === 0) {
      console.log('No leads found for testing.');
      return;
    }

    const testLeadId = res.rows[0].id;
    console.log(`Testing deletion for lead ID: ${testLeadId} (${res.rows[0].firstname})`);

    // Verify records exist in related tables if any
    const trackRes = await pool.query('SELECT count(*) FROM leadtrackdetails WHERE leadid = $1', [testLeadId]);
    const histRes = await pool.query('SELECT count(*) FROM leadtrackhistorydetails WHERE leadid = $1', [testLeadId]);
    console.log(`Before deletion: Tracks=${trackRes.rows[0].count}, History=${histRes.rows[0].count}`);

    const success = await leadModel.deleteLead(testLeadId);
    console.log(`Deletion result: ${success}`);

    // Verify records are gone
    const leadAfter = await pool.query('SELECT count(*) FROM leadpersonaldetails WHERE id = $1', [testLeadId]);
    const trackAfter = await pool.query('SELECT count(*) FROM leadtrackdetails WHERE leadid = $1', [testLeadId]);
    const histAfter = await pool.query('SELECT count(*) FROM leadtrackhistorydetails WHERE leadid = $1', [testLeadId]);
    
    console.log(`After deletion: Leads=${leadAfter.rows[0].count}, Tracks=${trackAfter.rows[0].count}, History=${histAfter.rows[0].count}`);

    if (leadAfter.rows[0].count === '0' && trackAfter.rows[0].count === '0' && histAfter.rows[0].count === '0') {
      console.log('SUCCESS: All records deleted correctly.');
    } else {
      console.log('FAILURE: Some records still exist.');
    }

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await pool.end();
  }
}

testDeletion();
