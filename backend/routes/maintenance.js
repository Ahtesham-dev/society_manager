const express = require('express');

// mergeParams: true lets this router read :societyId from the parent route
// (society.js mounts this at '/:societyId/maintenance')
const router = express.Router({ mergeParams: true });
const { createMonthlyDue , getMaintenanceHistory , submitMaintenancePayment , verifyMaintenancePayment } = require('../controller/maintenance');

// authorize = must hold a specific role (here, TREASURER)
const { protect, authorize , requireSocietyMember } = require('../middleware/auth');

// POST /api/societies/:societyId/maintenance
// Only a TREASURER can generate monthly dues for the whole society
router.post('/', protect, authorize('TREASURER'), createMonthlyDue);

// GET /api/societies/:societyId/maintenance
// Any active member can call this — but the CONTROLLER decides what they see:
router.get('/', protect, requireSocietyMember, getMaintenanceHistory);

router.patch('/:maintenanceId/pay', protect, requireSocietyMember, submitMaintenancePayment);
router.patch('/:maintenanceId/verify', protect, authorize('TREASURER'), verifyMaintenancePayment);

module.exports = router;