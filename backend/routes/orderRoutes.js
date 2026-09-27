const express = require('express');
const router = express.Router();
const { getMyOrders, createOrder, getStoreOrders, updateStoreOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/store-orders', getStoreOrders);
router.patch('/store-orders/:id/status', updateStoreOrderStatus);
router.post('/', createOrder);

module.exports = router;
