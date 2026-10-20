const Notification = require('../models/notification');

// Flow: Create one notification document for a specific recipient, errors logged not thrown
const createNotification = async ({ society, recipient, message, type, link }) => {
  try {
    await Notification.create({ society, recipient, message, type, link });
  } catch (error) {
    console.error('Create Notification Error:', error);
  }
};

module.exports = { createNotification };