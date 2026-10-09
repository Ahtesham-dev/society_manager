const mongoose = require('mongoose');

const rulecreationSchema = new mongoose.Schema({
  
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'PARKING', 'NOISE', 'VISITORS', 'PETS', 'SECURITY', 
      'WASTE', 'COMMON_AREAS', 'RENOVATION', 'MAINTENANCE', 'EMERGENCY'
    ]
  },

  title: {
    type: String,
    required: [true, 'Rule title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },

  description: {
    type: String,
    required: [true, 'Rule description is required'],
    trim: true
  },

  // Auto-generated readable ID, e.g. "R001"
  ruleId: {
    type: String,
    unique: true
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

// Index for fast lookup of rules per society
rulecreationSchema.index({ society: 1, category: 1 });

module.exports = mongoose.model('Rule', rulecreationSchema);