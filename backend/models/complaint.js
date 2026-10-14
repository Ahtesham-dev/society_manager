const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({

  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },

  // WHO filed this complaint — HIDDEN by default (privacy requirement)
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false          // Secretary/Chairman will have to explicitly request this
  },

  // Which flat is being reported
  reportedFlat: {
    type: String,
    required: [true, 'Reported flat number is required'],
    trim: true
  },

  // Optional - if complainant knows exactly which user they're reporting
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Which rule is being violated
  rule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rule',
    required: true
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },

  // Array of file paths/URLs (photos, documents)
  evidence: [{
    type: String
  }],

  // Auto-generated readable ID, e.g. "C00001"
  complaintId: {
    type: String,
    unique: true
  },

  status: {
    type: String,
    enum: [
      'SUBMITTED', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED', 
      'CONFIRMED', 'REJECTED', 'ACTION_TAKEN', 'RESOLVED'
    ],
    default: 'SUBMITTED'
  },

  //who reviewed this complaint
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  reviewNotes: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  versionKey: false
});

complaintSchema.index({ society: 1, status: 1 });
complaintSchema.index({ society: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);