const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flatNo: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  dueDate: {
    type: Date,
    required: true
  },
  maintenanceId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAYMENT_SUBMITTED', 'PAID', 'REJECTED'],
    default: 'PENDING'
  },
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
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

maintenanceSchema.index({ society: 1, resident: 1 });
maintenanceSchema.index({ society: 1, status: 1 });
maintenanceSchema.index({ society: 1, resident: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);