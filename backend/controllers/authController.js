const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { geocodeAddress } = require('../utils/geocoding');

const DISTRICT_COORDINATES = {
  'ahmednagar': { lat: 19.0948, lng: 74.7480 },
  'akola': { lat: 20.7002, lng: 77.0082 },
  'amravati': { lat: 20.9374, lng: 77.7796 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'beed': { lat: 18.9891, lng: 75.7601 },
  'bhandara': { lat: 21.1705, lng: 79.6549 },
  'buldhana': { lat: 20.5293, lng: 76.1843 },
  'chandrapur': { lat: 19.9615, lng: 79.2961 },
  'dhule': { lat: 20.9042, lng: 74.7749 },
  'gadchiroli': { lat: 20.1849, lng: 80.0028 },
  'gondia': { lat: 21.4624, lng: 80.1961 },
  'hingoli': { lat: 19.7183, lng: 77.1479 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'jalna': { lat: 19.8347, lng: 75.8816 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'latur': { lat: 18.4088, lng: 76.5604 },
  'mumbai': { lat: 18.9388, lng: 72.8353 },
  'mumbai suburban': { lat: 19.1176, lng: 72.8631 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'nanded': { lat: 19.1383, lng: 77.3210 },
  'nandurbar': { lat: 21.3712, lng: 74.2400 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'dharashiv': { lat: 18.1861, lng: 76.0419 },
  'osmanabad': { lat: 18.1861, lng: 76.0419 },
  'palghar': { lat: 19.6936, lng: 72.7655 },
  'parbhani': { lat: 19.2686, lng: 76.7712 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'raigad': { lat: 18.5158, lng: 73.1822 },
  'ratnagiri': { lat: 16.9902, lng: 73.3120 },
  'sangli': { lat: 16.8524, lng: 74.5815 },
  'satara': { lat: 17.6805, lng: 74.0183 },
  'sindhudurg': { lat: 16.1246, lng: 73.6913 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'wardha': { lat: 20.7453, lng: 78.6022 },
  'washim': { lat: 20.1107, lng: 77.1342 },
  'yavatmal': { lat: 20.3888, lng: 78.1204 },
  'rahuri': { lat: 19.3951, lng: 74.6534 }
};

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
      location
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

    // Calculate registered location coordinates
    let userLocation = undefined;
    if (location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
      userLocation = { lat: Number(location.lat), lng: Number(location.lng) };
    } else if (village || taluka || district || address) {
      try {
        const geocoded = await geocodeAddress({
          village: village || '',
          taluka: taluka || '',
          district: district || '',
          address: address || '',
          state: req.body.state || 'Maharashtra',
          country: 'India'
        });
        if (geocoded && geocoded.lat && geocoded.lng) {
          userLocation = { lat: Number(geocoded.lat), lng: Number(geocoded.lng) };
        }
      } catch (e) {}
    }

    if (!userLocation && district) {
      const distKey = district.toLowerCase().trim();
      if (DISTRICT_COORDINATES[distKey]) {
        userLocation = DISTRICT_COORDINATES[distKey];
      }
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
      state: req.body.state ? req.body.state.trim() : 'Maharashtra',
    };

    if (userLocation) {
      userData.location = userLocation;
    }

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
