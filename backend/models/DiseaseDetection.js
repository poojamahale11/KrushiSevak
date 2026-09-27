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
  modelStatus: { type: String, default: 'demo-ready' },
}, { timestamps: true });

module.exports = mongoose.model('DiseaseDetection', diseaseDetectionSchema);
