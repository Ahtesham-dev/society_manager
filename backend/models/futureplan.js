const mongoose = require('mongoose');

const futurePlanSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  targetDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PROPOSED'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      voteType: {
        type: String,
        enum: ['LIKE', 'DISLIKE']
      }
    }
  ]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true }
});

futurePlanSchema.virtual('likeCount').get(function () {
  return this.votes.filter((v) => v.voteType === 'LIKE').length;
});

futurePlanSchema.virtual('dislikeCount').get(function () {
  return this.votes.filter((v) => v.voteType === 'DISLIKE').length;
});

futurePlanSchema.index({ society: 1, status: 1 });

module.exports = mongoose.model('FuturePlan', futurePlanSchema);