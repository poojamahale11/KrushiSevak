const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getProducts, getMyInventory, addProduct, updateProduct, updateProductStock, deleteProduct, uploadProductImage } = require('../controllers/productController');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: (_req,_file,cb)=>cb(null,uploadDir), filename: (_req,file,cb)=>cb(null,`${Date.now()}-${path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g,'_')}`) });
const upload = multer({ storage, limits:{fileSize:7*1024*1024}, fileFilter:(_req,file,cb)=>['image/jpeg','image/png','image/webp','image/jpg'].includes(file.mimetype) ? cb(null,true) : cb(new Error('Only JPG, PNG and WEBP images are allowed.')) });

router.get('/', getProducts);
router.get('/my-inventory', protect, authorize('storeOwner'), getMyInventory);
router.post('/', protect, authorize('storeOwner'), addProduct);
router.put('/:id', protect, authorize('storeOwner'), updateProduct);
router.patch('/:id/stock', protect, authorize('storeOwner'), updateProductStock);
router.post('/:id/image', protect, authorize('storeOwner'), upload.single('image'), uploadProductImage);
router.delete('/:id', protect, authorize('storeOwner'), deleteProduct);
module.exports = router;
