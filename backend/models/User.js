const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[0-9+\s-]{10,15}$/, 'Please provide a valid mobile number'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'customer', 'storeOwner'],
        message: '{VALUE} is not a valid role. Allowed roles: farmer, customer, storeOwner',
      },
      required: [true, 'Role is required'],
      default: 'farmer',
    },
    // Common / Customer Location
    address: {
      type: String,
      trim: true,
      default: '',
    },
    // Farmer-specific Fields
    village: {
      type: String,
      trim: true,
      default: '',
    },
    taluka: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    landSize: {
      type: String,
      trim: true,
      default: '',
    },
    crops: {
      type: [String],
      default: [],
    },
    // Store Owner-specific Fields
    shopName: {
      type: String,
      trim: true,
      default: '',
    },
    shopAddress: {
      type: String,
      trim: true,
      default: '',
    },
    shopContact: {
      type: String,
      trim: true,
      default: '',
    },
    // Real browser GPS coordinates. Saved only when the user chooses to share location.
    location: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    // Profile photo (URL or base64 string)
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password match
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Safe JSON serialization (strip passwordHash)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
