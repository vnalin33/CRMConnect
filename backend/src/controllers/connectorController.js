const connectorService = require('../services/connectorService');

const getProfile = async (req, res, next) => {
  try {
    const profile = await connectorService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const updatePersonalInfo = async (req, res, next) => {
  try {
    const { name, emailid, mobilenumber, location } = req.body;
    const updated = await connectorService.updatePersonalInfo(req.user.id, {
      name, emailid, mobilenumber, location,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const updateBankDetails = async (req, res, next) => {
  try {
    const { ifsc, accountnumber, branch } = req.body;
    const updated = await connectorService.updateBankDetails(req.user.id, {
      ifsc, accountnumber, branch,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      const error = new Error('Old password and new password are required');
      error.statusCode = 400;
      throw error;
    }

    const result = await connectorService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No profile picture provided');
      error.statusCode = 400;
      throw error;
    }

    const pictureUrl = `/uploads/profile_pictures/${req.file.filename}`;
    const result = await connectorService.uploadProfilePicture(req.user.id, pictureUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updatePersonalInfo,
  updateBankDetails,
  changePassword,
  uploadProfilePicture,
};
