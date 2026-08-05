const app = require('./app');
const { PORT } = require('./config/env');
const { Server } = require('socket.io');
const { testConnection } = require('./config/db');
const { runMigrations } = require('./migrations/autoMigrate');
const { runSeed } = require('./migrations/seed');
const { initializeFirebase } = require('./config/firebase');
const CompanyProfileModel = require('./models/companyProfileModel');
const db = require('./config/db');

const HOST = '0.0.0.0';

/**
 * Run admin-specific table migrations (merged from Oneassist-CRMConnect backend)
 */
async function runAdminMigrations() {
  try {
    // Ensure password_reset_tokens table exists (used by admin forgot-password)
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure notifications table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        connectorid INTEGER,
        title VARCHAR(500),
        body TEXT,
        type VARCHAR(50),
        metadata TEXT,
        read_status BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure invoice_requests table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS invoice_requests (
        id SERIAL PRIMARY KEY,
        connectorid INTEGER,
        connector_name VARCHAR(255) DEFAULT '',
        invoice_number VARCHAR(100),
        contact_name VARCHAR(255) DEFAULT '',
        loan_type VARCHAR(100) DEFAULT '',
        loan_amount NUMERIC DEFAULT 0,
        disbursed_amount NUMERIC DEFAULT 0,
        payout_amount NUMERIC DEFAULT 0,
        sgst NUMERIC DEFAULT 0,
        cgst NUMERIC DEFAULT 0,
        tds NUMERIC DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        invoice_type VARCHAR(50) DEFAULT 'instant',
        bank_name VARCHAR(255) DEFAULT '',
        track_number VARCHAR(100) DEFAULT '',
        track_id INTEGER,
        service_type VARCHAR(255) DEFAULT '',
        processing_type VARCHAR(255) DEFAULT '',
        is_gst_registered BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'pending',
        admin_remarks TEXT,
        expected_payout_date DATE,
        billing_from_name VARCHAR(255),
        billing_from_address TEXT,
        billing_from_phone VARCHAR(50),
        billing_from_email VARCHAR(255),
        billing_from_pan VARCHAR(20),
        billing_from_gstin VARCHAR(20),
        place_of_supply VARCHAR(100),
        billing_to_name VARCHAR(255),
        billing_to_address TEXT,
        billing_to_phone VARCHAR(50),
        billing_to_email VARCHAR(255),
        billing_to_pan VARCHAR(20),
        billing_to_gst VARCHAR(20),
        mobile_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure withdrawals table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        connector_id INTEGER,
        connector_name VARCHAR(255) DEFAULT '',
        amount NUMERIC DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        remarks TEXT,
        bank_details TEXT,
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_date TIMESTAMP,
        paid_date TIMESTAMP
      )
    `);

    // Ensure users table exists (for admin accounts)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'connector',
        mobile VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure company_profile table exists
    await CompanyProfileModel.ensureTable();

    console.log('✅ Admin table migrations completed');
  } catch (error) {
    console.error('⚠️ Admin migration error (non-fatal):', error.message);
  }
}

const server = app.listen(PORT, HOST, async () => {
  console.log(`🚀 Unified backend running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
  // Verify DB connectivity at startup
  await testConnection();
  // Auto-create all tables, indexes, and run safe column migrations
  await runMigrations();
  // Run admin-specific migrations (merged from Oneassist-CRMConnect)
  await runAdminMigrations();
  // Seed test data (idempotent – skips if already present)
  await runSeed();
  // Initialize Firebase Admin SDK
  initializeFirebase();
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Expose io to the app so routes can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Clients can join rooms based on their user ID to get private updates
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Keep the process alive indefinitely
setInterval(() => { }, 1 << 30);
