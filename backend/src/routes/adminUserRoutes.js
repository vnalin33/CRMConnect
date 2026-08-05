/**
 * Admin User Routes - User management endpoints for admin panel
 */
const express = require('express');
const router = express.Router();
const AdminUserController = require('../controllers/adminUserController');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');

// Public route for connectors list (CRM dashboard)
router.get('/connectors', AdminUserController.getConnectors);

// Protected routes
router.use(adminAuthenticate);

router.get('/profile', AdminUserController.getProfile);
router.put('/profile', AdminUserController.updateProfile);
router.patch('/password', AdminUserController.changePassword);
router.get('/notifications', AdminUserController.getNotifications);
router.post('/notifications/read', AdminUserController.markNotificationsRead);
router.delete('/notifications', AdminUserController.clearAllNotifications);
router.delete('/notifications/:id', AdminUserController.deleteNotification);

module.exports = router;
