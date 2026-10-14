const express = require('express');
const router = express.Router({ mergeParams: true });
const { createAnnouncement, getAnnouncements } = require('../controller/announcement');
const { protect, authorize, requireSocietyMember } = require('../middleware/auth');

// POST /api/societies/:societyId/announcements → Chairman/Secretary creates
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createAnnouncement);

// GET /api/societies/:societyId/announcements → Any active member can view
router.get('/', protect, requireSocietyMember, getAnnouncements);

module.exports = router;