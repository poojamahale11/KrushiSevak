const fs = require('fs');
const path = require('path');
const DiseaseDetection = require('../models/DiseaseDetection');
const Notification = require('../models/Notification');

// This function is the integration point for the real ML model.
// Replace its body with a call to your team's Python/AI model later.
const runDiseaseModel = async (filePath, originalFileName = '') => {
  return {
    crop: 'Crop detected by AI model',
    disease: 'Preliminary Disease Detection',
    confidence: 91.2,
    severity: 'Moderate',
    treatment: [
      'Confirm the diagnosis with a clear close-up image of the affected leaf.',
      'Remove severely infected leaves and keep the field clean.',
      'Use only crop-specific treatment recommended by an agricultural expert or approved label.',
    ],
    prevention: [
      'Avoid excess irrigation and waterlogging.',
      'Maintain proper spacing and field sanitation.',
      'Monitor nearby plants for similar symptoms.',
    ],
    modelStatus: 'demo-ready',
  };
};

const analyzeDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a crop/leaf image.' });
    }

    if (req.user.role !== 'farmer') {
      fs.unlink(req.file.path, () => {});
      return res.status(403).json({ success: false, message: 'Disease detection is available for farmers only.' });
    }

    const result = await runDiseaseModel(req.file.path, req.file.originalname);
    const detection = await DiseaseDetection.create({
      farmer: req.user._id,
      imageUrl: `/uploads/disease/${req.file.filename}`,
      originalFileName: req.file.originalname,
      ...result,
    });

    await Notification.create({ user: req.user._id, type: 'disease', title: 'Disease result ready', message: `Your crop image was analyzed: ${result.disease}.` });

    res.status(200).json({
      success: true,
      message: 'Image analyzed successfully.',
      detection,
      note: 'Demo-ready model response. Replace runDiseaseModel() with the final trained AI model for production predictions.',
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

const getMyDetections = async (req, res, next) => {
  try {
    const detections = await DiseaseDetection.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: detections.length, detections });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeDisease, getMyDetections };
