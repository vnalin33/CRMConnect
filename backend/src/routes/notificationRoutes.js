const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/poll', notificationController.pollNewNotifications);
router.put('/mark-all-read', notificationController.markAllRead);
router.delete('/clear-all', notificationController.clearAll);
router.put('/:id/read', notificationController.markRead);

module.exports = router;
