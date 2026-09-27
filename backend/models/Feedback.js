const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  category: { type: String, enum: ['General', 'Marketplace', 'Disease Detection', 'Krushi Seva Kendra', 'Weather'], default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
