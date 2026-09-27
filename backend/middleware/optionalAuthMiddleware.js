const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Adds req.user when a valid Bearer token is present, but keeps the route public.
const optionalProtect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch (_) {
    // Public chat should still work even if an old/expired token is present.
  }
  next();
};

module.exports = { optionalProtect };
