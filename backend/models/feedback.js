const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false
  },
  category: {
    type: String,
    enum: ['SUGGESTION', 'ISSUE', 'APPRECIATION', 'OTHER'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  response: {
    type: String,
    trim: true
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

feedbackSchema.index({ society: 1, status: 1 });
feedbackSchema.index({ society: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);