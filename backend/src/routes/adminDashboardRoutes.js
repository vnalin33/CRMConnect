/**
 * Admin Dashboard Routes - Dashboard metrics endpoints for admin panel
 */
const express = require('express');
const router = express.Router();
const AdminDashboardController = require('../controllers/adminDashboardController');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(adminAuthenticate);
router.use(roleMiddleware('admin', 'employee', 'finance agent'));

router.get('/stats', AdminDashboardController.getStats);

module.exports = router;
