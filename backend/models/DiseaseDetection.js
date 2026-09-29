const mongoose = require('mongoose');

const diseaseDetectionSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, default: '' },
  originalFileName: { type: String, default: '' },
  crop: { type: String, default: 'Unknown Crop' },
  disease: { type: String, required: true },
  confidence: { type: Number, required: true },
  severity: { type: String, default: 'Moderate' },
  treatment: { type: [String], default: [] },
  prevention: { type: [String], default: [] },
  detections: [{
    className: { type: String, required: true },
    confidence: { type: Number, required: true },
    bbox: {
      x1: { type: Number, required: true },
      y1: { type: Number, required: true },
      x2: { type: Number, required: true },
      y2: { type: Number, required: true },
    },
    _id: false,
  }],
  imageWidth: { type: Number, default: 0 },
  imageHeight: { type: Number, default: 0 },
  annotatedImageUrl: { type: String, default: '' },
  modelStatus: { type: String, default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('DiseaseDetection', diseaseDetectionSchema);
