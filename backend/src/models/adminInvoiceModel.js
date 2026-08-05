/**
 * Admin Invoice Model - Database operations for invoice requests
 * Ported from Oneassist-CRMConnect backend
 */
const db = require('../config/db');

const AdminInvoiceModel = {
  /**
   * Get invoice requests with filters and pagination
   */
  async findAll(filters = {}, page = 1, limit = 20) {
    let whereClause = '1=1';
    const params = [];
    let counter = 1;

    if (filters.status && filters.status !== 'all') {
      whereClause += ` AND status = $${counter}`;
      params.push(filters.status);
      counter++;
    }

    if (filters.invoice_type && filters.invoice_type !== 'all') {
      whereClause += ` AND invoice_type = $${counter}`;
      params.push(filters.invoice_type);
      counter++;
    }

    if (filters.loan_type && filters.loan_type !== 'all') {
      whereClause += ` AND loan_type = $${counter}`;
      params.push(filters.loan_type);
      counter++;
    }

    if (filters.search) {
      whereClause += ` AND (contact_name ILIKE $${counter} OR mobile_number ILIKE $${counter} OR track_number ILIKE $${counter} OR connector_name ILIKE $${counter})`;
      params.push(`%${filters.search}%`);
      counter++;
    }

    const offset = (page - 1) * limit;
    const limitIdx = counter++;
    const offsetIdx = counter++;

    try {
      const query = `
        SELECT ir.*,
               COALESCE(ir.billing_to_name, c.name) as billing_to_name,
               COALESCE(ir.billing_to_address, COALESCE(c.address, c.location)) as billing_to_address,
               COALESCE(ir.billing_to_phone, c.mobilenumber) as billing_to_phone,
               COALESCE(ir.billing_to_email, c.emailid) as billing_to_email,
               COALESCE(ir.billing_to_pan, c.pan_number) as billing_to_pan,
               COALESCE(ir.billing_to_gst, c.gst_number) as billing_to_gst
        FROM invoice_requests ir
        LEFT JOIN connector c ON ir.connectorid = c.id
        WHERE ${whereClause.replace(/status/g, 'ir.status').replace(/contact_name/g, 'ir.contact_name').replace(/mobile_number/g, 'ir.mobile_number').replace(/track_number/g, 'ir.track_number').replace(/connector_name/g, 'ir.connector_name').replace(/invoice_type/g, 'ir.invoice_type').replace(/loan_type/g, 'ir.loan_type')}
        ORDER BY ir.created_at DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;

      const result = await db.query(query, [...params, limit, offset]);
      const totalResult = await db.query(
        `SELECT COUNT(*) as total FROM invoice_requests WHERE ${whereClause}`,
        params
      );

      return {
        requests: result.rows,
        total: parseInt(totalResult.rows[0]?.total || 0)
      };
    } catch (joinError) {
      console.error('Invoice findAll JOIN failed, using fallback:', joinError.message);
      const fallbackQuery = `
        SELECT * FROM invoice_requests
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;
      const result = await db.query(fallbackQuery, [...params, limit, offset]);
      const totalResult = await db.query(
        `SELECT COUNT(*) as total FROM invoice_requests WHERE ${whereClause}`,
        params
      );
      return {
        requests: result.rows,
        total: parseInt(totalResult.rows[0]?.total || 0)
      };
    }
  },

  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'paid') as paid,
        SUM(total_amount) as total_value
      FROM invoice_requests
    `;
    const result = await db.query(query);
    return result.rows[0];
  },

  async updateStatus(id, status, remarks = '', expected_payout_date = null) {
    const query = `
      UPDATE invoice_requests
      SET status = $1, admin_remarks = $2, expected_payout_date = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await db.query(query, [status, remarks, expected_payout_date, id]);
    return result.rows[0];
  },

  async approve(id, expected_payout_date) {
    return this.updateStatus(id, 'approved', 'Approved by admin', expected_payout_date);
  },

  async reject(id, remarks) {
    return this.updateStatus(id, 'rejected', remarks);
  },

  async markAsPaid(id) {
    const invoiceResult = await db.query(
      'SELECT track_id FROM invoice_requests WHERE id = $1',
      [id]
    );
    const trackId = invoiceResult.rows[0]?.track_id;

    const result = await this.updateStatus(id, 'paid');

    if (trackId) {
      await db.query(
        'UPDATE leadtrackdetails SET ispaid = true WHERE id = $1',
        [trackId]
      );
      console.log(`[WALLET] Marked leadtrackdetails.id=${trackId} as ispaid=true (invoice_request.id=${id})`);
    }

    return result;
  },

  async findById(id) {
    const result = await db.query('SELECT * FROM invoice_requests WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const query = `
      INSERT INTO invoice_requests
        (connectorid, connector_name, invoice_number, contact_name,
         loan_type, loan_amount, disbursed_amount, payout_amount,
         sgst, cgst, tds, total_amount, invoice_type, bank_name,
         track_number, track_id, service_type, processing_type,
         is_gst_registered, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *
    `;
    const result = await db.query(query, [
      data.connector_id || data.connectorid,
      data.connector_name,
      data.invoice_number || null,
      data.contact_name,
      data.loan_type,
      data.loan_amount || 0,
      data.disbursed_amount || 0,
      data.payout_amount || 0,
      data.sgst || 0,
      data.cgst || 0,
      data.tds || 0,
      data.total_amount || 0,
      data.invoice_type || 'instant',
      data.bank_name || '',
      data.track_number || '',
      data.track_id || null,
      data.service_type || '',
      data.processing_type || '',
      data.is_gst_registered || false,
      'pending',
    ]);
    return result.rows[0];
  },

  async findByConnectorId(connectorId) {
    try {
      const result = await db.query(
        `SELECT ir.*,
                COALESCE(ir.billing_to_name, c.name) as billing_to_name,
                COALESCE(ir.billing_to_address, COALESCE(c.address, c.location)) as billing_to_address,
                COALESCE(ir.billing_to_phone, c.mobilenumber) as billing_to_phone,
                COALESCE(ir.billing_to_email, c.emailid) as billing_to_email,
                COALESCE(ir.billing_to_pan, c.pan_number) as billing_to_pan,
                COALESCE(ir.billing_to_gst, c.gst_number) as billing_to_gst
         FROM invoice_requests ir
         LEFT JOIN connector c ON ir.connectorid = c.id
         WHERE ir.connectorid = $1 ORDER BY ir.created_at DESC`,
        [connectorId]
      );
      return result.rows;
    } catch (err) {
      console.error('findByConnectorId JOIN failed, using fallback:', err.message);
      const result = await db.query(
        'SELECT * FROM invoice_requests WHERE connectorid = $1 ORDER BY created_at DESC',
        [connectorId]
      );
      return result.rows;
    }
  },

  async findByTrackId(trackId) {
    const result = await db.query(
      'SELECT * FROM invoice_requests WHERE track_id = $1 LIMIT 1',
      [trackId]
    );
    return result.rows[0] || null;
  },

  async updateBillingFrom(id, billingFrom) {
    const query = `
      UPDATE invoice_requests
      SET billing_from_name = $1, billing_from_address = $2, billing_from_phone = $3,
          billing_from_email = $4, billing_from_pan = $5, billing_from_gstin = $6,
          place_of_supply = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const result = await db.query(query, [
      billingFrom.name || '', billingFrom.address || '',
      billingFrom.phone || '', billingFrom.email || '',
      billingFrom.pan || '', billingFrom.gstin || '',
      billingFrom.place_of_supply || '', id,
    ]);
    return result.rows[0];
  },

  async updateBillingTo(id, billingTo) {
    const query = `
      UPDATE invoice_requests
      SET billing_to_name = $1, billing_to_address = $2, billing_to_phone = $3,
          billing_to_email = $4, billing_to_pan = $5, billing_to_gst = $6,
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const result = await db.query(query, [
      billingTo.name || '', billingTo.address || '',
      billingTo.phone || '', billingTo.email || '',
      billingTo.pan || '', billingTo.gst || '', id,
    ]);
    return result.rows[0];
  },

  async getConnectorProfile(connectorId) {
    try {
      const result = await db.query(
        `SELECT name, emailid, mobilenumber, address, location,
                pan_number, gst_number, is_gst_registered,
                ifsc, accountnumber, branch
         FROM connector WHERE id = $1 LIMIT 1`,
        [connectorId]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error fetching connector profile:', err);
      return null;
    }
  }
};

module.exports = AdminInvoiceModel;
