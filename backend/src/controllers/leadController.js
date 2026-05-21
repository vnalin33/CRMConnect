const leadService = require('../services/leadService');
const leadTrackService = require('../services/leadTrackService');
const { createNotification } = require('../models/notificationModel');

const createLead = async (req, res, next) => {
  try {
    const connectorId = req.user.id; // From auth middleware
    const leadData = req.body;
    
    const newLead = await leadService.createLead(connectorId, leadData);
    
    // Real-time Push
    const io = req.app.get('io');
    if (io) {
      io.emit('lead_added', { connectorId, leadId: newLead.id });
      // Notify specifically the connector's room if connected
      io.to(`user_${connectorId}`).emit('lead_added', { leadId: newLead.id });
    }

    res.status(201).json({
      success: true,
      data: newLead,
      message: 'Lead created successfully',
    });

    // Fire-and-forget notification
    createNotification(
      connectorId,
      'New Lead Created',
      `Lead "${leadData.name || 'New Contact'}" has been submitted successfully.`,
      'LEAD',
      { leadId: newLead.id }
    ).catch(() => {});
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
    
    // Real-time Push
    const io = req.app.get('io');
    if (io) {
      io.emit('lead_updated', { leadId, action: 'assigned' });
      io.to(`user_${req.user.id}`).emit('lead_updated', { leadId, action: 'assigned' });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Lead assigned successfully',
    });

    // Fire-and-forget notification
    createNotification(
      req.user.id,
      'Lead Assigned',
      `Lead #${leadId} has been assigned to you.`,
      'LEAD',
      { leadId }
    ).catch(() => {});
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
    
    // Real-time Push
    const io = req.app.get('io');
    if (io) {
      io.emit('lead_updated', { leadId, status, connectorId: req.user.id });
      io.to(`user_${req.user.id}`).emit('lead_updated', { leadId, status });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Lead status updated successfully',
    });

    // Fire-and-forget notification
    const statusLabel = leadTrackService.STATUS_MAP?.[parseInt(status, 10)] || `Status ${status}`;
    createNotification(
      req.user.id,
      'Lead Status Updated',
      `Lead #${leadId} status changed to "${statusLabel}".`,
      'LEAD',
      { leadId, status }
    ).catch(() => {});
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

    // Real-time Push
    const io = req.app.get('io');
    if (io) {
      io.emit('lead_updated', { leadId, action: 'deleted' });
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
