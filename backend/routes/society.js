const express = require('express');
const router = express.Router();
const { createSociety, getMySocieties, getSocietyDetails , addMember ,updateMemberRole , updateMemberFlat , removeMember} = require('../controller/society');
const { protect , authorize } = require('../middleware/auth');
const ruleRoutes = require('./rule');

router.post('/', protect, createSociety);
router.get('/my', protect, getMySocieties); //Get all societies the logged-in user belongs to
router.get('/:societyId', protect, getSocietyDetails); //Get details of a specific society
router.post('/:societyId/members', protect, authorize('CHAIRMAN') , addMember); //Add a member to a specific society
router.patch('/:societyId/members/:membershipId/role', protect, authorize('CHAIRMAN'), updateMemberRole); 
router.patch('/:societyId/members/:membershipId/flat', protect, authorize('CHAIRMAN'), updateMemberFlat);
router.delete('/:societyId/members/:membershipId', protect, authorize('CHAIRMAN'), removeMember);
router.use('/:societyId/rules', ruleRoutes);

module.exports = router;

// POST /api/societies  → Create a new society
// Must be logged in (protect middleware checks JWT token)
// Creator automatically becomes CHAIRMAN
// PATCH /api/societies/:societyId/members/:membershipId/role → Chairman changes someone's role ->11 line
// PATCH /api/societies/:societyId/members/:membershipId/flat → Chairman changes someone's flat -> 12 line
// DELETE /api/societies/:societyId/members/:membershipId → Chairman removes a member from the society -> 13 line
// Nested route: anything under /:societyId/rules goes to rule routes -> 14