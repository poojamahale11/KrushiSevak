const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true, trim: true },
  cropName: { type: String, required: true, trim: true },
  category: { type: String, default: 'Other' },
  quantity: { type: Number, required: true, min: 0.1 },
  unit: { type: String, default: 'quintal', trim: true },
  pricePerUnit: { type: Number, required: true, min: 0 },
  quality: { type: String, default: '', trim: true },
  harvestDate: { type: String, default: '' },
  expiryDate: { type: Date }, // Listing expiry date
  description: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '' }, // Keep for backward compatibility
  images: [{ type: String }], // Array of image URLs (supports multiple images)
  village: { type: String, default: '' },
  taluka: { type: String, default: '' },
  district: { type: String, default: '' },
  contact: { type: String, default: '' },
  location: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 }
  },
  status: { type: String, enum: ['Available', 'Reserved', 'Sold', 'Expired'], default: 'Available' },
  isActive: { type: Boolean, default: true } // Auto-set to false when expired
}, { timestamps: true });

cropListingSchema.index({ cropName: 1, district: 1, status: 1 });
cropListingSchema.index({ farmer: 1, createdAt: -1 });
cropListingSchema.index({ expiryDate: 1, isActive: 1 }); // Index for expiry checks

// Method to check if listing is expired
cropListingSchema.methods.checkExpiry = function() {
  if (this.expiryDate && new Date() > this.expiryDate && this.isActive) {
    this.isActive = false;
    this.status = 'Expired';
    return true; // Listing expired
  }
  return false; // Not expired
};

module.exports = mongoose.model('CropListing', cropListingSchema);
