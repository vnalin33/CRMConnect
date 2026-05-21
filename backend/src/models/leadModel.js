const db = require('../config/db');

const create = async (leadData) => {
  const {
    firstname,
    lastname,
    email,
    mobilenumber,
    loantype,
    loanamount,
    annualincome,
    employmenttype,
    company_type,
    sector_type,
    cibilscore,
    profession,
    existingloans,
    notes,
    servicetype,
    processingtype,
    connectorid,
    organizationid = 1002,  
    locationid = 5005,      
    contacttype = 'Connector Contact',  
    status = 1               
  } = leadData;

  const query = `
    INSERT INTO leadpersonaldetails (
      firstname, lastname, email, mobilenumber, loantype, loanamount, 
      annualincome, employmenttype, company_type, sector_type, cibilscore, profession, existingloans, notes, servicetype, processingtype,
      connectorid, status, organizationid, locationid, contacttype, createdon
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW())
    RETURNING id, firstname, lastname, email, mobilenumber, status, organizationid, createdon
  `;

  const values = [
    firstname, lastname, email, mobilenumber, loantype, loanamount,
    annualincome, employmenttype, company_type, sector_type, cibilscore, profession, existingloans, notes, servicetype, processingtype,
    connectorid, status, organizationid, locationid, contacttype
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

const getUnassignedContacts = async (orgid) => {
  // Uses the existing stored plpgsql function
  const query = 'SELECT * FROM getunassignedcontactlist($1)';
  const { rows } = await db.query(query, [orgid]);
  return rows;
};

const deleteLead = async (leadId) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete from leadtrackhistorydetails
    await client.query('DELETE FROM leadtrackhistorydetails WHERE leadid = $1', [leadId]);

    // 2. Delete from leadtrackdetails
    await client.query('DELETE FROM leadtrackdetails WHERE leadid = $1', [leadId]);

    // 3. Delete from leadpersonaldetails
    const { rowCount } = await client.query('DELETE FROM leadpersonaldetails WHERE id = $1', [leadId]);

    await client.query('COMMIT');
    return rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('deleteLead transaction failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

const findByMobile = async (mobilenumber) => {
  const query = 'SELECT id, firstname, lastname FROM leadpersonaldetails WHERE mobilenumber = $1 LIMIT 1';
  const { rows } = await db.query(query, [mobilenumber]);
  return rows[0] || null;
};

module.exports = {
  create,
  getUnassignedContacts,
  deleteLead,
  findByMobile,
};
