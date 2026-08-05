/**
 * Admin Lead Model - Database operations for leads/contacts
 * Ported from Oneassist-CRMConnect backend
 */
const db = require('../config/db');

const AdminLeadModel = {
  async findAll(filters = {}, page = 1, limit = 20) {
    let whereClause = '1=1';
    const params = [];
    let counter = 1;

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'Converted') {
        whereClause += ` AND l.status IN (17, 18, 20)`;
      } else if (filters.status === 'Rejected') {
        whereClause += ` AND l.status IN (5, 7, 9, 14, 16, 21, 23)`;
      } else if (filters.status === 'Pending') {
        whereClause += ` AND l.status IN (6, 8, 12, 13, 15, 19)`;
      } else if (filters.status === 'Active') {
        whereClause += ` AND l.status NOT IN (5, 7, 9, 14, 16, 17, 18, 20, 21, 23)`;
      } else {
        whereClause += ` AND l.status = $${counter}`;
        params.push(filters.status);
        counter++;
      }
    }

    if (filters.loantype && filters.loantype !== 'all') {
      whereClause += ` AND l.loantype = $${counter}`;
      params.push(filters.loantype);
      counter++;
    }

    if (filters.assigned_to) {
      whereClause += ` AND l.connectorid = $${counter}`;
      params.push(filters.assigned_to);
      counter++;
    }

    if (filters.search) {
      whereClause += ` AND (l.firstname ILIKE $${counter} OR l.lastname ILIKE $${counter} OR l.email ILIKE $${counter} OR l.mobilenumber ILIKE $${counter})`;
      params.push(`%${filters.search}%`);
      counter++;
    }

    const offset = (page - 1) * limit;
    const limitIdx = counter++;
    const offsetIdx = counter++;
    
    let result;
    try {
      result = await db.query(
        `SELECT l.*, 
                (COALESCE(l.firstname, '') || ' ' || COALESCE(l.lastname, '')) as full_name, 
                c.name as connector_name 
         FROM leadpersonaldetails l
         LEFT JOIN connector c ON l.connectorid = c.id
         WHERE ${whereClause} 
         ORDER BY l.createdon DESC NULLS LAST
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        [...params, limit, offset]
      );
    } catch (err) {
      console.error('AdminLeadModel.findAll JOIN failed, using fallback:', err.message);
      result = await db.query(
        `SELECT *, 
                (COALESCE(firstname, '') || ' ' || COALESCE(lastname, '')) as full_name,
                '' as connector_name
         FROM leadpersonaldetails
         WHERE ${whereClause.replace(/l\./g, '')}
         ORDER BY createdon DESC NULLS LAST
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        [...params, limit, offset]
      );
    }

    const totalResult = await db.query(
      `SELECT COUNT(*) as total FROM leadpersonaldetails l WHERE ${whereClause}`,
      params
    );

    return { 
      leads: result.rows, 
      total: parseInt(totalResult.rows[0]?.total || 0) 
    };
  },

  async findById(id) {
    try {
      const result = await db.query(
        `SELECT l.*, 
                (COALESCE(l.firstname, '') || ' ' || COALESCE(l.lastname, '')) as full_name, 
                c.name as connector_name 
         FROM leadpersonaldetails l
         LEFT JOIN connector c ON l.connectorid = c.id
         WHERE l.id = $1 LIMIT 1`, 
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error('AdminLeadModel.findById JOIN failed, using fallback:', err.message);
      const result = await db.query(
        `SELECT *, 
                (COALESCE(firstname, '') || ' ' || COALESCE(lastname, '')) as full_name,
                '' as connector_name
         FROM leadpersonaldetails
         WHERE id = $1 LIMIT 1`,
        [id]
      );
      return result.rows[0] || null;
    }
  },

  async create(leadData) {
    const result = await db.query(
      `INSERT INTO leadpersonaldetails (
        firstname, lastname, email, mobilenumber, loantype, loanamount, connectorid, status,
        notes, contacttype, createdon
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
      [
        leadData.firstname,
        leadData.lastname,
        leadData.email || null,
        leadData.mobilenumber,
        leadData.loantype || null,
        leadData.loanamount || 0,
        leadData.connectorid,
        leadData.status || 'pending',
        leadData.notes || null,
        'Connector Contact'
      ]
    );
    return { id: result.rows[0].id, ...leadData };
  },

  async createOccupation(leadId, occupationData) {
    if (!occupationData || !occupationData.occupationtype) return null;

    const result = await db.query(
      `INSERT INTO leadoccupationdetails (
        leadpersonal, occupationtype, incomeamount, otherincomeamount,
        compname, compcat, designation, totalexperience, currentexperience,
        salarybank, salarymode, companyaddress,
        businessname, businesstype, annualturnover, businessvintage,
        officetelephonenumber, companygstinnumber
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id`,
      [
        leadId,
        occupationData.occupationtype,
        occupationData.incomeamount || 0,
        occupationData.otherincomeamount || 0,
        occupationData.compname || null,
        occupationData.compcat || null,
        occupationData.designation || null,
        occupationData.totalexperience || null,
        occupationData.currentexperience || null,
        occupationData.salarybank || null,
        occupationData.salarymode || null,
        occupationData.companyaddress || null,
        occupationData.businessname || null,
        occupationData.businesstype || null,
        occupationData.annualturnover || null,
        occupationData.businessvintage || null,
        occupationData.officetelephonenumber || null,
        occupationData.companygstinnumber || null
      ]
    );
    return result.rows[0];
  },

  async update(id, updateData) {
    const fields = [];
    const values = [];
    let counter = 1;

    const allowedFields = [
      'firstname', 'lastname', 'email', 'mobilenumber', 'loantype',
      'loanamount', 'status', 'notes', 'connectorid', 'remarks',
      'contacttype', 'servicetype', 'processingtype', 'whatsappnumber',
      'pannumber', 'aadharnumber', 'presentaddress', 'pincode',
      'permanentaddress', 'gender', 'materialstatus', 'dateofbirth',
      'noofdependent', 'educationalqualification', 'referencename',
      'annualincome', 'employmenttype', 'cibilscore', 'profession',
      'existingloans', 'company_type', 'sector_type'
    ];

    if (updateData.name && !updateData.firstname) {
      updateData.firstname = updateData.name;
    }
    if (updateData.phone && !updateData.mobilenumber) {
      updateData.mobilenumber = updateData.phone;
    }

    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${counter}`);
        values.push(value);
        counter++;
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE leadpersonaldetails SET ${fields.join(', ')} WHERE id = $${counter} RETURNING id`;
    const result = await db.query(query, values);
    return result.rowCount > 0;
  },

  async delete(id) {
    const result = await db.query('DELETE FROM leadpersonaldetails WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  },
};

module.exports = AdminLeadModel;
