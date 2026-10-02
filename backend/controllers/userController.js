const User = require('../models/User');
const Crop = require('../models/Crop');
const Product = require('../models/Product');
const { geocodeAddress } = require('../utils/geocoding');

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
    
    const { name, mobile, address, village, taluka, district, landSize, crops, shopName, shopAddress, shopContact, profileImage } = req.body;
    
    if (name) user.name = name.trim();
    if (mobile) user.mobile = mobile.trim();
    if (address !== undefined) user.address = address.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;
    
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
      if (shouldGeocode && (user.village || user.taluka || user.district)) {
        try {
          console.log(`Auto-geocoding farmer address: ${user.village}, ${user.taluka}, ${user.district}`);
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
            console.log(`Geocoding successful: ${geocoded.lat}, ${geocoded.lng}`);
          } else {
            console.log('Geocoding failed - location will not be available');
            // Don't fail the entire update if geocoding fails
            user.location = undefined;
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError.message);
          // Continue with profile update even if geocoding fails
          user.location = undefined;
        }
      }
      
      // Update related crops with new farmer information
      await Crop.updateMany(
        { farmer: user._id },
        {
          farmerName: user.name,
          village: user.village || 'Village',
          taluka: user.taluka || 'Taluka',
          district: user.district || 'District'
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
          }
        } catch (error) {
          console.error('Customer geocoding error:', error.message);
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
