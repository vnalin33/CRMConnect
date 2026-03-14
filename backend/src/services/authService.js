const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const login = async (identifier, password) => {
  const user = await userModel.findUserByEmailOrMobile(identifier);

  if (!user) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);


  if (!isMatch) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      rating: user.rating,
      isTopPerformer: user.is_top_performer,
    },
  };
};

const crypto = require('crypto');
const emailService = require('./emailService');

const forgotPassword = async (email) => {
  const user = await userModel.findUserByEmailOrMobile(email);

  if (!user) {
    const error = new Error('User not found with this email');
    error.statusCode = 404;
    throw error;
  }

  // Generate 32-byte secure hex token for email link
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour from now

  await userModel.updateResetToken(user.email, token, expiry);
  await emailService.sendResetEmail(user.email, token);

  return { message: 'Reset token sent to email' };
};

const resetPassword = async (token, newPassword) => {
  const user = await userModel.findUserByResetToken(token);

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(user.id, hashedPassword);

  return { message: 'Password reset successful' };
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
