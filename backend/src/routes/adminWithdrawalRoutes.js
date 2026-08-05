/**
 * Admin Withdrawal Routes - Withdrawal management endpoints for admin panel
 */
const express = require('express');
const router = express.Router();
const AdminWithdrawalController = require('../controllers/adminWithdrawalController');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');

// All withdrawal admin routes require authentication
router.use(adminAuthenticate);

router.get('/', AdminWithdrawalController.getAllRequests);
router.get('/stats', AdminWithdrawalController.getStats);
router.put('/:id/approve', AdminWithdrawalController.approveRequest);
router.put('/:id/reject', AdminWithdrawalController.rejectRequest);
router.put('/:id/paid', AdminWithdrawalController.markPaid);

module.exports = router;
