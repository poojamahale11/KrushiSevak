const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT Token Helper
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user (Farmer, Customer, or Store Owner)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      address,
      village,
      taluka,
      district,
      landSize,
      crops,
      shopName,
      shopAddress,
      shopContact,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, mobile, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Role validation
    const validRoles = ['farmer', 'customer', 'storeOwner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid account role: Farmer, Customer, or Store Owner',
      });
    }
    const userRole = role;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Normalize crops if provided as comma-separated string or array
    let parsedCrops = [];
    if (Array.isArray(crops)) {
      parsedCrops = crops.map((c) => c.trim()).filter(Boolean);
    } else if (typeof crops === 'string' && crops.trim()) {
      parsedCrops = crops
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }

    // Create user object with role-based attributes
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      passwordHash,
      role: userRole,
      address: address ? address.trim() : '',
      village: village ? village.trim() : '',
      taluka: taluka ? taluka.trim() : '',
      district: district ? district.trim() : '',
    };

    if (userRole === 'farmer') {
      userData.landSize = landSize ? landSize.toString().trim() : '';
      userData.crops = parsedCrops;
    } else if (userRole === 'storeOwner') {
      userData.shopName = shopName ? shopName.trim() : '';
      userData.shopAddress = shopAddress ? shopAddress.trim() : '';
      userData.shopContact = shopContact ? shopContact.trim() : mobile.trim();
    }

    const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // If a role was selected on the login screen, verify it against the
    // role stored in MongoDB. This prevents a user from logging in through
    // another role's login flow.
    if (role && !['farmer', 'customer', 'storeOwner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account role',
      });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as ${user.role}. Please use the ${user.role} login.`,
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  getMe,
};
