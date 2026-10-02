const path = require('path');
const fs = require('fs');
const CropListing = require('../models/CropListing');
const User = require('../models/User');
const { geocodeAddress } = require('../utils/geocoding');

const DISTRICT_COORDINATES = {
  'ahmednagar': { lat: 19.0948, lng: 74.7480 },
  'akola': { lat: 20.7002, lng: 77.0082 },
  'amravati': { lat: 20.9374, lng: 77.7796 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
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

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getListings = async (req, res, next) => {
  try {
    const { search, district, taluka, status = 'Available', lat, lng } = req.query;
    
    // Auto-expire listings only if they have a valid past expiry date set
    const now = new Date();
    await CropListing.updateMany(
      { expiryDate: { $ne: null, $type: 'date', $lt: now }, isActive: true },
      { isActive: false, status: 'Expired' }
    );
    
    // Restore any active listings where expiry date is null/missing or in the future
    await CropListing.updateMany(
      { $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }], status: 'Expired' },
      { isActive: true, status: 'Available' }
    );
    
    const filter = { isActive: true }; // Only show active listings
    if (status && status !== 'All') filter.status = status;
    if (district && district !== 'All' && district !== 'All Maharashtra') filter.district = new RegExp(`^${escapeRegex(district.trim())}$`, 'i');
    if (taluka && taluka !== 'All') filter.taluka = new RegExp(`^${escapeRegex(taluka.trim())}$`, 'i');
    if (search && search.trim()) {
      const r = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { cropName: r }, 
        { category: r },
        { farmerName: r }, 
        { village: r }, 
        { taluka: r }, 
        { district: r },
        { description: r }
      ];
    }

    const customerLat = Number.isFinite(Number(lat)) ? Number(lat) : null;
    const customerLng = Number.isFinite(Number(lng)) ? Number(lng) : null;
    const hasCustomerLocation = customerLat !== null && customerLng !== null;

    const listings = await CropListing.find(filter)
      .populate('farmer', 'name mobile village taluka district location landSize crops profileImage')
      .sort({ createdAt: -1 });

    const enriched = listings.map((listing) => {
      const item = listing.toObject();
      let coords = item.location || item.farmer?.location;
      if (!coords || !coords.lat || !coords.lng) {
        const distKey = (item.district || '').toLowerCase();
        coords = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
        item.location = coords;
      }

      if (hasCustomerLocation) {
        item.distanceKm = Number(distanceKm(customerLat, customerLng, Number(coords.lat), Number(coords.lng)).toFixed(1));
      } else {
        item.distanceKm = null;
      }
      return item;
    });

    // Sort ALL matching listings by distance (nearest first) if customer location is provided
    const result = hasCustomerLocation
      ? enriched.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999))
      : enriched;

    res.json({
      success: true,
      count: result.length,
      listings: result,
      customerLocation: hasCustomerLocation ? { lat: customerLat, lng: customerLng } : null
    });
  } catch (e) { next(e); }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await CropListing.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (e) { next(e); }
};

const createListing = async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ success: false, message: 'Only farmers can create crop listings' });
    const { cropName, category, quantity, unit, pricePerUnit, quality, harvestDate, expiryDate, description, village, taluka, district } = req.body;
    if (!cropName || !quantity || pricePerUnit === undefined) return res.status(400).json({ success: false, message: 'Crop name, quantity and price are required' });
    
    const farmer = await User.findById(req.user._id);
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    
    const cropVillage = (village || farmer.village || '').trim();
    const cropTaluka = (taluka || farmer.taluka || '').trim();
    const cropDistrict = (district || farmer.district || '').trim();

    let listingLocation = undefined;
    
    if (farmer.location && Number.isFinite(Number(farmer.location.lat)) && Number.isFinite(Number(farmer.location.lng))) {
      listingLocation = { lat: Number(farmer.location.lat), lng: Number(farmer.location.lng) };
    } else if (cropVillage || cropTaluka || cropDistrict) {
      try {
        const geocoded = await geocodeAddress({
          village: cropVillage,
          taluka: cropTaluka,
          district: cropDistrict,
          state: 'Maharashtra',
          country: 'India'
        });
        
        if (geocoded && geocoded.lat && geocoded.lng) {
          listingLocation = { lat: geocoded.lat, lng: geocoded.lng };
        }
      } catch (geocodeError) {
        console.error('Geocoding error for listing:', geocodeError.message);
      }
    }

    if (!listingLocation) {
      const distKey = cropDistrict.toLowerCase();
      listingLocation = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
    }
    
    // Parse expiry date
    let parsedExpiryDate = null;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
      if (isNaN(parsedExpiryDate.getTime())) {
        parsedExpiryDate = null;
      }
    }
    
    const listing = await CropListing.create({
      farmer: farmer._id,
      farmerName: farmer.name,
      cropName: cropName.trim(),
      category: category || 'Other',
      quantity: Number(quantity),
      unit: unit || 'kg',
      pricePerUnit: Number(pricePerUnit),
      quality: quality || '',
      harvestDate: harvestDate || '',
      expiryDate: parsedExpiryDate,
      description: description || '',
      village: cropVillage || farmer.village || '',
      taluka: cropTaluka || farmer.taluka || '',
      district: cropDistrict || farmer.district || '',
      contact: farmer.mobile || '',
      location: listingLocation,
      imageUrl: req.body.imageUrl || '',
      images: req.body.imageUrl ? [req.body.imageUrl] : (Array.isArray(req.body.images) ? req.body.images : []),
      isActive: true
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Crop listing created successfully. You can now upload images.', 
      listing,
      locationGeocoded: !!listingLocation
    });
  } catch (e) { next(e); }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.farmer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    
    const allowed = ['cropName','category','quantity','unit','pricePerUnit','quality','harvestDate','expiryDate','description','status'];
    allowed.forEach(k => {
      if (req.body[k] !== undefined) {
        if (k === 'cropName') {
          listing[k] = String(req.body[k]).trim();
        } else if (k === 'expiryDate') {
          const parsedDate = new Date(req.body[k]);
          listing[k] = isNaN(parsedDate.getTime()) ? null : parsedDate;
        } else {
          listing[k] = req.body[k];
        }
      }
    });
    
    const farmer = await User.findById(req.user._id).select('location village taluka district mobile name');
    if (farmer) {
      listing.farmerName = farmer.name;
      listing.contact = farmer.mobile || '';
      listing.village = farmer.village || '';
      listing.taluka = farmer.taluka || '';
      listing.district = farmer.district || '';
      if (farmer.location) listing.location = farmer.location;
    }
    await listing.save();
    res.json({ success: true, message: 'Listing updated', listing });
  } catch (e) { next(e); }
};

// Upload multiple images (up to 5) for a listing
const uploadListingImages = async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ success: false, message: 'Only farmers can upload crop photos' });
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.farmer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    
    const files = (req.files && req.files.length > 0) ? req.files : (req.file ? [req.file] : []);
    
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one crop photo is required' });
    }
    
    const newImages = files.slice(0, 5).map(file => `/uploads/crops/${file.filename}`);
    listing.images = [...(listing.images || []), ...newImages];
    if (listing.images.length > 5) listing.images = listing.images.slice(-5);
    if (newImages.length > 0) listing.imageUrl = newImages[0];
    
    await listing.save();
    res.json({ success: true, message: `${files.length} crop photo(s) uploaded`, listing, imagesUploaded: files.length });
  } catch (e) { next(e); }
};

const deleteListing = async (req, res, next) => {
  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.farmer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    
    // Delete all images
    if (listing.images && listing.images.length > 0) {
      listing.images.forEach(imgPath => {
        const fullPath = path.join(__dirname, '..', imgPath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    
    // Delete old single image if exists
    if (listing.imageUrl) {
      const oldPath = path.join(__dirname, '..', listing.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (e) { next(e); }
};

module.exports = { getListings, getMyListings, createListing, updateListing, uploadListingImages, deleteListing };
