const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: [
          'Seeds',
          'Fertilizers',
          'Pesticides',
          'Urea',
          'Other agricultural products',
          'Equipment & Tools',
        ],
        message: '{VALUE} is not a supported product category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required (e.g., kg, bag, liter, pack)'],
      trim: true,
      default: 'bag',
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    storeOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Store owner reference is required'],
    },
    shopName: {
      type: String,
      trim: true,
      default: '',
    },
    shopContact: {
      type: String,
      trim: true,
      default: '',
    },
    shopAddress: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: { type: String, default: '' },
    expiryDate: { type: Date, default: null },
    batchNumber: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: automatically update isOutOfStock if stockQuantity is 0
productSchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.isOutOfStock = true;
  }
  next();
});

productSchema.index({ category: 1, name: 1 });
productSchema.index({ storeOwner: 1 });
productSchema.index({ district: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
