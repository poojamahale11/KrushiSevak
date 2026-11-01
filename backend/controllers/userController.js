const User = require('../models/User');
const Crop = require('../models/Crop');
const Product = require('../models/Product');
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

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const { name, mobile, address, village, taluka, district, state, landSize, crops, shopName, shopAddress, shopContact, profileImage, location } = req.body;
    
    if (name) user.name = name.trim();
    if (mobile) user.mobile = mobile.trim();
    if (address !== undefined) user.address = address.trim();
    if (state !== undefined) user.state = state.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
      user.location = { lat: Number(location.lat), lng: Number(location.lng) };
    }
    
    // Handle role-specific fields
    if (user.role === 'farmer') {
      let shouldGeocode = false;
      
      if (village !== undefined) {
        user.village = village.trim();
        shouldGeocode = true;
      }
      if (taluka !== undefined) {
        user.taluka = taluka.trim();
        shouldGeocode = true;
      }
      if (district !== undefined) {
        user.district = district.trim();
        shouldGeocode = true;
      }
      if (landSize !== undefined) user.landSize = landSize.toString().trim();
      if (crops !== undefined) {
        user.crops = Array.isArray(crops) 
          ? crops.map(c => typeof c === 'string' ? c.trim() : c.cropName || '').filter(Boolean)
          : String(crops).split(',').map(c => c.trim()).filter(Boolean);
      }
      
      // Automatically geocode address if location fields changed
      if (shouldGeocode && !user.location && (user.village || user.taluka || user.district)) {
        try {
          const geocoded = await geocodeAddress({
            village: user.village,
            taluka: user.taluka,
            district: user.district,
            state: user.state || 'Maharashtra',
            country: 'India'
          });
          
          if (geocoded && geocoded.lat && geocoded.lng) {
            user.location = {
              lat: geocoded.lat,
              lng: geocoded.lng
            };
          } else {
            const distKey = (user.district || '').toLowerCase().trim();
            user.location = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
          }
        } catch (geocodeError) {
          const distKey = (user.district || '').toLowerCase().trim();
          user.location = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
        }
      }
      
      // Update related crops with new farmer information
      await Crop.updateMany(
        { farmer: user._id },
        {
          farmerName: user.name,
          village: user.village || 'Village',
          taluka: user.taluka || 'Taluka',
          district: user.district || 'District',
          state: user.state || 'Maharashtra'
        }
      );
      
    } else if (user.role === 'storeOwner') {
      if (shopName !== undefined) user.shopName = shopName.trim();
      if (shopAddress !== undefined) user.shopAddress = shopAddress.trim();
      if (shopContact !== undefined) user.shopContact = shopContact.trim();
      
      // Update related products with new store information
      await Product.updateMany(
        { storeOwner: user._id },
        {
          shopName: user.shopName,
          shopAddress: user.shopAddress,
          shopContact: user.shopContact,
          district: user.district || ''
        }
      );
      
    } else if (user.role === 'customer') {
      // Customer location fields
      if (village !== undefined) user.village = village.trim();
      if (taluka !== undefined) user.taluka = taluka.trim();
      if (district !== undefined) user.district = district.trim();
      
      // Optionally geocode customer address for distance calculations
      if ((village || taluka || district) && (user.village || user.taluka || user.district)) {
        try {
          const geocoded = await geocodeAddress({
            village: user.village,
            taluka: user.taluka,
            district: user.district,
            state: 'Maharashtra',
            country: 'India'
          });
          
          if (geocoded && geocoded.lat && geocoded.lng) {
            user.location = {
              lat: geocoded.lat,
              lng: geocoded.lng
            };
          } else {
            const distKey = (user.district || '').toLowerCase().trim();
            user.location = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
          }
        } catch (error) {
          const distKey = (user.district || '').toLowerCase().trim();
          user.location = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
        }
      }
    }
    
    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      locationGeocoded: !!updatedUser.location?.lat
    });
    
  } catch (error) {
    next(error);
  }
};

const getKendras = async (req, res, next) => {
  try {
    const { district, search } = req.query;
    const filter = { role: 'storeOwner' };
    if (district && district !== 'All') filter.district = new RegExp(`^${String(district).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (search && search.trim()) {
      const r = new RegExp(search.trim(), 'i');
      const matchingProducts = await Product.find({ $or: [{ name: r }, { brand: r }, { category: r }] }).distinct('storeOwner');
      filter.$or = [{ name: r }, { shopName: r }, { shopAddress: r }, { district: r }, { _id: { $in: matchingProducts } }];
    }
    const kendras = await User.find(filter).select('name mobile shopName shopAddress shopContact village taluka district createdAt').sort({ shopName: 1, name: 1 });
    const products = await Product.find({ storeOwner: { $in: kendras.map(k => k._id) } }).select('storeOwner name category price stockQuantity unit isOutOfStock imageUrl expiryDate brand');
    const productMap = new Map();
    products.forEach(p => { const key = p.storeOwner.toString(); if (!productMap.has(key)) productMap.set(key, []); productMap.get(key).push(p); });
    const data = kendras.map(k => ({ ...k.toObject(), products: productMap.get(k._id.toString()) || [] }));
    res.json({ success: true, count: data.length, kendras: data });
  } catch (error) { next(error); }
};

module.exports = { getUserProfile, updateUserProfile, getKendras };
