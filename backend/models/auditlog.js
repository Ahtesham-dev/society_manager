const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
});

auditLogSchema.index({ society: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);