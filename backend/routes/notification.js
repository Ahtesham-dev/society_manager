const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controller/notification');
const { protect } = require('../middleware/auth');

//GET /api/notifications
//Logged-in user views their own notifications, across all societies
router.get('/', protect, getMyNotifications);

//PATCH /api/notifications/:notificationId/read
//Logged-in user marks one of their own notifications as read
router.patch('/:notificationId/read', protect, markAsRead);

module.exports = router;