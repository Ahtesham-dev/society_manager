const AuditLog = require('../models/auditlog');

// Flow: Create one audit log entry, errors logged not thrown
const createAuditLog = async ({ society, performedBy, action, targetType, targetId, details }) => {
  try {
    await AuditLog.create({ society, performedBy, action, targetType, targetId, details });
  } catch (error) {
    console.error('Create Audit Log Error:', error);
  }
};

module.exports = { createAuditLog };