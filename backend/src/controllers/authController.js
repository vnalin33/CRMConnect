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

module.exports = {
  login,
};
