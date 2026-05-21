const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// All invoice routes require authentication
router.use(protect);

// POST /api/invoices/generate — Generate a unique invoice for a payout (Instant)
router.post('/generate', invoiceController.generateInvoice);

// POST /api/invoices/generate-cycle — Generate a cycle invoice for a payout
router.post('/generate-cycle', invoiceController.generateCycleInvoice);

// POST /api/invoices/by-tracks — Get existing invoices for multiple track IDs
router.post('/by-tracks', invoiceController.getInvoicesByTrackIds);

module.exports = router;
