const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getListings, getMyListings, createListing, updateListing, uploadListingImages, deleteListing } = require('../controllers/cropListingController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'crops');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `crop-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.mimetype))
});

router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.post('/', protect, createListing);
router.post('/:id/image', protect, upload.any(), uploadListingImages);
router.post('/:id/images', protect, upload.any(), uploadListingImages);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
module.exports = router;
