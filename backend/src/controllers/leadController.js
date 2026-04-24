const leadService = require('../services/leadService');
const leadTrackService = require('../services/leadTrackService');

const createLead = async (req, res, next) => {
  try {
    const connectorId = req.user.id; // From auth middleware
    const leadData = req.body;
    
    const newLead = await leadService.createLead(connectorId, leadData);
    
    res.status(201).json({
      success: true,
      data: newLead,
      message: 'Lead created successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getUnassignedContacts = async (req, res, next) => {
  try {
    // req.user contains the authenticated connector
    const contacts = await leadService.getUnassignedContacts(req.user);
    
    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/my — all leads for the logged-in connector with status + progress
 */
const getMyLeads = async (req, res, next) => {
  try {
    const leads = await leadTrackService.getMyLeads(req.user.id);
    res.status(200).json({
      success: true,
      data: leads,
      count: leads.length,
      statusMap: leadTrackService.STATUS_MAP,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id — full lead detail + history
 */
const getLeadDetail = async (req, res, next) => {
  try {
    const detail = await leadTrackService.getLeadDetail(parseInt(req.params.id, 10));
    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads/:id/assign — assign a lead
 */
const assignLead = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { notes } = req.body;
    const result = await leadTrackService.assignLead(leadId, req.user.id, notes);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Lead assigned successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/leads/:id/status — update lead status
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    if (!status) {
      const error = new Error('Status is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await leadTrackService.updateStatus(leadId, parseInt(status, 10), notes, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Lead status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const success = await leadService.deleteLead(leadId);
    
    if (!success) {
      const error = new Error('Lead not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getUnassignedContacts,
  getMyLeads,
  getLeadDetail,
  assignLead,
  updateLeadStatus,
  deleteLead,
};
