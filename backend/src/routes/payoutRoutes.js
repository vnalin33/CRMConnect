const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { protect } = require('../middleware/authMiddleware');

// All payout routes require authentication
router.use(protect);

// GET /api/payouts — Get all payouts for the logged-in connector
router.get('/', payoutController.getPayouts);

module.exports = router;
