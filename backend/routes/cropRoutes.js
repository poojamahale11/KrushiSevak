const express = require('express');
const router = express.Router();
const {
  getMyCrops,
  addCrop,
  updateCrop,
  deleteCrop,
  getAreaData,
} = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');

// Public Area Data aggregation endpoint
router.get('/area-data', getAreaData);

// Protected Farmer Crop endpoints
router.get('/my-crops', protect, getMyCrops);
router.post('/', protect, addCrop);
router.put('/:id', protect, updateCrop);
router.delete('/:id', protect, deleteCrop);

module.exports = router;
