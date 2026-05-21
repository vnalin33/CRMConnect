const db = require('../config/db');

/**
 * Create the invoices table if it does not exist.
 * Called once at server startup.
 */
const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id              SERIAL PRIMARY KEY,
      invoice_number  VARCHAR(30) UNIQUE NOT NULL,
      connector_id    INTEGER NOT NULL,
      track_id        INTEGER NOT NULL,
      customer_name   VARCHAR(255),
      loan_type       VARCHAR(100),
      service_type    VARCHAR(100),
      processing_type VARCHAR(50),
      loan_amount     NUMERIC(15,2) DEFAULT 0,
      disbursed_amount NUMERIC(15,2) DEFAULT 0,
      payout_amount   NUMERIC(15,2) DEFAULT 0,
      sgst            NUMERIC(15,2) DEFAULT 0,
      cgst            NUMERIC(15,2) DEFAULT 0,
      tds             NUMERIC(15,2) DEFAULT 0,
      is_gst_registered BOOLEAN DEFAULT false,
      grand_total     NUMERIC(15,2) DEFAULT 0,
      bank_name       VARCHAR(100),
      track_number    VARCHAR(50),
      created_at      TIMESTAMP DEFAULT NOW()
    )
  `);

  // Add columns if they don't exist (for existing tables)
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='tds') THEN
        ALTER TABLE invoices ADD COLUMN tds NUMERIC(15,2) DEFAULT 0;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='is_gst_registered') THEN
        ALTER TABLE invoices ADD COLUMN is_gst_registered BOOLEAN DEFAULT false;
      END IF;
    END $$;
  `);
};

/**
 * Generate the next unique invoice number for a connector.
 * Format: INV-YYYY-NNNNN (zero-padded 5-digit sequence per year).
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const result = await db.query(
    `SELECT invoice_number FROM invoices
     WHERE invoice_number LIKE $1
     ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNum = result.rows[0].invoice_number;
    const lastSeq = parseInt(lastNum.replace(prefix, ''), 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
};

/**
 * Generate next unique cycle invoice number.
 * Format: CYC-YYYY-FNNN (zero-padded 3-digit sequence per year).
 */
const generateCycleInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `CYC-${year}-F`;

  const result = await db.query(
    `SELECT invoice_number FROM invoices
     WHERE invoice_number LIKE $1
     ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNum = result.rows[0].invoice_number;
    const lastSeq = parseInt(lastNum.replace(prefix, ''), 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
};

/**
 * Check if an invoice already exists for a given track_id.
 */
const getByTrackId = async (trackId) => {
  const { rows } = await db.query(
    'SELECT * FROM invoices WHERE track_id = $1 LIMIT 1',
    [trackId]
  );
  return rows[0] || null;
};

/**
 * Get invoices for multiple track IDs (batch lookup).
 */
const getByTrackIds = async (trackIds) => {
  if (!trackIds || !trackIds.length) return [];
  const { rows } = await db.query(
    'SELECT * FROM invoices WHERE track_id = ANY($1::int[])',
    [trackIds]
  );
  return rows;
};

/**
 * Create a new invoice record.
 */
const create = async (data) => {
  const invoiceNumber = await generateInvoiceNumber();

  const { rows } = await db.query(
    `INSERT INTO invoices
       (invoice_number, connector_id, track_id, customer_name, loan_type,
        service_type, processing_type, loan_amount, disbursed_amount,
        payout_amount, sgst, cgst, tds, is_gst_registered, grand_total, bank_name, track_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      invoiceNumber,
      data.connectorId,
      data.trackId,
      data.customerName,
      data.loanType,
      data.serviceType,
      data.processingType,
      data.loanAmount,
      data.disbursedAmount,
      data.payoutAmount,
      data.sgst,
      data.cgst,
      data.tds,
      data.isGstRegistered,
      data.grandTotal,
      data.bankName,
      data.trackNumber,
    ]
  );
  return rows[0];
};

/**
 * Create a new cycle invoice record (uses CYC- prefix).
 */
const createCycle = async (data) => {
  const invoiceNumber = await generateCycleInvoiceNumber();

  const { rows } = await db.query(
    `INSERT INTO invoices
       (invoice_number, connector_id, track_id, customer_name, loan_type,
        service_type, processing_type, loan_amount, disbursed_amount,
        payout_amount, sgst, cgst, tds, is_gst_registered, grand_total, bank_name, track_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      invoiceNumber,
      data.connectorId,
      data.trackId,
      data.customerName,
      data.loanType,
      data.serviceType,
      data.processingType,
      data.loanAmount,
      data.disbursedAmount,
      data.payoutAmount,
      data.sgst,
      data.cgst,
      data.tds,
      data.isGstRegistered,
      data.grandTotal,
      data.bankName,
      data.trackNumber,
    ]
  );
  return rows[0];
};

module.exports = {
  ensureTable,
  generateInvoiceNumber,
  generateCycleInvoiceNumber,
  getByTrackId,
  getByTrackIds,
  create,
  createCycle,
};
