const express = require('express');
const router = express.Router({ mergeParams: true });
const { createMonthlyDue } = require('../controller/maintenance');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('TREASURER'), createMonthlyDue);

module.exports = router;