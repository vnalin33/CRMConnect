/**
 * Admin Auth Routes - Authentication endpoints for admin panel
 */
const express = require('express');
const router = express.Router();
const AdminAuthController = require('../controllers/adminAuthController');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');

router.post('/login', AdminAuthController.login);
router.post('/org-signup', AdminAuthController.register);
router.get('/validate', adminAuthenticate, AdminAuthController.validate);
router.post('/forgot-password', AdminAuthController.forgotPassword);
router.post('/reset-password', AdminAuthController.resetPassword);
router.post('/logout', adminAuthenticate, AdminAuthController.logout);

module.exports = router;
