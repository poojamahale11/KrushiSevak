const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const DiseaseDetection = require('../models/DiseaseDetection');
const Notification = require('../models/Notification');

const execFileAsync = promisify(execFile);
const cropNames = [
  'bell pepper', 'cauliflower', 'strawberry', 'blueberry', 'raspberry', 'eggplant',
  'broccoli', 'cucumber', 'tobacco', 'tomato', 'cassava', 'cabbage', 'coffee',
  'celery', 'ginger', 'garlic', 'banana', 'carrot', 'lettuce', 'potato', 'squash',
  'zucchini', 'soybean', 'cherry', 'citrus', 'grape', 'apple', 'peach', 'plum',
  'maple', 'basil', 'corn', 'bean', 'rice',
];

const getCropName = (className) => {
  const normalized = className.toLowerCase();
  const crop = cropNames.find((name) => normalized.startsWith(`${name} `));
  return crop ? crop.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Unknown Crop';
};

const getGuidance = (className) => {
  const label = className.toLowerCase();
  if (/healthy| leaf$/.test(label) && !/rust|blight|spot|mildew|wilt|rot|scab|mosaic|virus|disease|anthracnose|curl|smut|bacterial|insect|damage|chlorotic|mold|greening/.test(label)) {
    return {
      treatment: ['The model did not identify a disease in this image. Continue normal crop care and recheck if symptoms appear.'],
      prevention: ['Monitor new growth regularly and keep the field clean.', 'Use balanced irrigation and avoid waterlogging.'],
    };
  }

  if (/virus|mosaic|greening|leafroll|yellow leaf curl/.test(label)) {
    return {
      treatment: ['There is usually no direct cure for viral plant infections. Isolate affected plants and ask a local agricultural expert whether removal is appropriate.', 'Check for insect vectors and use only locally approved control methods; do not apply fungicides for a viral diagnosis.'],
      prevention: ['Use certified disease-free planting material and resistant varieties where available.', 'Control weeds and monitor for whiteflies, aphids, or other likely vectors.'],
    };
  }

  if (/bacterial|wilt|canker|blight/.test(label)) {
    return {
      treatment: ['Remove badly affected plant parts when practical and dispose of infected debris away from the field.', 'Confirm the diagnosis with a local agricultural expert before selecting any crop-specific treatment. Follow approved product labels; no chemical dose is inferred from this image.'],
      prevention: ['Avoid working among wet plants and clean tools between plants.', 'Use disease-free seed or planting material and avoid waterlogging.'],
    };
  }

  if (/rust|mildew|spot|rot|scab|anthracnose|mold|smut|curl/.test(label)) {
    return {
      treatment: ['Remove heavily affected leaves and crop debris where practical; do not compost visibly infected material.', 'Improve airflow and avoid overhead watering. Confirm the disease and crop with a local agricultural expert before using a crop-approved fungicide; follow its label.'],
      prevention: ['Use clean planting material and maintain suitable plant spacing.', 'Water near the soil and monitor nearby plants for spreading symptoms.'],
    };
  }

  if (/insect|damage/.test(label)) {
    return {
      treatment: ['Inspect both sides of leaves to identify the pest and extent of damage.', 'Use integrated pest management and seek local crop-specific advice before applying a pesticide.'],
      prevention: ['Scout crops regularly and remove weeds that can host pests.', 'Encourage beneficial insects and use barriers or traps when suitable.'],
    };
  }

  return {
    treatment: ['Use this model result as an initial indication, not a confirmed diagnosis. Compare symptoms on several plants and consult a local agricultural expert.', 'Do not apply a pesticide or fungicide until the cause is confirmed; follow approved product labels.'],
    prevention: ['Keep the field and tools clean, maintain good airflow, and avoid excess irrigation.', 'Monitor nearby plants and use healthy, locally suitable planting material.'],
  };
};

const runDiseaseModel = async (filePath, originalFileName = '') => {
  const modelPath = process.env.DISEASE_MODEL_PATH || path.join(__dirname, '..', 'model_weights', 'PlantDiseaseDetection.pt');
  const pythonPath = process.env.PYTHON_EXECUTABLE || 'python';
  const outputPath = `${filePath}.annotated.jpg`;
  const scriptPath = path.join(__dirname, '..', 'services', 'disease_inference.py');

  try {
    const { stdout } = await execFileAsync(pythonPath, [
      scriptPath,
      '--model', modelPath,
      '--image', filePath,
      '--output', outputPath,
    ], { timeout: 180000, maxBuffer: 1024 * 1024 });
    const inference = JSON.parse(stdout);
    const detections = inference.detections || [];
    const primary = detections[0];
    const disease = primary?.className || 'No disease detected';
    const guidance = getGuidance(disease);
    const severity = /virus|greening|late blight|wilt|rot/.test(disease.toLowerCase()) ? 'High' : (primary ? 'Moderate' : 'Low');

    return {
      crop: primary ? getCropName(disease) : 'Unknown Crop',
      disease,
      confidence: primary ? Number((primary.confidence * 100).toFixed(1)) : 0,
      severity,
      treatment: guidance.treatment,
      prevention: guidance.prevention,
      detections,
      imageWidth: inference.imageWidth,
      imageHeight: inference.imageHeight,
      annotatedImageUrl: `/uploads/disease/${path.basename(outputPath)}`,
      modelStatus: 'active',
      originalFileName,
    };
  } catch (error) {
    const details = error.stderr?.trim() || error.message;
    const modelError = new Error(`Disease model inference failed: ${details}`);
    modelError.statusCode = 503;
    throw modelError;
  }
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
    delete result.originalFileName;
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
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    if (req.file?.path) fs.unlink(`${req.file.path}.annotated.jpg`, () => {});
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
