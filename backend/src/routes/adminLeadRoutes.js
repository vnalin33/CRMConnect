/**
 * Admin Lead Routes - Lead management endpoints for admin panel
 */
const express = require('express');
const router = express.Router();
const AdminLeadController = require('../controllers/adminLeadController');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public read access for CRM dashboard
router.get('/', AdminLeadController.getAll);
router.get('/:id', AdminLeadController.getById);

// Protected routes
router.use(adminAuthenticate);

router.post('/', AdminLeadController.create);
router.put('/:id', AdminLeadController.update);
router.delete('/:id', roleMiddleware('admin'), AdminLeadController.delete);

module.exports = router;
