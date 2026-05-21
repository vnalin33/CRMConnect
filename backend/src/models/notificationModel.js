const db = require('../config/db');

/**
 * Ensure the notifications table exists in the database.
 */
const ensureTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id              SERIAL PRIMARY KEY,
            connectorid     INTEGER NOT NULL,
            title           VARCHAR(255) NOT NULL,
            body            TEXT,
            type            VARCHAR(50) DEFAULT 'SYSTEM',
            read_status     BOOLEAN DEFAULT false,
            metadata        JSONB DEFAULT '{}',
            created_at      TIMESTAMP DEFAULT NOW()
        )
    `);
};

const getNotificationsByConnector = async (connectorId) => {
    const query = `
        SELECT * FROM notifications
        WHERE connectorid = $1
        ORDER BY created_at DESC
        LIMIT 50
    `;
    const { rows } = await db.query(query, [connectorId]);
    return rows;
};

const getUnreadCount = async (connectorId) => {
    const query = `
        SELECT COUNT(*)::int as count FROM notifications
        WHERE connectorid = $1 AND read_status = false
    `;
    const { rows } = await db.query(query, [connectorId]);
    return rows[0].count;
};

/**
 * Get notifications newer than a given ID (for polling).
 */
const getNewSince = async (connectorId, sinceId) => {
    const query = `
        SELECT * FROM notifications
        WHERE connectorid = $1 AND id > $2
        ORDER BY created_at ASC
    `;
    const { rows } = await db.query(query, [connectorId, sinceId]);
    return rows;
};

const markAsRead = async (notificationId) => {
    const query = `
        UPDATE notifications
        SET read_status = true
        WHERE id = $1
    `;
    await db.query(query, [notificationId]);
};

const markAllAsRead = async (connectorId) => {
    const query = `
        UPDATE notifications
        SET read_status = true
        WHERE connectorid = $1
    `;
    await db.query(query, [connectorId]);
};

const createNotification = async (connectorId, title, body, type, metadata = {}) => {
    const query = `
        INSERT INTO notifications (connectorid, title, body, type, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const { rows } = await db.query(query, [connectorId, title, body, type, JSON.stringify(metadata)]);
    return rows[0];
};

const clearAll = async (connectorId) => {
    await db.query('DELETE FROM notifications WHERE connectorid = $1', [connectorId]);
};

module.exports = {
    ensureTable,
    getNotificationsByConnector,
    getUnreadCount,
    getNewSince,
    markAsRead,
    markAllAsRead,
    createNotification,
    clearAll
};

