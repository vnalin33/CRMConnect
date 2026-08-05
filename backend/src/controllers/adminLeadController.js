/**
 * Admin Lead Controller - Handles admin lead/contact CRUD operations
 * Ported from Oneassist-CRMConnect backend
 */
const AdminLeadModel = require('../models/adminLeadModel');

const AdminLeadController = {
  async create(req, res, next) {
    try {
      const leadData = { ...req.body, created_by: req.user.id };
      const occupationData = leadData.occupation;
      delete leadData.occupation;

      const lead = await AdminLeadModel.create(leadData);

      let occupationResult = null;
      if (occupationData && lead.id) {
        try {
          occupationResult = await AdminLeadModel.createOccupation(lead.id, occupationData);
        } catch (occErr) {
          console.error('⚠️ Failed to save occupation details:', occErr.message);
        }
      }

      res.status(201).json({ success: true, message: 'Lead created', lead, occupationSaved: !!occupationResult });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, status, search, loantype } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (search) filters.search = search;
      if (loantype) filters.loantype = loantype;

      const result = await AdminLeadModel.findAll(filters, parseInt(page), parseInt(limit));
      res.json({
        success: true,
        ...result,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const lead = await AdminLeadModel.findById(req.params.id);
      if (!lead) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      res.json({ success: true, lead });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await AdminLeadModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(400).json({ success: false, message: 'No changes made' });
      }
      const lead = await AdminLeadModel.findById(req.params.id);
      res.json({ success: true, message: 'Lead updated', lead });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await AdminLeadModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }
      res.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AdminLeadController;
