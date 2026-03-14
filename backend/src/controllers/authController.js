const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      const error = new Error('Email/Mobile and password are required');
      error.statusCode = 400;
      throw error;
    }

    const data = await authService.login(identifier, password);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }
    const result = await authService.forgotPassword(email);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      const error = new Error('Token and new password are required');
      error.statusCode = 400;
      throw error;
    }
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
