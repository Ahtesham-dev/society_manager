const express = require('express');
const router = express.Router();
const { createSociety } = require('../controller/society');
const { protect } = require('../middleware/auth');

router.post('/', protect, createSociety);

module.exports = router;

// POST /api/societies  → Create a new society
// Must be logged in (protect middleware checks JWT token)
// Creator automatically becomes CHAIRMAN