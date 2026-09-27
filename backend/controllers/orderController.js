const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const CropListing = require('../models/CropListing');
const Notification = require('../models/Notification');

/**
 * @desc    Get purchase history for logged-in customer
 * @route   GET /api/orders/my-orders
 * @access  Private (Customer)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a demo / customer order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can place orders.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one product.' });
    }

    const customer = await User.findById(req.user._id);
    const normalizedItems = [];
    let totalAmount = 0;

    const stockChanges = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });

      const product = await Product.findById(item.product || item._id);
      if (product) {
        if (product.isOutOfStock || product.stockQuantity < quantity) return res.status(400).json({ success: false, message: `${product.name} has insufficient stock.` });
        normalizedItems.push({ product: product._id, name: product.name, category: product.category, price: product.price, quantity, unit: product.unit, shopName: product.shopName });
        stockChanges.push({ type: 'product', doc: product, quantity });
        totalAmount += product.price * quantity;
        continue;
      }

      // Phase 3 farmer marketplace compatibility: an item can reference a CropListing.
      const listing = await CropListing.findById(item.product || item._id);
      if (!listing) return res.status(404).json({ success: false, message: `Product or crop listing not found: ${item.name || 'unknown'}` });
      if (listing.status !== 'Available' || listing.quantity < quantity) return res.status(400).json({ success: false, message: `${listing.cropName} is no longer available in the requested quantity.` });
      normalizedItems.push({ product: listing._id, name: listing.cropName, category: listing.category, price: listing.pricePerUnit, quantity, unit: listing.unit, shopName: `Farmer: ${listing.farmerName}` });
      stockChanges.push({ type: 'listing', doc: listing, quantity });
      totalAmount += listing.pricePerUnit * quantity;
    }

    // Reduce stock only after every item has passed validation.
    for (const change of stockChanges) {
      if (change.type === 'product') {
        change.doc.stockQuantity -= change.quantity;
        change.doc.isOutOfStock = change.doc.stockQuantity <= 0;
        await change.doc.save();
      } else {
        change.doc.quantity -= change.quantity;
        if (change.doc.quantity <= 0) { change.doc.quantity = 0; change.doc.status = 'Sold'; }
        await change.doc.save();
      }
    }

    const order = await Order.create({
      customer: req.user._id,
      customerName: customer.name,
      items: normalizedItems,
      totalAmount,
      orderStatus: 'Confirmed',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      deliveryAddress: deliveryAddress || customer.address || 'Default Farm Delivery Address',
    });

    // Phase 6: notify customer and relevant store owners about the new order.
    await Notification.create({
      user: req.user._id,
      type: 'order',
      title: 'Order placed successfully',
      message: `Your order #${order._id.toString().slice(-6)} has been confirmed.`,
    });

    const storeOwnerIds = [];
    for (const change of stockChanges) {
      if (change.type === 'product' && change.doc.storeOwner) storeOwnerIds.push(change.doc.storeOwner);
    }
    const uniqueStoreOwnerIds = [...new Set(storeOwnerIds.map((id) => id.toString()))];
    if (uniqueStoreOwnerIds.length) {
      await Notification.insertMany(uniqueStoreOwnerIds.map((id) => ({
        user: id,
        type: 'order',
        title: 'New customer order',
        message: `${customer.name} placed a new order.`,
      })));
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get orders containing products owned by logged-in Store Owner
 * @route GET /api/orders/store-orders
 * @access Private (Store Owner)
 */
const getStoreOrders = async (req, res, next) => {
  try {
    if (req.user.role !== 'storeOwner') {
      return res.status(403).json({ success: false, message: 'Store Owner access required.' });
    }

    const products = await Product.find({ storeOwner: req.user._id }).select('_id');
    const productIds = products.map((p) => p._id);
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('customer', 'name mobile address village taluka district')
      .sort({ createdAt: -1 });

    const storeOrders = orders.map((order) => {
      const items = order.items.filter((item) => productIds.some((id) => id.toString() === item.product?.toString()));
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { ...order.toObject(), items, totalAmount };
    });

    res.status(200).json({ success: true, count: storeOrders.length, orders: storeOrders });
  } catch (error) {
    next(error);
  }
};

const updateStoreOrderStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'storeOwner') return res.status(403).json({ success: false, message: 'Store Owner access required.' });
    const allowed = ['Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ success: false, message: 'Invalid order status.' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const ownsItem = await Product.exists({ storeOwner: req.user._id, _id: { $in: order.items.map((i) => i.product) } });
    if (!ownsItem) return res.status(403).json({ success: false, message: 'Not authorized for this order.' });

    order.orderStatus = req.body.orderStatus;
    await order.save();

    await Notification.create({
      user: order.customer,
      type: 'status',
      title: 'Order status updated',
      message: `Your order #${order._id.toString().slice(-6)} is now ${order.orderStatus}.`,
    });

    res.status(200).json({ success: true, message: 'Order status updated.', order });
  } catch (error) { next(error); }
};

module.exports = {
  getMyOrders,
  createOrder,
  getStoreOrders,
  updateStoreOrderStatus,
};
