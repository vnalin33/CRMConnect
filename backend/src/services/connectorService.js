const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const connectorModel = require('../models/connectorModel');

const SALT_ROUNDS = 10;

/**
 * Fetch profile data (no password) for the logged-in connector user
 */
const getProfile = async (userId) => {
  const user = await connectorModel.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch real-time stats using the same logic as the Leads tab
  const leadTrackModel = require('../models/leadTrackModel');
  const allLeads = await leadTrackModel.getLeadsByConnector(userId);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let totalLeads = 0;
  let closedDeals = 0;
  let thisMonth = 0;

  for (const lead of allLeads) {
    totalLeads++;
    
    // Status 18 = Completed (after disbursement)
    const status = lead.track_status || lead.lead_status || 1;
    if (status === 18) {
        closedDeals++;
    }
    
    const leadDate = new Date(lead.createdon);
    if (leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear) {
      thisMonth++;
    }
  }

  // Attach stats to the user object
  user.stats = {
    totalLeads,
    closedDeals,
    thisMonth
  };

  return user;
};

/**
 * Update personal info fields: name, emailid, mobilenumber, location
 */
const updatePersonalInfo = async (userId, data) => {
  const { name, emailid, mobilenumber, location } = data;

  if (!name || !name.trim()) {
    const error = new Error('Name is required');
    error.statusCode = 400;
    throw error;
  }

  // Check email uniqueness (exclude current user)
  if (emailid && emailid.trim()) {
    const existingEmail = await connectorModel.findByEmailExcludingUser(emailid.trim(), userId);
    if (existingEmail) {
      const error = new Error('This email is already used by another account.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Check mobile uniqueness (exclude current user)
  if (mobilenumber && mobilenumber.trim()) {
    const existingMobile = await connectorModel.findByMobileExcludingUser(mobilenumber.trim(), userId);
    if (existingMobile) {
      const error = new Error('This phone number is already used by another account.');
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await connectorModel.updatePersonalInfo(userId, {
    name: name.trim(),
    emailid: emailid ? emailid.trim() : null,
    mobilenumber: mobilenumber ? mobilenumber.trim() : null,
    location: location ? location.trim() : null,
  });

  return updated;
};

/**
 * Update bank detail fields: ifsc, accountnumber, branch
 */
const updateBankDetails = async (userId, data) => {
  const { ifsc, accountnumber, branch } = data;

  const updated = await connectorModel.updateBankDetails(userId, {
    ifsc: ifsc ? ifsc.trim().toUpperCase() : null,
    accountnumber: accountnumber ? accountnumber.trim() : null,
    branch: branch ? branch.trim() : null,
  });

  return updated;
};

/**
 * Change password — verifies old password (supports both plain-text and bcrypt),
 * then stores the new password as a bcrypt hash.
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await connectorModel.findByEmailOrMobile(userId.toString());

  // We need the full row with password, so query directly
  const db = require('../config/db');
  const { rows } = await db.query('SELECT id, password FROM connector WHERE id = $1', [userId]);
  const row = rows[0];

  if (!row) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Support both bcrypt-hashed and plain-text passwords for backward compatibility
  let isMatch = false;
  if (row.password && row.password.startsWith('$2')) {
    // bcrypt hash
    isMatch = await bcrypt.compare(oldPassword, row.password);
  } else {
    // plain-text comparison
    isMatch = (oldPassword === row.password);
  }

  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }

  if (!newPassword || newPassword.length < 4) {
    const error = new Error('New password must be at least 4 characters');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await connectorModel.updatePassword(userId, hashedPassword);

  return { message: 'Password changed successfully' };
};

const uploadProfilePicture = async (userId, pictureUrl) => {
  // Get current profile to check for existing picture
  const user = await connectorModel.findById(userId);
  
  // If there's an old picture, delete it
  if (user && user.profile_picture) {
    try {
      const oldPath = path.join(__dirname, '../../', user.profile_picture);
      await fs.access(oldPath); // Check if file exists
      await fs.unlink(oldPath);
      console.log(`Deleted old profile picture: ${oldPath}`);
    } catch (err) {
      // Ignore errors if file doesn't exist or can't be deleted
      console.warn(`Could not delete old profile picture ${user.profile_picture}:`, err.message);
    }
  }

  const updated = await connectorModel.updateProfilePicture(userId, pictureUrl);
  return updated;
};

module.exports = {
  getProfile,
  updatePersonalInfo,
  updateBankDetails,
  changePassword,
  uploadProfilePicture,
};
