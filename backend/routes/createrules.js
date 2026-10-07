const express = require('express');
const router = express.Router({ mergeParams: true });
const { createRule } = require('../controller/createrules');
const { protect, authorize } = require('../middleware/auth');

// POST /api/societies/:societyId/rules → Chairman or Secretary creates a rule
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createRule);

module.exports = router;