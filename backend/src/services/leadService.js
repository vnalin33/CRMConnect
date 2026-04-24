const leadModel = require('../models/leadModel');

const createLead = async (connectorId, leadData) => {
  if (!leadData.firstname || !leadData.mobilenumber) {
    throw new Error('First name and mobile number are required');
  }

  // Check for duplicate mobile number
  const existing = await leadModel.findByMobile(leadData.mobilenumber);
  if (existing) {
    const error = new Error(
      `A lead with this mobile number already exists (${existing.firstname} ${existing.lastname || ''})`.trim()
    );
    error.statusCode = 409;
    throw error;
  }

  const newLead = await leadModel.create({
    ...leadData,
    connectorid: connectorId,
  });

  return newLead;
};

const getUnassignedContacts = async (connector) => {
  // Usually the orgid is tied to the connector/admin. 
  // Assuming 1 as a default if orgid is not on the user object, or use user.orgid.
  // We'll use 1 for now based on standard defaults, as we only have connector info.
  const orgId = connector.organizationid || 1; 
  return await leadModel.getUnassignedContacts(orgId);
};

const deleteLead = async (leadId) => {
  return await leadModel.deleteLead(leadId);
};

module.exports = {
  createLead,
  getUnassignedContacts,
  deleteLead,
};
