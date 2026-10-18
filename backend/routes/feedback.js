const express = require('express');
const router = express.Router({ mergeParams: true });
const { submitFeedback , getAllFeedback , respondToFeedback } = require('../controller/feedback');
const { protect, requireSocietyMember } = require('../middleware/auth');

//POST /api/societies/:societyId/feedback
router.post('/', protect, requireSocietyMember, submitFeedback);

//GET /api/societies/:societyId/feedback
//View all feedback, optional ?status=SUBMITTED filter, sender identity visible
router.get('/', protect, authorize('CHAIRMAN', 'SECRETARY'), getAllFeedback);

//PATCH /api/societies/:societyId/feedback/:feedbackId/respond
//Write response + update status
router.patch('/:feedbackId/respond', protect, authorize('CHAIRMAN', 'SECRETARY'), respondToFeedback);

//GET /api/societies/:societyId/feedback/my
router.get('/my', protect, requireSocietyMember, getMyFeedback);

module.exports = router;