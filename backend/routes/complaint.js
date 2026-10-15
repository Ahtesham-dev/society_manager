const express = require('express');
const router = express.Router({ mergeParams: true });
const { submitComplaint , getComplaints , updateComplaintStatus } = require('../controller/complaint');
const { protect, authorize ,requireSocietyMember } = require('../middleware/auth');

// POST /api/societies/:societyId/complaints → Any active member can file a complaint
router.post('/', protect, requireSocietyMember, submitComplaint);

// GET /api/societies/:societyId/complaints → Any member can view, but detail differs by role
router.get('/', protect, requireSocietyMember, getComplaints);

// PATCH /api/societies/:societyId/complaints/:complaintId/status → Secretary/Chairman only
router.patch('/:complaintId/status', protect, authorize('CHAIRMAN', 'SECRETARY'), updateComplaintStatus);

module.exports = router;