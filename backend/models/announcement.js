const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({

  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },

  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  versionKey: false
});

// Fast lookup
announcementSchema.index({ society: 1, createdAt: -1 }); //-1 ascending order of createdAt, so latest announcements come first

module.exports = mongoose.model('Announcement', announcementSchema);