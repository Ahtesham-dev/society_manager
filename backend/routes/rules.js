const express = require('express');
const router = express.Router({ mergeParams: true });
const { createRule , getRules} = require('../controller/rules');
const { protect, authorize , requireSocietyMember } = require('../middleware/auth');

// POST /api/societies/:societyId/rules → Chairman or Secretary creates a rule
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createRule);

// GET /api/societies/:societyId/rules → any society member can view rules
router.get('/', protect, requireSocietyMember, getRules);

// POST /api/societies/:societyId/rules → chairman/secretary create rule
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createRule);

module.exports = router;