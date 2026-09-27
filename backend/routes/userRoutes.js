const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getKendras } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/kendras', getKendras);
router.use(protect);
router.route('/profile').get(getUserProfile).put(updateUserProfile);
module.exports = router;
