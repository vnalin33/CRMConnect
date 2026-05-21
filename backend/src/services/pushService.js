/**
 * Push Notification Service
 * Sends Firebase Cloud Messaging (FCM) push notifications to connectors.
 * Falls back gracefully if Firebase is not configured.
 */
const { getMessaging } = require('../config/firebase');
const fcmTokenModel = require('../models/fcmTokenModel');

/**
 * Send a push notification to a specific connector.
 * Automatically fetches all registered device tokens.
 * 
 * @param {number} connectorId - Target connector
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {object} data - Extra data payload (type, id, etc.)
 */
const sendToConnector = async (connectorId, title, body, data = {}) => {
  try {
    const messaging = getMessaging();
    if (!messaging) {
      console.debug('[PUSH] Firebase not configured — skipping push');
      return;
    }

    const tokens = await fcmTokenModel.getTokensByConnector(connectorId);
    if (!tokens.length) {
      console.debug(`[PUSH] No FCM tokens for connector ${connectorId}`);
      return;
    }

    // Ensure all data values are strings (FCM requirement)
    const stringData = {};
    for (const [key, value] of Object.entries(data)) {
      stringData[key] = String(value ?? '');
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: stringData,
      android: {
        priority: 'high',
        notification: {
          channelId: 'crm_high_priority',
          color: '#6C5CE7',
          sound: 'default',
          defaultVibrateTimings: true,
          defaultLightSettings: true,
        },
      },
    };

    if (tokens.length === 1) {
      // Single device
      message.token = tokens[0];
      const response = await messaging.send(message);
      console.log(`[PUSH] Sent to connector ${connectorId}: ${response}`);
    } else {
      // Multi-device — use sendEachForMulticast
      const multicastMessage = {
        ...message,
        tokens,
      };
      const response = await messaging.sendEachForMulticast(multicastMessage);
      console.log(`[PUSH] Sent to ${response.successCount}/${tokens.length} devices for connector ${connectorId}`);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const code = resp.error?.code;
            if (code === 'messaging/invalid-registration-token' ||
                code === 'messaging/registration-token-not-registered') {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
        // Remove stale tokens
        for (const token of invalidTokens) {
          await fcmTokenModel.removeToken(token);
          console.log(`[PUSH] Removed invalid token: ${token.substring(0, 20)}...`);
        }
      }
    }
  } catch (err) {
    // Don't let push failures break the main flow
    console.error(`[PUSH] Error sending to connector ${connectorId}:`, err.message);
  }
};

/**
 * Send push to multiple connectors at once.
 */
const sendToMultiple = async (connectorIds, title, body, data = {}) => {
  const promises = connectorIds.map(id => sendToConnector(id, title, body, data));
  await Promise.allSettled(promises);
};

module.exports = {
  sendToConnector,
  sendToMultiple,
};
