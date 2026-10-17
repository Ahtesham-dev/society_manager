const express = require('express');
const router = express.Router();
const { createSociety, getMySocieties, getSocietyDetails , addMember ,updateMemberRole , updateMemberFlat , removeMember} = require('../controller/society');
const { protect , authorize } = require('../middleware/auth');
const ruleRoutes = require('./rules'); //points to the rule routes file
const announcementRoutes = require('./announcement');
const complaintRoutes = require('./complaint');
const fineRoutes = require('./fine');


router.post('/', protect, createSociety);
router.get('/my', protect, getMySocieties); // Get all societies the logged-in user belongs to

router.post('/:societyId/members', protect, authorize('CHAIRMAN'), addMember); // Add a member to a specific society
router.get('/:societyId', protect, getSocietyDetails); // Get details of a specific society
router.patch('/:societyId/members/:membershipId/role', protect, authorize('CHAIRMAN'), updateMemberRole);
router.patch('/:societyId/members/:membershipId/flat', protect, authorize('CHAIRMAN'), updateMemberFlat);
router.delete('/:societyId/members/:membershipId', protect, authorize('CHAIRMAN'), removeMember);
router.use('/:societyId/rules', ruleRoutes);
router.use('/:societyId/announcements', announcementRoutes);
router.use('/:societyId/complaints', complaintRoutes);
router.use('/:societyId/fines', fineRoutes);

const maintenanceRoutes = require('./maintenance');
router.use('/:societyId/maintenance', maintenanceRoutes);

const financeRoutes = require('./finance');
router.use('/:societyId/finance', financeRoutes);

module.exports = router;

// POST /api/societies  → Create a new society
// Must be logged in (protect middleware checks JWT token)
// Creator automatically becomes CHAIRMAN
// PATCH /api/societies/:societyId/members/:membershipId/role → Chairman changes someone's role 
// PATCH /api/societies/:societyId/members/:membershipId/flat → Chairman changes someone's flat 
// DELETE /api/societies/:societyId/members/:membershipId → Chairman removes a member from the society
// Nested route: anything under /:societyId/rules goes to rule routes