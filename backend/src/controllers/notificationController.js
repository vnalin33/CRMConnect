const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res) => {
    try {
        const connectorId = req.user.id;
        const notifications = await notificationModel.getNotificationsByConnector(connectorId);
        const unreadCount = await notificationModel.getUnreadCount(connectorId);
        
        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

/**
 * Poll for new notifications since a given ID.
 * GET /notifications/poll?since_id=123
 */
const pollNewNotifications = async (req, res) => {
    try {
        const connectorId = req.user.id;
        const sinceId = parseInt(req.query.since_id) || 0;
        const newNotifications = await notificationModel.getNewSince(connectorId, sinceId);
        const unreadCount = await notificationModel.getUnreadCount(connectorId);

        res.json({
            success: true,
            data: newNotifications,
            unreadCount
        });
    } catch (error) {
        console.error('Poll Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Failed to poll notifications' });
    }
};

const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationModel.markAsRead(id);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
};

const markAllRead = async (req, res) => {
    try {
        const connectorId = req.user.id;
        await notificationModel.markAllAsRead(connectorId);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
};

const clearAll = async (req, res) => {
    try {
        const connectorId = req.user.id;
        await notificationModel.clearAll(connectorId);
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        console.error('Clear All Error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
};

module.exports = {
    getNotifications,
    pollNewNotifications,
    markRead,
    markAllRead,
    clearAll
};
