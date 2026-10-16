const express = require('express');
const router = express.Router({ mergeParams: true });
const { createFine , getAllFines , submitPayment ,verifyPayment} = require('../controller/fine');
const { protect, authorize , requireSocietyMember} = require('../middleware/auth');

// POST /api/societies/:societyId/fines → Secretary/Chairman creates a fine
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createFine);

// GET /api/societies/:societyId/fines → ALL members can see ALL fines (transparency)
router.get('/', protect, requireSocietyMember, getAllFines);

// PATCH /api/societies/:societyId/fines/:fineId/pay → Resident submits payment proof
router.patch('/:fineId/pay', protect, requireSocietyMember, submitPayment);

// PATCH /api/societies/:societyId/fines/:fineId/verify → Treasurer verifies payment
router.patch('/:fineId/verify', protect, authorize('TREASURER'), verifyPayment);

module.exports = router;