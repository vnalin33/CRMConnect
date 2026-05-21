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

  // Extract occupation data before creating the lead
  const occupation = leadData.occupation || null;
  const { occupation: _, ...leadFields } = leadData;

  const newLead = await leadModel.create({
    ...leadFields,
    connectorid: connectorId,
  });

  // Insert occupation details if provided
  if (occupation && occupation.occupationtype) {
    try {
      const db = require('../config/database');
      await db.query(
        `INSERT INTO leadoccupationdetails (
          leadpersonal, occupationtype, incomeamount, otherincomeamount, organizationid,
          compname, compcat, designation, totalexperience, currentexperience,
          salarybank, salarymode,
          businessname, businesstype, annualturnover, businessvintage,
          companyaddress, officetelephonenumber, companygstinnumber
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          newLead.id,
          occupation.occupationtype,
          occupation.incomeamount || 0,
          occupation.otherincomeamount || 0,
          connectorId,
          occupation.compname,
          occupation.compcat,
          occupation.designation,
          occupation.totalexperience,
          occupation.currentexperience,
          occupation.salarybank,
          occupation.salarymode,
          occupation.businessname,
          occupation.businesstype,
          occupation.annualturnover,
          occupation.businessvintage,
          occupation.companyaddress,
          occupation.officetelephonenumber,
          occupation.companygstinnumber,
        ]
      );
    } catch (err) {
      console.error('Failed to save occupation details:', err.message);
    }
  }

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
