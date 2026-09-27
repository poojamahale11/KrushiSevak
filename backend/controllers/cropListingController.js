const path = require('path');
const fs = require('fs');
const CropListing = require('../models/CropListing');
const User = require('../models/User');
const { geocodeAddress } = require('../utils/geocoding');

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
    const { search, district, taluka, status = 'Available', lat, lng, radius = 100 } = req.query;
    
    // Auto-expire listings
    const now = new Date();
    await CropListing.updateMany(
      { expiryDate: { $lt: now }, isActive: true },
      { isActive: false, status: 'Expired' }
    );
    
    const filter = { isActive: true }; // Only show active listings
    if (status && status !== 'All') filter.status = status;
    if (district && district !== 'All') filter.district = new RegExp(`^${escapeRegex(district.trim())}$`, 'i');
    if (taluka && taluka !== 'All') filter.taluka = new RegExp(`^${escapeRegex(taluka.trim())}$`, 'i');
    if (search && search.trim()) {
      const r = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ cropName: r }, { farmerName: r }, { village: r }, { taluka: r }, { district: r }];
    }

    const hasLocation = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
    const maxRadius = Math.min(Math.max(Number(radius) || 100, 1), 500);
    const listings = await CropListing.find(filter)
      .populate('farmer', 'name mobile village taluka district location landSize crops')
      .sort({ createdAt: -1 });

    const enriched = listings.map((listing) => {
      const item = listing.toObject();
      const coords = item.location || item.farmer?.location;
      if (hasLocation && coords && Number.isFinite(Number(coords.lat)) && Number.isFinite(Number(coords.lng))) {
        item.distanceKm = Number(distanceKm(Number(lat), Number(lng), Number(coords.lat), Number(coords.lng)).toFixed(1));
      } else {
        item.distanceKm = null;
      }
      return item;
    });

    const result = hasLocation
      ? enriched.filter((item) => item.distanceKm !== null && item.distanceKm <= maxRadius).sort((a, b) => a.distanceKm - b.distanceKm)
      : enriched;

    res.json({ success: true, count: result.length, listings: result, locationFilterApplied: hasLocation, radiusKm: hasLocation ? maxRadius : null });
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
    const { cropName, category, quantity, unit, pricePerUnit, quality, harvestDate, expiryDate, description } = req.body;
    if (!cropName || !quantity || pricePerUnit === undefined) return res.status(400).json({ success: false, message: 'Crop name, quantity and price are required' });
    
    const farmer = await User.findById(req.user._id);
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    
    // Use farmer's existing location, or try to geocode if not available
    let listingLocation = undefined;
    
    if (farmer.location && Number.isFinite(Number(farmer.location.lat)) && Number.isFinite(Number(farmer.location.lng))) {
      listingLocation = { lat: Number(farmer.location.lat), lng: Number(farmer.location.lng) };
      console.log(`Using farmer's saved location: ${listingLocation.lat}, ${listingLocation.lng}`);
    } else if (farmer.village || farmer.taluka || farmer.district) {
      try {
        console.log(`Geocoding listing location for: ${farmer.village}, ${farmer.taluka}, ${farmer.district}`);
        const geocoded = await geocodeAddress({
          village: farmer.village,
          taluka: farmer.taluka,
          district: farmer.district,
          state: 'Maharashtra',
          country: 'India'
        });
        
        if (geocoded && geocoded.lat && geocoded.lng) {
          listingLocation = { lat: geocoded.lat, lng: geocoded.lng };
          console.log(`Geocoded listing location: ${geocoded.lat}, ${geocoded.lng}`);
          farmer.location = listingLocation;
          await farmer.save();
        } else {
          console.log('Geocoding failed for listing - location will not be available');
        }
      } catch (geocodeError) {
        console.error('Geocoding error for listing:', geocodeError.message);
      }
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
      village: farmer.village || '',
      taluka: farmer.taluka || '',
      district: farmer.district || '',
      contact: farmer.mobile || '',
      location: listingLocation,
      images: [], // Will be populated by uploadListingImages
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
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one crop photo is required' });
    }
    
    // Limit to 5 images
    const files = req.files.slice(0, 5);
    const newImages = files.map(file => `/uploads/crops/${file.filename}`);
    
    // Add new images to the array
    listing.images = [...(listing.images || []), ...newImages];
    
    // Keep only the last 5 images
    if (listing.images.length > 5) {
      const oldImages = listing.images.slice(0, listing.images.length - 5);
      // Delete old images from filesystem
      oldImages.forEach(imgPath => {
        const fullPath = path.join(__dirname, '..', imgPath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
      listing.images = listing.images.slice(-5);
    }
    
    // Set first image as main imageUrl for backward compatibility
    if (listing.images.length > 0 && !listing.imageUrl) {
      listing.imageUrl = listing.images[0];
    }
    
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
