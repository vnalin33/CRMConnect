/**
 * autoMigrate.js — Unified auto-migration for ALL tables
 * Merges mobile backend + CRM-oneassist admin backend table definitions.
 * Runs automatically on server startup (CREATE TABLE IF NOT EXISTS — idempotent).
 */

const db = require('../config/db');

// ══════════════════════════════════════════════════════════════════════════════
// ── TABLE DEFINITIONS (all tables used by mobile app + admin CRM panel) ──
// ══════════════════════════════════════════════════════════════════════════════

const TABLES = [
  // ── 1. Users (admin/internal accounts for unified backend) ──
  {
    name: 'users',
    sql: `CREATE TABLE IF NOT EXISTS users (
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
    );`,
  },

  // ── 2. Connector (mobile app users / connectors) ──
  {
    name: 'connector',
    sql: `CREATE TABLE IF NOT EXISTS connector (
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
    );`,
  },

  // ── 3. Status codes (CRM admin) ──
  {
    name: 'statuscode',
    sql: `CREATE TABLE IF NOT EXISTS statuscode (
      id      SERIAL PRIMARY KEY,
      status  VARCHAR(100) NOT NULL,
      color   VARCHAR(20)
    );`,
  },

  // ── 4. Location master (CRM admin) ──
  {
    name: 'locationmaster',
    sql: `CREATE TABLE IF NOT EXISTS locationmaster (
      id        SERIAL PRIMARY KEY,
      location  VARCHAR(255) NOT NULL,
      isactive  BOOLEAN DEFAULT true
    );`,
  },

  // ── 5. Employee details (CRM admin users) ──
  {
    name: 'employeedetails',
    sql: `CREATE TABLE IF NOT EXISTS employeedetails (
      id                SERIAL PRIMARY KEY,
      name              VARCHAR(255),
      emailid           VARCHAR(255) UNIQUE,
      password          VARCHAR(255),
      mobilenumber      VARCHAR(20),
      designation       VARCHAR(100),
      isactive          BOOLEAN DEFAULT true,
      isadminrights     BOOLEAN DEFAULT false,
      isleadrights      BOOLEAN DEFAULT false,
      iscontactrights   BOOLEAN DEFAULT false,
      iscibilrights     BOOLEAN DEFAULT false,
      isicicirights     BOOLEAN DEFAULT false,
      organizationid    INTEGER,
      locationid        INTEGER,
      crm_type          VARCHAR(20) DEFAULT 'fintech',
      createdon         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 6. Lead personal details ──
  {
    name: 'leadpersonaldetails',
    sql: `CREATE TABLE IF NOT EXISTS leadpersonaldetails (
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
      connectorid     INTEGER,
      connectorcontactid INTEGER DEFAULT 0,
      referencename   VARCHAR(255),
      presentaddress  TEXT,
      status          INTEGER DEFAULT 1,
      organizationid  INTEGER DEFAULT 1002,
      locationid      INTEGER DEFAULT 5005,
      contacttype     VARCHAR(50) DEFAULT 'Connector Contact',
      createdon       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 7. Lead CIBIL details (CRM admin) ──
  {
    name: 'leadcibildetails',
    sql: `CREATE TABLE IF NOT EXISTS leadcibildetails (
      id              SERIAL PRIMARY KEY,
      leadpersonal    INTEGER REFERENCES leadpersonaldetails(id) ON DELETE CASCADE,
      cibilscore      INTEGER,
      totalactiveloans INTEGER,
      dpd             INTEGER,
      settledaccounts INTEGER,
      suitfiled       VARCHAR(100),
      dpdbankname     VARCHAR(255),
      dpdmonth        DATE,
      dpdproducttype  VARCHAR(100),
      organizationid  INTEGER,
      createdon       TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 8. Lead occupation details (CRM admin) ──
  {
    name: 'leadoccupationdetails',
    sql: `CREATE TABLE IF NOT EXISTS leadoccupationdetails (
      id                    SERIAL PRIMARY KEY,
      leadpersonal          INTEGER REFERENCES leadpersonaldetails(id) ON DELETE CASCADE,
      occupationtype        VARCHAR(100),
      incometype            VARCHAR(100),
      compname              VARCHAR(255),
      companyaddress        TEXT,
      designation           VARCHAR(255),
      joiningdate           DATE,
      officetelephonenumber VARCHAR(50),
      companygstinnumber    VARCHAR(50),
      incomeamount          NUMERIC,
      otherincomeamount     NUMERIC,
      organizationid        INTEGER,
      industry              VARCHAR(255),
      customer_segment      VARCHAR(100),
      risk_category         VARCHAR(100),
      data_strength         VARCHAR(100),
      compcat               VARCHAR(100),
      totalexperience       INTEGER,
      currentexperience     INTEGER,
      salarybank            VARCHAR(255),
      salarymode            VARCHAR(100),
      businessname          VARCHAR(255),
      businesstype          VARCHAR(100),
      annualturnover        NUMERIC,
      businessvintage       VARCHAR(100),
      customer_score        INTEGER,
      is_auto_mode          BOOLEAN
    );`,
  },

  // ── 9. Lead track details ──
  {
    name: 'leadtrackdetails',
    sql: `CREATE TABLE IF NOT EXISTS leadtrackdetails (
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
      appoinmentdate          TIMESTAMP,
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
    );`,
  },

  // ── 10. Lead track history ──
  {
    name: 'leadtrackhistorydetails',
    sql: `CREATE TABLE IF NOT EXISTS leadtrackhistorydetails (
      id                  SERIAL PRIMARY KEY,
      tracknumber         VARCHAR(50),
      leadid              INTEGER REFERENCES leadpersonaldetails(id),
      status              INTEGER,
      notes               TEXT,
      isdirectmeet        BOOLEAN DEFAULT false,
      createon            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      contactfollowedby   INTEGER,
      leadfollowedby      INTEGER
    );`,
  },

  // ── 11. Lead bank details (CRM admin) ──
  {
    name: 'leadbankdetails',
    sql: `CREATE TABLE IF NOT EXISTS leadbankdetails (
      id                SERIAL PRIMARY KEY,
      leadpersonal      INTEGER REFERENCES leadpersonaldetails(id) ON DELETE CASCADE,
      bankname          VARCHAR(255),
      branch            VARCHAR(255),
      ifsccode          VARCHAR(50),
      accountnumber     VARCHAR(100),
      accounttype       VARCHAR(100),
      accountholdername VARCHAR(255),
      isprimary         BOOLEAN DEFAULT FALSE,
      createdon         TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 12. Lead loan history (CRM admin) ──
  {
    name: 'leadloanhistorydetails',
    sql: `CREATE TABLE IF NOT EXISTS leadloanhistorydetails (
      id               SERIAL PRIMARY KEY,
      leadpersonal     INTEGER REFERENCES leadpersonaldetails(id) ON DELETE CASCADE,
      loantype         VARCHAR(150),
      roi              NUMERIC(5,2),
      loanamount       NUMERIC(15,2),
      bankname         VARCHAR(255),
      branchname       VARCHAR(255),
      disbursementdate DATE,
      tenure           INTEGER,
      createdon        TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 13. Lead drafts (mobile) ──
  {
    name: 'leaddrafts',
    sql: `CREATE TABLE IF NOT EXISTS leaddrafts (
      id            SERIAL PRIMARY KEY,
      connectorid   INTEGER REFERENCES connector(id),
      draft_data    JSONB NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 14. Invoices (mobile) ──
  {
    name: 'invoices',
    sql: `CREATE TABLE IF NOT EXISTS invoices (
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
    );`,
  },

  // ── 15. Invoice requests (admin approval workflow) ──
  {
    name: 'invoice_requests',
    sql: `CREATE TABLE IF NOT EXISTS invoice_requests (
      id                    SERIAL PRIMARY KEY,
      connectorid           INTEGER,
      connector_name        VARCHAR(255) DEFAULT '',
      invoice_number        VARCHAR(100),
      contact_name          VARCHAR(255) DEFAULT '',
      loan_type             VARCHAR(100) DEFAULT '',
      loan_amount           NUMERIC DEFAULT 0,
      disbursed_amount      NUMERIC DEFAULT 0,
      payout_percent        NUMERIC DEFAULT 0,
      payout_amount         NUMERIC DEFAULT 0,
      sgst                  NUMERIC DEFAULT 0,
      cgst                  NUMERIC DEFAULT 0,
      tds                   NUMERIC DEFAULT 0,
      total_amount          NUMERIC DEFAULT 0,
      invoice_type          VARCHAR(50) DEFAULT 'instant',
      bank_name             VARCHAR(255) DEFAULT '',
      track_number          VARCHAR(100) DEFAULT '',
      track_id              INTEGER,
      service_type          VARCHAR(255) DEFAULT '',
      processing_type       VARCHAR(255) DEFAULT '',
      is_gst_registered     BOOLEAN DEFAULT false,
      status                VARCHAR(50) DEFAULT 'pending',
      admin_remarks         TEXT,
      remarks               TEXT,
      expected_payout_date  DATE,
      billing_from_name     VARCHAR(255),
      billing_from_address  TEXT,
      billing_from_phone    VARCHAR(50),
      billing_from_email    VARCHAR(255),
      billing_from_pan      VARCHAR(20),
      billing_from_gstin    VARCHAR(20),
      place_of_supply       VARCHAR(100),
      billing_to_name       VARCHAR(255),
      billing_to_address    TEXT,
      billing_to_phone      VARCHAR(50),
      billing_to_email      VARCHAR(255),
      billing_to_pan        VARCHAR(20),
      billing_to_gst        VARCHAR(20),
      mobile_number         VARCHAR(20),
      created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 16. Withdrawals (admin approval workflow) ──
  {
    name: 'withdrawals',
    sql: `CREATE TABLE IF NOT EXISTS withdrawals (
      id              SERIAL PRIMARY KEY,
      connector_id    INTEGER,
      connector_name  VARCHAR(255) DEFAULT '',
      amount          NUMERIC DEFAULT 0,
      status          VARCHAR(50) DEFAULT 'pending',
      remarks         TEXT,
      bank_details    TEXT,
      request_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_date   TIMESTAMP,
      paid_date       TIMESTAMP
    );`,
  },

  // ── 17. Notifications ──
  {
    name: 'notifications',
    sql: `CREATE TABLE IF NOT EXISTS notifications (
      id            SERIAL PRIMARY KEY,
      connectorid   INTEGER,
      user_id       INTEGER,
      user_type     VARCHAR(20) DEFAULT 'connector',
      title         VARCHAR(500) NOT NULL,
      body          TEXT,
      data          JSONB DEFAULT '{}',
      metadata      TEXT,
      type          VARCHAR(50) DEFAULT 'general',
      is_read       BOOLEAN DEFAULT false,
      read_status   BOOLEAN DEFAULT false,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 18. FCM tokens ──
  {
    name: 'fcm_tokens',
    sql: `CREATE TABLE IF NOT EXISTS fcm_tokens (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      user_type   VARCHAR(20) NOT NULL DEFAULT 'connector',
      token       TEXT NOT NULL,
      device_info VARCHAR(255),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, user_type, token)
    );`,
  },

  // ── 19. Password reset tokens ──
  {
    name: 'password_reset_tokens',
    sql: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id          SERIAL PRIMARY KEY,
      email       VARCHAR(255),
      employee_id INTEGER,
      token       TEXT,
      token_hash  VARCHAR(255),
      expires_at  TIMESTAMP NOT NULL,
      used        BOOLEAN DEFAULT false,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 20. Knowledge base (CRM admin) ──
  {
    name: 'knowledge_base',
    sql: `CREATE TABLE IF NOT EXISTS knowledge_base (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(500) NOT NULL,
      content     TEXT,
      category    VARCHAR(100),
      role_access TEXT DEFAULT 'all',
      created_by  INTEGER,
      is_active   BOOLEAN DEFAULT true,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 21. Knowledge base rates (CRM admin) ──
  {
    name: 'knowledge_base_rates',
    sql: `CREATE TABLE IF NOT EXISTS knowledge_base_rates (
      id             SERIAL PRIMARY KEY,
      bank_name      VARCHAR(255) NOT NULL,
      loan_type      VARCHAR(100),
      rate_of_interest NUMERIC(5,2),
      processing_fee   VARCHAR(100),
      max_tenure     INTEGER,
      max_amount     NUMERIC(15,2),
      remarks        TEXT,
      is_active      BOOLEAN DEFAULT true,
      created_at     TIMESTAMP DEFAULT NOW(),
      updated_at     TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 22. Company profile ──
  {
    name: 'company_profile',
    sql: `CREATE TABLE IF NOT EXISTS company_profile (
      id            SERIAL PRIMARY KEY,
      company_name  VARCHAR(255),
      address       TEXT,
      phone         VARCHAR(50),
      email         VARCHAR(255),
      pan           VARCHAR(20),
      gstin         VARCHAR(20),
      logo_url      TEXT,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  },

  // ── 23. Extensions (softphone / SIP) ──
  {
    name: 'extensions',
    sql: `CREATE TABLE IF NOT EXISTS extensions (
      id             SERIAL PRIMARY KEY,
      employee_id    INTEGER,
      sip_extension  VARCHAR(50) UNIQUE,
      sip_password   VARCHAR(255),
      sip_host       VARCHAR(255) DEFAULT 'localhost',
      sip_port       INTEGER DEFAULT 5060,
      status         VARCHAR(50) DEFAULT 'offline',
      created_at     TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 24. Call logs ──
  {
    name: 'call_logs',
    sql: `CREATE TABLE IF NOT EXISTS call_logs (
      id             SERIAL PRIMARY KEY,
      uniqueid       VARCHAR(100) UNIQUE,
      caller         VARCHAR(50) NOT NULL,
      callee         VARCHAR(50) NOT NULL,
      direction      VARCHAR(20) NOT NULL,
      status         VARCHAR(50) NOT NULL,
      duration       INTEGER DEFAULT 0,
      start_time     TIMESTAMP DEFAULT NOW(),
      end_time       TIMESTAMP,
      employee_id    INTEGER,
      contact_id     INTEGER
    );`,
  },

  // ── 25. Call recordings ──
  {
    name: 'call_recordings',
    sql: `CREATE TABLE IF NOT EXISTS call_recordings (
      id             SERIAL PRIMARY KEY,
      call_log_id    INTEGER REFERENCES call_logs(id) ON DELETE CASCADE,
      file_path      VARCHAR(555) NOT NULL,
      file_size      INTEGER,
      duration       INTEGER,
      created_at     TIMESTAMP DEFAULT NOW()
    );`,
  },

  // ── 26. Call history ──
  {
    name: 'call_history',
    sql: `CREATE TABLE IF NOT EXISTS call_history (
      id             SERIAL PRIMARY KEY,
      contact_id     INTEGER,
      call_log_id    INTEGER REFERENCES call_logs(id) ON DELETE SET NULL,
      notes          TEXT,
      created_at     TIMESTAMP DEFAULT NOW()
    );`,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// ── INDEXES ──
// ══════════════════════════════════════════════════════════════════════════════

const INDEXES = [
  // Lead indexes
  'CREATE INDEX IF NOT EXISTS idx_leads_connectorid ON leadpersonaldetails(connectorid)',
  'CREATE INDEX IF NOT EXISTS idx_leads_status ON leadpersonaldetails(status)',
  'CREATE INDEX IF NOT EXISTS idx_leads_orgid ON leadpersonaldetails(organizationid)',
  // Lead track indexes
  'CREATE INDEX IF NOT EXISTS idx_leadtrack_leadid ON leadtrackdetails(leadid)',
  'CREATE INDEX IF NOT EXISTS idx_leadtrack_status ON leadtrackdetails(status)',
  'CREATE INDEX IF NOT EXISTS idx_leadtrack_followedby ON leadtrackdetails(contactfollowedby)',
  // Lead history
  'CREATE INDEX IF NOT EXISTS idx_leadhistory_leadid ON leadtrackhistorydetails(leadid)',
  // Drafts
  'CREATE INDEX IF NOT EXISTS idx_drafts_connectorid ON leaddrafts(connectorid)',
  // Invoices
  'CREATE INDEX IF NOT EXISTS idx_invoices_connector ON invoices(connector_id)',
  // Invoice requests
  'CREATE INDEX IF NOT EXISTS idx_invoice_requests_connectorid ON invoice_requests(connectorid)',
  'CREATE INDEX IF NOT EXISTS idx_invoice_requests_status ON invoice_requests(status)',
  // Withdrawals
  'CREATE INDEX IF NOT EXISTS idx_withdrawals_connector ON withdrawals(connector_id)',
  'CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status)',
  // Notifications
  'CREATE INDEX IF NOT EXISTS idx_notifications_connectorid ON notifications(connectorid)',
  // FCM
  'CREATE INDEX IF NOT EXISTS idx_fcm_user ON fcm_tokens(user_id, user_type)',
  // Connector
  'CREATE INDEX IF NOT EXISTS idx_connector_email ON connector(emailid)',
  'CREATE INDEX IF NOT EXISTS idx_connector_mobile ON connector(mobilenumber)',
  // Employee
  'CREATE INDEX IF NOT EXISTS idx_employee_email ON employeedetails(emailid)',
  'CREATE INDEX IF NOT EXISTS idx_employee_orgid ON employeedetails(organizationid)',
  // Password reset
  'CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token)',
  // CIBIL
  'CREATE INDEX IF NOT EXISTS idx_cibil_leadpersonal ON leadcibildetails(leadpersonal)',
  // Occupation
  'CREATE INDEX IF NOT EXISTS idx_occupation_leadpersonal ON leadoccupationdetails(leadpersonal)',
  // Bank details
  'CREATE INDEX IF NOT EXISTS idx_bank_leadpersonal ON leadbankdetails(leadpersonal)',
  // Call logs
  'CREATE INDEX IF NOT EXISTS idx_call_logs_employee ON call_logs(employee_id)',
  'CREATE INDEX IF NOT EXISTS idx_call_logs_contact ON call_logs(contact_id)',
];

// ══════════════════════════════════════════════════════════════════════════════
// ── SAFE COLUMN ALTERATIONS (add missing columns to existing tables) ──
// ══════════════════════════════════════════════════════════════════════════════

const ALTERATIONS = [
  // Connector — reset tokens
  `DO $$ BEGIN
     ALTER TABLE connector ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
     ALTER TABLE connector ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
  // Users — reset tokens
  `DO $$ BEGIN
     ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
     ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
  // Lead track — rejection & reminder columns
  `DO $$ BEGIN
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS rejectreason TEXT;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS rejectcategory VARCHAR(150);
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS rejectremarks TEXT;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS rejectedby INTEGER;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS rejectdatetime TIMESTAMP;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS reworkpossible BOOLEAN;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS next_reminder_date DATE;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS last_reminder_date DATE;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS customer_segment VARCHAR(100);
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS risk_category VARCHAR(100);
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS customer_score INTEGER;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS is_auto_mode BOOLEAN;
     ALTER TABLE leadtrackdetails ADD COLUMN IF NOT EXISTS data_strength VARCHAR(100);
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
  // Lead personal — extra columns
  `DO $$ BEGIN
     ALTER TABLE leadpersonaldetails ADD COLUMN IF NOT EXISTS connectorcontactid INTEGER DEFAULT 0;
     ALTER TABLE leadpersonaldetails ADD COLUMN IF NOT EXISTS referencename VARCHAR(255);
     ALTER TABLE leadpersonaldetails ADD COLUMN IF NOT EXISTS presentaddress TEXT;
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
  // Employee — crm_type
  `DO $$ BEGIN
     ALTER TABLE employeedetails ADD COLUMN IF NOT EXISTS crm_type VARCHAR(20) DEFAULT 'fintech';
   EXCEPTION WHEN others THEN NULL;
   END $$;`,
];

// ══════════════════════════════════════════════════════════════════════════════
// ── STORED PROCEDURES / FUNCTIONS ──
// ══════════════════════════════════════════════════════════════════════════════

const FUNCTIONS = [
  {
    name: 'GetUnassignedContactList',
    sql: `
      CREATE OR REPLACE FUNCTION public.getunassignedcontactlist(orgid integer)
      RETURNS TABLE(id integer, firstname character varying, lastname character varying, emailid character varying, referencename character varying, location character varying, mobilenumber character varying, isconnectorcontact integer, createddt timestamp with time zone, contactsource character varying)
      LANGUAGE plpgsql
      AS $$
      BEGIN
          RETURN QUERY
              SELECT
                  lp.Id as Id,
                  lp.FirstName as FirstName,
                  lp.LastName as LastName,
                  lp.Email as EmailId,
                  lp.ReferenceName as ReferenceName,
                  COALESCE(NULLIF(TRIM(split_part(lp.presentaddress, '|', 2)), ''), l.location)::varchar as Location,
                  lp.MobileNumber as MobileNumber,
                  lp.ConnectorContactId as isConnectorContact,
                  lp.CreatedOn as createdDt,
                  lp.ContactType as ContactSource
                  FROM LeadPersonalDetails lp
                  LEFT JOIN LocationMaster l on lp.LocationId = l.Id
                  WHERE lp.Status IN (1, 5)
                    AND lp.OrganizationId=OrgId
                  ORDER BY createddt desc;
      END;
      $$;
    `,
  },
  {
    name: 'GetAssignedContactList',
    sql: `
      CREATE OR REPLACE FUNCTION public.getassignedcontactlist(userid integer, orgid integer)
      RETURNS TABLE(id integer, name text, emailid character varying, referencename character varying, location character varying, mobilenumber character varying, status text, appoinmentdate timestamp with time zone, tracknumber text, contacttype character varying)
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY SELECT DISTINCT ON (lp.Id)
                          lp.Id as Id,
                          lp.FirstName || ' ' ||lp.LastName as name,
                          lp.Email,
                          lp.ReferenceName,
                          COALESCE(NULLIF(TRIM(split_part(lp.presentaddress, '|', 2)), ''), l.Location)::varchar as location,
                          lp.MobileNumber,
                          s.Status,
                          lt.appoinmentdate,
                          lt.TrackNumber,
                          lp.contacttype
                  FROM            
                          LeadPersonalDetails AS lp
                          INNER JOIN  LeadTrackDetails lt ON lp.Id=lt.LeadId
                  LEFT JOIN  LocationMaster l on lp.LocationId = l.Id
                      INNER JOIN  StatusCode s on lt.Status=s.Id
                  WHERE lp.Status = 2 
                          AND lt.ContactFollowedBy=userid AND lp.OrganizationId=orgid 
                  ORDER BY lp.Id, lt.modifyon DESC;
      END;
      $$;
    `,
  },
];

// ── Seed default status codes if empty ──
const SEEDS = [
  {
    name: 'statuscode_defaults',
    sql: `
      INSERT INTO statuscode (id, status, color)
      SELECT * FROM (VALUES
        (1, 'New', '#2196F3'),
        (2, 'Assigned', '#FF9800'),
        (3, 'Login', '#9C27B0'),
        (4, 'Sanctioned', '#4CAF50'),
        (5, 'Rejected', '#F44336'),
        (6, 'Disbursed', '#00BCD4'),
        (7, 'Follow Up', '#FFC107'),
        (8, 'Not Interested', '#9E9E9E'),
        (9, 'Closed', '#607D8B')
      ) AS v(id, status, color)
      WHERE NOT EXISTS (SELECT 1 FROM statuscode LIMIT 1)
      ON CONFLICT (id) DO NOTHING;
    `,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// ── RUNNER ──
// ══════════════════════════════════════════════════════════════════════════════

async function runMigrations() {
  console.log('\n📦 Running auto-migrations...');
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create all tables
    for (const table of TABLES) {
      await client.query(table.sql);
      console.log(`  ✅ ${table.name}`);
    }

    // 2. Create indexes (non-fatal — skip if column doesn't exist)
    let indexCount = 0;
    for (let i = 0; i < INDEXES.length; i++) {
      const sp = `sp_idx_${i}`;
      try {
        await client.query(`SAVEPOINT ${sp}`);
        await client.query(INDEXES[i]);
        await client.query(`RELEASE SAVEPOINT ${sp}`);
        indexCount++;
      } catch (idxErr) {
        await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
        console.warn(`  ⚠️  Index skipped: ${idxErr.message}`);
      }
    }
    console.log(`  ✅ ${indexCount}/${INDEXES.length} indexes ensured`);

    // 3. Run safe column alterations
    for (const alt of ALTERATIONS) {
      await client.query(alt);
    }
    console.log(`  ✅ ${ALTERATIONS.length} column migrations applied`);

    // 4. Create/update stored procedures
    for (const fn of FUNCTIONS) {
      const sp = `sp_fn_${fn.name}`;
      try {
        await client.query(`SAVEPOINT ${sp}`);
        await client.query(fn.sql);
        await client.query(`RELEASE SAVEPOINT ${sp}`);
        console.log(`  ✅ Function: ${fn.name}`);
      } catch (fnErr) {
        await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
        console.warn(`  ⚠️  Function ${fn.name} skipped: ${fnErr.message}`);
      }
    }

    // 5. Seed default data
    for (const seed of SEEDS) {
      const sp = `sp_seed_${seed.name}`;
      try {
        await client.query(`SAVEPOINT ${sp}`);
        await client.query(seed.sql);
        await client.query(`RELEASE SAVEPOINT ${sp}`);
        console.log(`  ✅ Seed: ${seed.name}`);
      } catch (seedErr) {
        await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
        console.warn(`  ⚠️  Seed ${seed.name} skipped: ${seedErr.message}`);
      }
    }

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
