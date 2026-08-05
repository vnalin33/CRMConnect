/**
 * Admin Authentication Middleware
 * Validates JWT token for admin routes
 * Ported from Oneassist-CRMConnect backend
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function adminAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
}

module.exports = { adminAuthenticate };
