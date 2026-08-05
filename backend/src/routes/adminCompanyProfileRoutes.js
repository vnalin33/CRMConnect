/**
 * Admin Company Profile Routes
 * GET  /api/admin/company-profile       — Get the saved company profile
 * PUT  /api/admin/company-profile       — Update the company profile
 */
const express = require('express');
const router = express.Router();
const CompanyProfileModel = require('../models/companyProfileModel');
const { adminAuthenticate } = require('../middleware/adminAuthMiddleware');

// Require authentication for company profile management
router.use(adminAuthenticate);

router.get('/', async (req, res, next) => {
  try {
    const profile = await CompanyProfileModel.get();
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const data = req.body;
    const updated = await CompanyProfileModel.update(data);
    res.json({ success: true, message: 'Company profile saved', data: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
