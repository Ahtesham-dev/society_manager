const express = require('express');
const router = express.Router({ mergeParams: true });
const { createPlan, getPlans, updatePlanStatus , castVote} = require('../controller/futureplan');
const { protect, authorize, requireSocietyMember } = require('../middleware/auth');

//POST /api/societies/:societyId/future-plans
//Chairman/Secretary creates a plan
router.post('/', protect, authorize('CHAIRMAN', 'SECRETARY'), createPlan);

//GET /api/societies/:societyId/future-plans
//Any active society members can view plans
router.get('/', protect, requireSocietyMember, getPlans);

//PATCH /api/societies/:societyId/future-plans/:planId/status
//Chairman/Secretary updates plan status
router.patch('/:planId/status', protect, authorize('CHAIRMAN', 'SECRETARY'), updatePlanStatus);

//PATCH /api/societies/:societyId/future-plans/:planId/vote
//Any active member can like or dislike a future plan
router.patch('/:planId/vote', protect, requireSocietyMember, castVote);

module.exports = router;