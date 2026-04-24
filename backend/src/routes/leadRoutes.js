const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// All lead routes require authentication
router.use(protect);

// POST /api/leads -> Create a new lead (Add Contact)
router.post('/', leadController.createLead);

// GET /api/leads/my -> Get all leads for the logged-in connector with status + progress
router.get('/my', leadController.getMyLeads);

// GET /api/leads/unassigned -> Get unassigned contact list for the connector
router.get('/unassigned', leadController.getUnassignedContacts);

// GET /api/leads/:id -> Full lead detail + history
router.get('/:id', leadController.getLeadDetail);

// POST /api/leads/:id/assign route removed — only CRM web admin can assign leads

// PUT /api/leads/:id/status -> Update lead status
router.put('/:id/status', leadController.updateLeadStatus);

// DELETE /api/leads/:id -> Delete a lead
router.delete('/:id', leadController.deleteLead);

module.exports = router;
