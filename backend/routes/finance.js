const express = require('express');
const router = express.Router({ mergeParams: true });
const { createFinanceRecord , getFinanceDashboard } = require('../controller/finance');
const { protect, authorize , requireSocietyMember } = require('../middleware/auth');

router.post('/', protect, authorize('TREASURER'), createFinanceRecord);
router.get('/', protect, requireSocietyMember, getFinanceDashboard);

module.exports = router;

