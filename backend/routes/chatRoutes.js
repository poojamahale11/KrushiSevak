const express = require('express');
const router = express.Router();
const { chat, getHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { optionalProtect } = require('../middleware/optionalAuthMiddleware');

// Chat stays usable for guests. Logged-in users automatically get role-aware context and saved history.
router.post('/', optionalProtect, chat);
router.get('/history', protect, getHistory);

module.exports = router;
