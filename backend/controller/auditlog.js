const AuditLog = require('../models/auditlog');
const asyncHandler = require('../utils/asyncHandler');

// Flow: Find logs for this society → Populate performer name → Sort newest first → Return list
const getAuditLogs = asyncHandler(async (req, res) => {
    const { societyId } = req.params;

    const logs = await AuditLog.find({ society: societyId })
      .populate('performedBy', 'name userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });

});

module.exports = { getAuditLogs };