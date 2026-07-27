/**
 * Auto-migration script — creates all tables if they don't exist.
 * Safe to run on every server startup (uses IF NOT EXISTS).
 *
 * Called from server.js on startup to ensure the database schema
 * is ready for production without manual SQL.
 */

const db = require('../config/db');

// ── Table definitions ─────────────────────────────────────────────────────────

const TABLES = [
  // 1. Users table (admin/internal users)
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(255),
        email         VARCHAR(255) UNIQUE NOT NULL,
        mobile        VARCHAR(20),
        password      VARCHAR(255) NOT NULL,
        role          VARCHAR(50) DEFAULT 'user',
        isactive      BOOLEAN DEFAULT true,
        reset_token   VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },

  // 2. Connector table (app users / connectors)
  {
    name: 'connector',
    sql: `
      CREATE TABLE IF NOT EXISTS connector (
        id                  SERIAL PRIMARY KEY,
        name                VARCHAR(255),
        emailid             VARCHAR(255) UNIQUE,
        mobilenumber        VARCHAR(20) UNIQUE,
        password            VARCHAR(255) NOT NULL,
        location            VARCHAR(255),
        address             TEXT,
        profession          VARCHAR(100),
        ifsc                VARCHAR(20),
        accountnumber       VARCHAR(50),
        branch              VARCHAR(100),
        bank_name           VARCHAR(100),
        account_holder_name VARCHAR(255),
        isactive            BOOLEAN DEFAULT true,
        profile_picture     TEXT,
        dob                 DATE,
        pan_number          VARCHAR(20),
        is_gst_registered   BOOLEAN DEFAULT false,
        gst_number          VARCHAR(30),
        reset_token         VARCHAR(255),
        reset_token_expiry  TIMESTAMP,
        "createdDate"       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedDate"       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },

  // 3. Lead personal details
  {
    name: 'leadpersonaldetails',
    sql: `
      CREATE TABLE IF NOT EXISTS leadpersonaldetails (
        id              SERIAL PRIMARY KEY,
        firstname       VARCHAR(255),
        lastname        VARCHAR(255),
        email           VARCHAR(255),
        mobilenumber    VARCHAR(20),
        loantype        VARCHAR(100),
        loanamount      VARCHAR(50),
        annualincome    VARCHAR(50),
        employmenttype  VARCHAR(100),
        company_type    VARCHAR(100),
        sector_type     VARCHAR(100),
        cibilscore      VARCHAR(20),
        profession      VARCHAR(100),
        existingloans   VARCHAR(50),
        notes           TEXT,
        servicetype     VARCHAR(100),
        processingtype  VARCHAR(100),
        connectorid     INTEGER REFERENCES connector(id),
        status          INTEGER DEFAULT 1,
        organizationid  INTEGER DEFAULT 1002,
        locationid      INTEGER DEFAULT 5005,
        contacttype     VARCHAR(50) DEFAULT 'Connector Contact',
        createdon       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },

  // 4. Lead track details
  {
    name: 'leadtrackdetails',
    sql: `
      CREATE TABLE IF NOT EXISTS leadtrackdetails (
        id                      SERIAL PRIMARY KEY,
        tracknumber             VARCHAR(50),
        leadid                  INTEGER REFERENCES leadpersonaldetails(id),
        status                  INTEGER DEFAULT 1,
        notes                   TEXT,
        customername            VARCHAR(255),
        contactfollowedby       INTEGER,
        leadfollowedby          INTEGER,
        organizationid          INTEGER,
        modifyon                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isdirectmeet            BOOLEAN DEFAULT false,
        occupationtype          VARCHAR(100) DEFAULT '',
        loantype                VARCHAR(100) DEFAULT '',
        desireloanamount        VARCHAR(50) DEFAULT '0',
        tenure                  INTEGER DEFAULT 0,
        preferedbank            VARCHAR(100) DEFAULT '',
        cibilscore              INTEGER DEFAULT 0,
        incometype              VARCHAR(100) DEFAULT '',
        incomeamount            VARCHAR(50) DEFAULT '0',
        isidproof               BOOLEAN DEFAULT false,
        isageproof              BOOLEAN DEFAULT false,
        isaddessproof           BOOLEAN DEFAULT false,
        iscreditcardstatement   BOOLEAN DEFAULT false,
        isexistingloantrack     BOOLEAN DEFAULT false,
        iscurrentaccountstatement BOOLEAN DEFAULT false,
        isstabilityproof        BOOLEAN DEFAULT false,
        isbankstatement         BOOLEAN DEFAULT false,
        ispayslip               BOOLEAN DEFAULT false,
        isform16                BOOLEAN DEFAULT false,
        isbusinessproof         BOOLEAN DEFAULT false,
        isitr                   BOOLEAN DEFAULT false,
        isgststatement          BOOLEAN DEFAULT false,
        isencumbrancecertificate BOOLEAN DEFAULT false,
        istitledeed             BOOLEAN DEFAULT false,
        isparentdeed            BOOLEAN DEFAULT false,
        islayoutplan            BOOLEAN DEFAULT false,
        isregulationorder       BOOLEAN DEFAULT false,
        isbuildingpermit        BOOLEAN DEFAULT false,
        ispropertytax           BOOLEAN DEFAULT false,
        ispatta                 BOOLEAN DEFAULT false,
        isconstructionagreement BOOLEAN DEFAULT false,
        issaleagreement         BOOLEAN DEFAULT false,
        isapf                   BOOLEAN DEFAULT false,
        isudsregistration       BOOLEAN DEFAULT false,
        isrcbook                BOOLEAN DEFAULT false,
        bankname                VARCHAR(100) DEFAULT '',
        applicationnumber       VARCHAR(100) DEFAULT '',
        loginvalue              VARCHAR(50) DEFAULT '0',
        logindate               TIMESTAMP,
        sanctionroi             VARCHAR(50) DEFAULT '0',
        sanctionvalue           VARCHAR(50) DEFAULT '0',
        sanctiondate            TIMESTAMP,
        psdcondition            TEXT DEFAULT '',
        islegal                 BOOLEAN DEFAULT false,
        istechnical             BOOLEAN DEFAULT false,
        legalreport             TEXT DEFAULT '',
        technicalreport         TEXT DEFAULT '',
        ispsdconditionverified  BOOLEAN DEFAULT false,
        isnoresponse            BOOLEAN DEFAULT false,
        payoutpercent           VARCHAR(20) DEFAULT '0',
        ispaid                  BOOLEAN DEFAULT false,
        connectorcontactid      INTEGER DEFAULT 0,
        disbursementamount      VARCHAR(50) DEFAULT '0',
        datastrength            VARCHAR(50) DEFAULT '',
        compname                VARCHAR(255) DEFAULT '',
        compcat                 VARCHAR(100) DEFAULT '',
        custsegment             VARCHAR(100) DEFAULT '',
        customer                BOOLEAN DEFAULT false
      );
    `,
  },

  // 5. Lead track history
  {
    name: 'leadtrackhistorydetails',
    sql: `
      CREATE TABLE IF NOT EXISTS leadtrackhistorydetails (
        id                  SERIAL PRIMARY KEY,
        tracknumber         VARCHAR(50),
        leadid              INTEGER REFERENCES leadpersonaldetails(id),
        status              INTEGER,
        notes               TEXT,
        isdirectmeet        BOOLEAN DEFAULT false,
        createon            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contactfollowedby   INTEGER,
        leadfollowedby      INTEGER
      );
    `,
  },

  // 6. Lead drafts
  {
    name: 'leaddrafts',
    sql: `
      CREATE TABLE IF NOT EXISTS leaddrafts (
        id            SERIAL PRIMARY KEY,
        connectorid   INTEGER REFERENCES connector(id),
        draft_data    JSONB NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },

  // 7. Invoices
  {
    name: 'invoices',
    sql: `
      CREATE TABLE IF NOT EXISTS invoices (
        id              SERIAL PRIMARY KEY,
        connector_id    INTEGER NOT NULL REFERENCES connector(id),
        invoice_number  VARCHAR(50) UNIQUE NOT NULL,
        invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date        DATE,
        bill_to_name    VARCHAR(255) NOT NULL,
        bill_to_address TEXT,
        bill_to_gst     VARCHAR(30),
        items           JSONB NOT NULL DEFAULT '[]'::jsonb,
        subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
        gst_percent     NUMERIC(5,2) NOT NULL DEFAULT 18,
        gst_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
        total           NUMERIC(12,2) NOT NULL DEFAULT 0,
        notes           TEXT,
        status          VARCHAR(20) NOT NULL DEFAULT 'draft',
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },

  // 8. Notifications
  {
    name: 'notifications',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER NOT NULL,
        user_type     VARCHAR(20) NOT NULL DEFAULT 'connector',
        title         VARCHAR(255) NOT NULL,
        body          TEXT,
        data          JSONB DEFAULT '{}',
        type          VARCHAR(50) DEFAULT 'general',
        is_read       BOOLEAN DEFAULT false,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },

  // 9. FCM tokens
  {
    name: 'fcm_tokens',
    sql: `
      CREATE TABLE IF NOT EXISTS fcm_tokens (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL,
        user_type   VARCHAR(20) NOT NULL DEFAULT 'connector',
        token       TEXT NOT NULL,
        device_info VARCHAR(255),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, user_type, token)
      );
    `,
  },
];

// ── Indexes ───────────────────────────────────────────────────────────────────

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_leads_connectorid ON leadpersonaldetails(connectorid)',
  'CREATE INDEX IF NOT EXISTS idx_leads_status ON leadpersonaldetails(status)',
  'CREATE INDEX IF NOT EXISTS idx_leadtrack_leadid ON leadtrackdetails(leadid)',
  'CREATE INDEX IF NOT EXISTS idx_leadtrack_status ON leadtrackdetails(status)',
  'CREATE INDEX IF NOT EXISTS idx_leadhistory_leadid ON leadtrackhistorydetails(leadid)',
  'CREATE INDEX IF NOT EXISTS idx_drafts_connectorid ON leaddrafts(connectorid)',
  'CREATE INDEX IF NOT EXISTS idx_invoices_connector ON invoices(connector_id)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read)',
  'CREATE INDEX IF NOT EXISTS idx_fcm_user ON fcm_tokens(user_id, user_type)',
  'CREATE INDEX IF NOT EXISTS idx_connector_email ON connector(emailid)',
  'CREATE INDEX IF NOT EXISTS idx_connector_mobile ON connector(mobilenumber)',
];

// ── ALTER TABLE additions (safe migrations) ───────────────────────────────────
// These add columns that may not exist in older schemas.

const ALTERATIONS = [
  // Reset token columns for connector
  `DO $$ BEGIN
     ALTER TABLE connector ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
     ALTER TABLE connector ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
  // Reset token columns for users
  `DO $$ BEGIN
     ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
     ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function runMigrations() {
  console.log('\n📦 Running auto-migrations...');
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create tables
    for (const table of TABLES) {
      await client.query(table.sql);
      console.log(`  ✅ ${table.name}`);
    }

    // 2. Create indexes
    for (const idx of INDEXES) {
      await client.query(idx);
    }
    console.log(`  ✅ ${INDEXES.length} indexes ensured`);

    // 3. Run safe alterations
    for (const alt of ALTERATIONS) {
      await client.query(alt);
    }
    console.log(`  ✅ ${ALTERATIONS.length} column migrations applied`);

    await client.query('COMMIT');
    console.log('📦 Auto-migrations complete!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };
