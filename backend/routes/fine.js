const express = require('express');
const router = express.Router({ mergeParams: true });
const { createFine , getAllFines } = require('../controller/fine');
const { protect, authorize , requireSocietyMember} = require('../middleware/auth');

// POST /api/societies/:societyId/fines → Secretary/Chairman creates a fine
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createFine);

// GET /api/societies/:societyId/fines → ALL members can see ALL fines (transparency)
router.get('/', protect, requireSocietyMember, getAllFines);


module.exports = router;