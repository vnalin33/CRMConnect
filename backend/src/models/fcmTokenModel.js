/**
 * FCM Token Model — stores device FCM tokens per connector
 * for targeted push notification delivery.
 */
const db = require('../config/db');

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS fcm_tokens (
      id            SERIAL PRIMARY KEY,
      connector_id  INTEGER NOT NULL,
      token         TEXT NOT NULL UNIQUE,
      device_info   TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    )
  `);

  // Index for fast lookup by connector
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_fcm_tokens_connector 
    ON fcm_tokens(connector_id)
  `);
};

/**
 * Save or update an FCM token for a connector.
 * Uses UPSERT to handle re-registrations gracefully.
 */
const saveToken = async (connectorId, token, deviceInfo = '') => {
  const query = `
    INSERT INTO fcm_tokens (connector_id, token, device_info, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (token) 
    DO UPDATE SET connector_id = $1, device_info = $3, updated_at = NOW()
    RETURNING *
  `;
  const { rows } = await db.query(query, [connectorId, token, deviceInfo]);
  return rows[0];
};

/**
 * Get all FCM tokens for a connector (they may have multiple devices).
 */
const getTokensByConnector = async (connectorId) => {
  const query = `SELECT token FROM fcm_tokens WHERE connector_id = $1`;
  const { rows } = await db.query(query, [connectorId]);
  return rows.map(r => r.token);
};

/**
 * Remove a specific FCM token (on logout or token refresh).
 */
const removeToken = async (token) => {
  await db.query(`DELETE FROM fcm_tokens WHERE token = $1`, [token]);
};

/**
 * Remove all tokens for a connector (full logout from all devices).
 */
const removeAllTokens = async (connectorId) => {
  await db.query(`DELETE FROM fcm_tokens WHERE connector_id = $1`, [connectorId]);
};

module.exports = {
  ensureTable,
  saveToken,
  getTokensByConnector,
  removeToken,
  removeAllTokens,
};
