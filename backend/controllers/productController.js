const Product = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Get all products (public browse with search & category filtering)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search, district, inStockOnly, storeOwner } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { shopName: searchRegex },
      ];
    }

    if (district && district !== 'All') {
      filter.district = new RegExp(`^${district.trim()}$`, 'i');
    }

    if (storeOwner) {
      filter.storeOwner = storeOwner;
    }

    if (inStockOnly === 'true') {
      filter.isOutOfStock = false;
      filter.stockQuantity = { $gt: 0 };
    }

    const products = await Product.find(filter)
      .populate('storeOwner', 'name mobile shopName shopAddress shopContact district')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory for logged in Store Owner
 * @route   GET /api/products/my-inventory
 * @access  Private (Store Owner)
 */
const getMyInventory = async (req, res, next) => {
  try {
    const products = await Product.find({ storeOwner: req.user._id }).sort({ createdAt: -1 });

    const totalProducts = products.length;
    const outOfStockCount = products.filter((p) => p.isOutOfStock || p.stockQuantity === 0).length;
    const lowStockCount = products.filter((p) => !p.isOutOfStock && p.stockQuantity > 0 && p.stockQuantity <= 10).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stockQuantity), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalProducts,
        outOfStockCount,
        lowStockCount,
        inStockCount: totalProducts - outOfStockCount,
        totalInventoryValue,
      },
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to store inventory
 * @route   POST /api/products
 * @access  Private (Store Owner)
 */
const addProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      stockQuantity,
      unit,
      description,
      brand,
      isOutOfStock,
      imageUrl,
      expiryDate,
      batchNumber,
    } = req.body;

    if (!name || !category || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, category, price, and stock quantity',
      });
    }

    const storeOwner = await User.findById(req.user._id);

    const qty = Number(stockQuantity);
    const calculatedOutOfStock = isOutOfStock !== undefined ? Boolean(isOutOfStock) : qty <= 0;

    const product = await Product.create({
      name: name.trim(),
      category,
      price: Number(price),
      stockQuantity: qty,
      unit: unit || 'bag',
      isOutOfStock: calculatedOutOfStock,
      description: description ? description.trim() : '',
      brand: brand ? brand.trim() : '',
      storeOwner: req.user._id,
      shopName: storeOwner.shopName || storeOwner.name + ' Agri Seva Kendra',
      shopContact: storeOwner.shopContact || storeOwner.mobile,
      shopAddress: storeOwner.shopAddress || storeOwner.address || 'APMC Market Yard',
      district: storeOwner.district || 'Ahmednagar',
      imageUrl: imageUrl || '',
      expiryDate: expiryDate || null,
      batchNumber: batchNumber ? batchNumber.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Product added to inventory successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Private (Store Owner)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.storeOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
    }

    const {
      name,
      category,
      price,
      stockQuantity,
      unit,
      description,
      brand,
      isOutOfStock,
      imageUrl,
      expiryDate,
      batchNumber,
    } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (unit) product.unit = unit;
    if (description !== undefined) product.description = description.trim();
    if (brand !== undefined) product.brand = brand.trim();
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (expiryDate !== undefined) product.expiryDate = expiryDate || null;
    if (batchNumber !== undefined) product.batchNumber = String(batchNumber).trim();

    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      if (product.stockQuantity <= 0) {
        product.isOutOfStock = true;
      } else if (isOutOfStock !== undefined) {
        product.isOutOfStock = Boolean(isOutOfStock);
      }
    } else if (isOutOfStock !== undefined) {
      product.isOutOfStock = Boolean(isOutOfStock);
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick update stock quantity or toggle out-of-stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private (Store Owner)
 */
const updateProductStock = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.storeOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { stockQuantity, isOutOfStock } = req.body;

    if (stockQuantity !== undefined) {
      product.stockQuantity = Math.max(0, Number(stockQuantity));
      if (product.stockQuantity === 0) {
        product.isOutOfStock = true;
      } else if (isOutOfStock !== undefined) {
        product.isOutOfStock = Boolean(isOutOfStock);
      }
    }

    if (isOutOfStock !== undefined) {
      product.isOutOfStock = Boolean(isOutOfStock);
    }

    const updated = await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product from store inventory
 * @route   DELETE /api/products/:id
 * @access  Private (Store Owner)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.storeOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted from inventory',
    });
  } catch (error) {
    next(error);
  }
};


const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Product image is required.' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.storeOwner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    product.imageUrl = `/uploads/products/${req.file.filename}`;
    await product.save();
    res.json({ success: true, imageUrl: product.imageUrl, product });
  } catch (error) { next(error); }
};

module.exports = {
  getProducts,
  getMyInventory,
  addProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  uploadProductImage,
};
