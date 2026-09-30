// Public routes (no token needed):
//   POST /api/auth/register → register
//   POST /api/auth/login    → login
// Protected routes (token required):
//   GET  /api/auth/me       → getMe used when user refresh the page to get the user data from the token
//   POST /api/auth/logout   → logout


const express = require('express');
const router = express.Router();

const { register, login, getMe, logout } = require('../controller/auth');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Header: Authorization: Bearer <token>
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;