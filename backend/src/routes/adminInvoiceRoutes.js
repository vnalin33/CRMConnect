/**
 * Admin Invoice Routes - Invoice management endpoints for admin panel
 */
const express = require('express');
const router = express.Router();
const AdminInvoiceController = require('../controllers/adminInvoiceController');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');

// All invoice admin routes require authentication
router.use(adminAuthenticate);

router.get('/', AdminInvoiceController.getAllRequests);
router.get('/stats', AdminInvoiceController.getStats);

// Mobile app route: get invoice PDF by track_id (must be before /:id)
router.get('/by-track/:trackId/invoice-pdf', AdminInvoiceController.getInvoicePdfByTrackId);

router.get('/:id', AdminInvoiceController.getRequestById);

router.put('/:id/approve', AdminInvoiceController.approveRequest);
router.put('/:id/reject', AdminInvoiceController.rejectRequest);
router.put('/:id/paid', AdminInvoiceController.markAsPaid);

router.put('/:id/billing', AdminInvoiceController.updateBillingInfo);
router.get('/:id/invoice-pdf', AdminInvoiceController.getInvoicePdf);
router.get('/:id/invoice-html', AdminInvoiceController.getInvoicePdf);

module.exports = router;
