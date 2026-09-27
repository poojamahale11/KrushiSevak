const Feedback = require('../models/Feedback');

const createFeedback = async (req, res, next) => {
  try {
    const { rating, message, category } = req.body;
    if (!rating || !message) return res.status(400).json({ success: false, message: 'Rating and message are required.' });
    const feedback = await Feedback.create({ user: req.user._id, rating, message, category });
    res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback });
  } catch (error) { next(error); }
};

const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, feedback });
  } catch (error) { next(error); }
};

module.exports = { createFeedback, getMyFeedback };
