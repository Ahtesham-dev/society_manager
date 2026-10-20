const Notification = require('../models/notification');

// Flow: Find notifications for logged-in user → Sort newest first → Return list with unread count
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      notifications
    });

  } catch (error) {
    console.error('Get My Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

// Flow: Find notification owned by this user → Mark isRead true → Save
const markAsRead = async (req, res) => {
  try {
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

  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification'
    });
  }
};

module.exports = { getMyNotifications, markAsRead };