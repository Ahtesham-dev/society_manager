const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({

  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },

  // Who owes this fine
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  flatNo: {
    type: String,
    required: [true, 'Flat number is required'],
    trim: true
  },

  //links back to the complaint that caused this fine
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },

  //which rule was violated
  rule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rule'
  },

  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be greater than 0']
  },

  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },

  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },

  // Auto-generated readable ID, e.g. "F00001"
  fineId: {
    type: String,
    unique: true
  },

  status: {
    type: String,
    enum: ['PENDING', 'PAYMENT_SUBMITTED', 'PAID', 'REJECTED'],
    default: 'PENDING'
  },

  // Resident uploads this when they pay
  paymentProof: {
    type: String
  },

  paidDate: {
    type: Date
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  //  who verified the payment
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  versionKey: false
});

fineSchema.index({ society: 1, resident: 1 });
fineSchema.index({ society: 1, status: 1 });

module.exports = mongoose.model('Fine', fineSchema);