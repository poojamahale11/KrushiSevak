const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    village: {
      type: String,
      required: true,
      trim: true,
    },
    taluka: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Cash Crop', 'Grain', 'Vegetable', 'Fruit', 'Pulses', 'Oilseed', 'Other'],
      default: 'Cash Crop',
    },
    acreage: {
      type: Number,
      required: [true, 'Acreage in acres is required'],
      min: [0.1, 'Acreage must be at least 0.1 acres'],
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Perennial / Annual'],
      default: 'Kharif',
    },
    sowingDate: {
      type: String,
      default: '',
    },
    expectedHarvestDate: {
      type: String,
      default: '',
    },
    expectedYield: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Growing', 'Ready for Harvest', 'Harvested', 'Planned'],
      default: 'Growing',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast regional queries
cropSchema.index({ district: 1, taluka: 1, village: 1 });
cropSchema.index({ farmer: 1 });
cropSchema.index({ cropName: 1 });

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
