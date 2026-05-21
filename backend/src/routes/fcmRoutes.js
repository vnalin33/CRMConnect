/**
 * FCM Token Routes — register/unregister device tokens for push notifications.
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const fcmTokenModel = require('../models/fcmTokenModel');

/**
 * POST /api/fcm/register
 * Register a device FCM token for the logged-in connector.
 * Body: { token: string, deviceInfo?: string }
 */
router.post('/register', protect, async (req, res) => {
  try {
    const connectorId = req.user.id;
    const { token, deviceInfo } = req.body;

    if (!token || !token.trim()) {
      return res.status(400).json({ success: false, message: 'FCM token is required' });
    }

    const saved = await fcmTokenModel.saveToken(connectorId, token.trim(), deviceInfo || '');
    console.log(`[FCM] Token registered for connector ${connectorId}`);

    res.json({ success: true, message: 'FCM token registered', data: { id: saved.id } });
  } catch (error) {
    console.error('[FCM] Register error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to register FCM token' });
  }
});

/**
 * DELETE /api/fcm/unregister
 * Remove a device FCM token (call on logout).
 * Body: { token: string }
 */
router.delete('/unregister', protect, async (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      await fcmTokenModel.removeToken(token);
    } else {
      // Remove all tokens for this connector if no specific token provided
      await fcmTokenModel.removeAllTokens(req.user.id);
    }

    console.log(`[FCM] Token unregistered for connector ${req.user.id}`);
    res.json({ success: true, message: 'FCM token unregistered' });
  } catch (error) {
    console.error('[FCM] Unregister error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to unregister FCM token' });
  }
});

module.exports = router;
