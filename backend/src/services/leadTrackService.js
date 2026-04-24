const leadTrackModel = require('../models/leadTrackModel');

const { STATUS_MAP } = leadTrackModel;

/**
 * Enriches a raw DB row with status label and progress percentage.
 */
const enrichWithProgress = (row) => {
  const statusCode = row.track_status || row.lead_status || 1;
  const mapped = STATUS_MAP[statusCode] || { label: 'Unknown', progress: 0 };
  return {
    ...row,
    statusCode,
    statusLabel: mapped.label,
    progress: mapped.progress,
  };
};

/**
 * Get all leads for a connector, enriched with status + progress.
 */
const getMyLeads = async (connectorId) => {
  const leads = await leadTrackModel.getLeadsByConnector(connectorId);
  return leads.map(enrichWithProgress);
};

/**
 * Get full lead detail with history.
 */
const getLeadDetail = async (leadId) => {
  const lead = await leadTrackModel.getLeadById(leadId);
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  const history = await leadTrackModel.getLeadTrackHistory(leadId);

  const statusCode = lead.track_status || lead.status || 1;
  const mapped = STATUS_MAP[statusCode] || { label: 'Unknown', progress: 0 };

  return {
    lead: {
      ...lead,
      statusCode,
      statusLabel: mapped.label,
      progress: mapped.progress,
    },
    history: history.map((h) => ({
      ...h,
      statusLabel: (STATUS_MAP[h.status] || { label: 'Unknown' }).label,
      progress: (STATUS_MAP[h.status] || { progress: 0 }).progress,
    })),
  };
};

/**
 * Assign a lead to a user.
 */
const assignLead = async (leadId, connectorId, notes) => {
  // Fetch original lead to get customer name
  const lead = await leadTrackModel.getLeadById(leadId);
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  const customerName = `${lead.firstname || ''} ${lead.lastname || ''}`.trim();

  const result = await leadTrackModel.assignLead({
    leadId,
    contactFollowedBy: connectorId,
    organizationId: lead.organizationid || 1001,
    notes: notes || `Assigned`,
    customerName,
  });

  return {
    ...result,
    statusLabel: STATUS_MAP[2].label,
    progress: STATUS_MAP[2].progress,
  };
};

/**
 * Update the status of a tracked lead.
 */
const updateStatus = async (leadId, newStatus, notes, userId) => {
  if (!STATUS_MAP[newStatus]) {
    const error = new Error(`Invalid status code: ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  // Find the track record for this lead
  const lead = await leadTrackModel.getLeadById(leadId);
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  if (!lead.track_id) {
    const error = new Error('Lead has not been assigned yet. Assign it first.');
    error.statusCode = 400;
    throw error;
  }

  const result = await leadTrackModel.updateLeadStatus({
    trackId: lead.track_id,
    leadId,
    newStatus,
    notes,
    userId,
  });

  const mapped = STATUS_MAP[newStatus];
  return {
    ...result,
    statusLabel: mapped.label,
    progress: mapped.progress,
  };
};

module.exports = {
  getMyLeads,
  getLeadDetail,
  assignLead,
  updateStatus,
  STATUS_MAP,
};
