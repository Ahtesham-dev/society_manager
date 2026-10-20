const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAuditLogs } = require('../controller/auditlog');
const { protect, authorize } = require('../middleware/auth');

//GET /api/societies/:societyId/audit-logs
//Chairman only, full accountability trail of sensitive actions
router.get('/', protect, authorize('CHAIRMAN'), getAuditLogs);

module.exports = router;