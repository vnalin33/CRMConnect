const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectorModel = require('../models/connectorModel');
const userModel = require('../models/userModel');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { sendPasswordResetEmail } = require('./emailService');

const RESET_TOKEN_EXPIRY_MINUTES = 15;

/**
 * Login — authenticates against the connector table.
 * Supports both plain-text and bcrypt-hashed passwords for backward compatibility.
 */
const login = async (identifier, password) => {
  const user = await connectorModel.findByEmailOrMobile(identifier);

  if (!user) {
    const error = new Error('Email or phone number is not registered. Please sign up or check your details.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isactive) {
    const error = new Error('Account is deactivated. Please contact admin.');
    error.statusCode = 403;
    throw error;
  }

  // Support both bcrypt-hashed and plain-text passwords
  let isMatch = false;
  if (user.password && user.password.startsWith('$2')) {
    isMatch = await bcrypt.compare(password, user.password);
  } else {
    isMatch = (password === user.password);
  }

  if (!isMatch) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.emailid, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.emailid,
      mobile: user.mobilenumber,
      location: user.location,
      ifsc: user.ifsc,
      accountnumber: user.accountnumber,
      branch: user.branch,
      profile_picture: user.profile_picture,
    },
  };
};

/**
 * Register – handles new account creation.
 */
const register = async ({ name, email, phone, password }) => {
  // Check if email already exists
  const existingEmail = await connectorModel.findByEmail(email);
  if (existingEmail) {
    const error = new Error('This email is already registered. Please use a different email or login.');
    error.statusCode = 409;
    throw error;
  }

  // Check if phone number already exists
  const existingPhone = await connectorModel.findByMobile(phone);
  if (existingPhone) {
    const error = new Error('This phone number is already registered. Please use a different number.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const newUser = await connectorModel.create({
    name,
    emailid: email,
    mobilenumber: phone,
    password: hashedPassword,
    isactive: true,
  });

  // Generate token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.emailid, name: newUser.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.emailid,
      mobile: newUser.mobilenumber,
    },
  };
};

/**
 * Handles "Forgot Password" — generates a reset token, stores hash in DB, sends email
 */
const forgotPassword = async (email) => {
  const user = await connectorModel.findByEmail(email);

  if (!user) {
    const error = new Error('No account found with this email address. Please check the email or sign up.');
    error.statusCode = 404;
    throw error;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await connectorModel.saveResetToken(user.id, hashedToken, expiry);
  await sendPasswordResetEmail(user.emailid, rawToken);

  return { message: 'If an account with that email exists, a reset link has been sent.' };
};

/**
 * Handles "Reset Password" — validates token, updates password in DB
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await connectorModel.findUserByResetToken(hashedToken);

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await connectorModel.updatePassword(user.id, hashedPassword);

  const jwtToken = jwt.sign(
    { id: user.id, email: user.emailid, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    message: 'Password has been reset successfully.',
    token: jwtToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.emailid,
      mobile: user.mobilenumber,
      location: user.location,
      ifsc: user.ifsc,
      accountnumber: user.accountnumber,
      branch: user.branch,
      profile_picture: user.profile_picture,
    }
  };
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
