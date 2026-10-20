const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['FINE', 'MAINTENANCE', 'COMPLAINT', 'ANNOUNCEMENT', 'FEEDBACK', 'FUTURE_PLAN', 'GENERAL'],
    default: 'GENERAL'
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);