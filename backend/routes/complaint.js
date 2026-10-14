const express = require('express');
const router = express.Router({ mergeParams: true });
const { submitComplaint } = require('../controller/complaint');
const { protect, requireSocietyMember } = require('../middleware/auth');

// POST /api/societies/:societyId/complaints → Any active member can file a complaint
router.post('/', protect, requireSocietyMember, submitComplaint);

module.exports = router;