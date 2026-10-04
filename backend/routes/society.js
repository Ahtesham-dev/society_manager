const express = require('express');
const router = express.Router();
const { createSociety, getMySocieties, getSocietyDetails , addMember ,updateMemberRole} = require('../controller/society');
const { protect } = require('../middleware/auth');

router.post('/', protect, createSociety);
router.get('/my', protect, getMySocieties); //Get all societies the logged-in user belongs to
router.get('/:societyId', protect, getSocietyDetails); //Get details of a specific society
router.post('/:societyId/members', protect, authorize('CHAIRMAN') , addMember); //Add a member to a specific society
router.patch('/:societyId/members/:membershipId/role', protect, authorize('CHAIRMAN'), updateMemberRole); 
// PATCH /api/societies/:societyId/members/:membershipId/role → Chairman changes someone's role

module.exports = router;

// POST /api/societies  → Create a new society
// Must be logged in (protect middleware checks JWT token)
// Creator automatically becomes CHAIRMAN