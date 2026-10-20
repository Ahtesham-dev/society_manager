const Notification = require('../models/notification');
const asyncHandler = require('../utils/asyncHandler');

// Flow: Find notifications for logged-in user → Sort newest first → Return list with unread count
const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      notifications
    });

});

// Flow: Find notification owned by this user → Mark isRead true → Save
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

});

module.exports = { getMyNotifications, markAsRead };