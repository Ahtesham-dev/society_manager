const express = require('express');
const router = express.Router({ mergeParams: true });
const { createFinanceRecord } = require('../controller/finance');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('TREASURER'), createFinanceRecord);

module.exports = router;

