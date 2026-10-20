const AuditLog = require('../models/auditlog');

// Flow: Find logs for this society → Populate performer name → Sort newest first → Return list
const getAuditLogs = async (req, res) => {
  try {
    const { societyId } = req.params;

    const logs = await AuditLog.find({ society: societyId })
      .populate('performedBy', 'name userId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });

  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs'
    });
  }
};

module.exports = { getAuditLogs };