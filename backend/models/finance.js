const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  recordId: {
    type: String,
    unique: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

financeSchema.index({ society: 1, type: 1 });
financeSchema.index({ society: 1, date: -1 });

module.exports = mongoose.model('Finance', financeSchema);