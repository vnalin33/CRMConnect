/**
 * Admin User Controller - Handles admin user profile operations
 * Ported from Oneassist-CRMConnect backend
 */
const AdminUserModel = require('../models/adminUserModel');

const AdminUserController = {
  async getProfile(req, res, next) {
    try {
      const user = await AdminUserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, phone } = req.body;
      const updated = await AdminUserModel.update(req.user.id, { name, phone });
      if (!updated) {
        return res.status(400).json({ success: false, message: 'No changes made' });
      }
      const user = await AdminUserModel.findById(req.user.id);
      res.json({ success: true, message: 'Profile updated', user });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await AdminUserModel.findByEmail(req.user.email);
      const isValid = await AdminUserModel.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      await AdminUserModel.updatePassword(req.user.id, newPassword);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getConnectors(req, res, next) {
    try {
      const connectors = await AdminUserModel.findConnectors();
      res.json({ success: true, connectors });
    } catch (error) {
      next(error);
    }
  },

  async getNotifications(req, res, next) {
    try {
      const notifications = await AdminUserModel.getNotifications(req.user.id, req.user.role);
      const unreadCount = await AdminUserModel.getUnreadNotificationCount(req.user.id, req.user.role);
      res.json({ success: true, notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  },

  async markNotificationsRead(req, res, next) {
    try {
      await AdminUserModel.markNotificationsRead(req.user.id, req.user.role);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      const deleted = await AdminUserModel.deleteNotification(req.params.id, req.user.id, req.user.role);
      if (deleted === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  },

  async clearAllNotifications(req, res, next) {
    try {
      await AdminUserModel.clearAllNotifications(req.user.id, req.user.role);
      res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AdminUserController;
