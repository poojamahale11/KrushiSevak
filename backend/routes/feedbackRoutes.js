const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createFeedback, getMyFeedback } = require('../controllers/feedbackController');

router.use(protect);
router.post('/', createFeedback);
router.get('/my', getMyFeedback);

module.exports = router;
