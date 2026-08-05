/**
 * Admin Auth Controller - Handles admin authentication
 * Ported from Oneassist-CRMConnect backend, adapted to use CRMConnect's env config
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');
const AdminUserModel = require('../models/adminUserModel');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const SALT_ROUNDS = 12;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email || user.emailid, role: user.role || 'connector', name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN || '30m' }
  );
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

const AdminAuthController = {
  /**
   * POST /api/admin/auth/login
   */
  async login(req, res, next) {
    try {
      let { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      email = (email || '').trim();
      if (email.includes('@')) {
        email = email.toLowerCase();
      }

      // 1. Try capital "Connector" table first
      try {
        const connectorResult = await db.query(
          'SELECT * FROM "Connector" WHERE email = $1 OR phone = $1 LIMIT 1',
          [email]
        );

        if (connectorResult.rows.length > 0) {
          const connector = connectorResult.rows[0];
          const isValid = await bcrypt.compare(password, connector.password);
          if (isValid) {
            const token = generateToken({
              id: connector.id,
              email: connector.email,
              role: 'admin',
              name: connector.employeename,
            });
            return res.json({
              success: true,
              message: 'Login successful',
              user: {
                id: connector.id,
                name: connector.employeename,
                email: connector.email,
                phone: connector.phone || '',
                role: 'admin',
              },
              token,
            });
          }
        }
      } catch (connErr) {
        console.error('⚠️ Connector table query failed (skipping):', connErr.message);
      }

      // 2. Try users table (admin/system users)
      try {
        const user = await AdminUserModel.findByEmail(email);
        if (user) {
          const isValid = await AdminUserModel.verifyPassword(password, user.password);
          if (isValid) {
            const token = generateToken(user);
            return res.json({
              success: true,
              message: 'Login successful',
              user: sanitizeUser(user),
              token,
            });
          }
        }
      } catch (userErr) {
        console.error('⚠️ Users table query failed (skipping):', userErr.message);
      }

      // 3. Try employeedetails table
      try {
        const empResult = await db.query(
          'SELECT * FROM employeedetails WHERE emailid = $1 LIMIT 1',
          [email]
        );

        if (empResult.rows.length > 0) {
          const emp = empResult.rows[0];
          const isValid = await bcrypt.compare(password, emp.password);
          if (isValid) {
            const token = generateToken({
              id: emp.id,
              email: emp.emailid,
              role: 'employee',
              name: emp.name,
            });
            return res.json({
              success: true,
              message: 'Login successful',
              user: {
                id: emp.id,
                name: emp.name,
                email: emp.emailid,
                role: 'employee',
              },
              token,
            });
          }
        }
      } catch (empErr) {
        console.error('⚠️ Employee table query failed (skipping):', empErr.message);
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    } catch (error) {
      console.error('🔴 ADMIN LOGIN ERROR:', error.message);
      next(error);
    }
  },

  /**
   * POST /api/admin/auth/org-signup
   */
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: name, email, password, phone',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      const existingCapital = await db.query(
        'SELECT id FROM "Connector" WHERE email = $1 LIMIT 1',
        [email]
      );

      if (existingCapital.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const existingPhoneCapital = await db.query(
        'SELECT id FROM "Connector" WHERE phone = $1 LIMIT 1',
        [phone]
      );

      if (existingPhoneCapital.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this phone number already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await db.query(
        `INSERT INTO "Connector" (username, employeename, email, password, proj, phone, "createdDate", "updatedDate")
         VALUES ($1, $2, $3, $4, 'CRM', $5, NOW(), NOW()) RETURNING id`,
        [email, name, email, hashedPassword, phone]
      );

      const newConnector = {
        id: result.rows[0].id,
        name,
        email,
        phone,
        role: 'admin',
      };

      const token = generateToken({
        id: newConnector.id,
        email,
        role: 'admin',
        name,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: newConnector,
        token,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/auth/validate
   */
  async validate(req, res, next) {
    try {
      const user = await AdminUserModel.findById(req.user.id);
      if (user) {
        return res.json({ success: true, user: sanitizeUser(user) });
      }

      const capResult = await db.query(
        'SELECT id, employeename as name, email FROM "Connector" WHERE id = $1 LIMIT 1',
        [req.user.id]
      );

      if (capResult.rows.length > 0) {
        const conn = capResult.rows[0];
        return res.json({
          success: true,
          user: { ...conn, role: 'admin' },
        });
      }

      return res.status(401).json({ success: false, message: 'User not found' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const email = (req.body.email || '').trim().toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const successMsg = 'If an account exists with this email, a password reset link has been sent.';

      let userName = 'User';

      const capRes = await db.query('SELECT id, employeename as name, email FROM "Connector" WHERE email = $1 LIMIT 1', [email]);
      if (capRes.rows.length > 0) {
        userName = capRes.rows[0].name || 'User';
      } else {
        const userRes = await db.query('SELECT id, name, email FROM users WHERE email = $1 LIMIT 1', [email]);
        if (userRes.rows.length > 0) {
          userName = userRes.rows[0].name || 'User';
        } else {
          return res.json({ success: true, message: successMsg });
        }
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.query('UPDATE password_reset_tokens SET used = true WHERE email = $1 AND used = false', [email]);

      await db.query(
        'INSERT INTO password_reset_tokens (email, token_hash, expires_at) VALUES ($1, $2, $3)',
        [email, tokenHash, expiresAt]
      );

      try {
        const { sendAdminPasswordResetEmail } = require('../services/adminEmailService');
        await sendAdminPasswordResetEmail(email, resetToken, userName);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email. Please try again later.',
        });
      }

      res.json({ success: true, message: successMsg });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password: pw, newPassword } = req.body;
      const password = pw || newPassword;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const tokenRes = await db.query(
        'SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND used = false AND expires_at > NOW() LIMIT 1',
        [tokenHash]
      );

      if (tokenRes.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.',
        });
      }

      const tokenRecord = tokenRes.rows[0];
      const email = tokenRecord.email;

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      let updated = false;

      const capUpdate = await db.query(
        'UPDATE "Connector" SET password = $1, "updatedDate" = NOW() WHERE email = $2',
        [hashedPassword, email]
      );
      if (capUpdate.rowCount > 0) updated = true;

      const userUpdate = await db.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
      if (userUpdate.rowCount > 0) updated = true;

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No account found with this email.',
        });
      }

      await db.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenRecord.id]);

      res.json({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/auth/logout
   */
  async logout(req, res) {
    res.json({ success: true, message: 'Logged out successfully' });
  },
};

module.exports = AdminAuthController;
