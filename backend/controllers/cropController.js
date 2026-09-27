const Crop = require('../models/Crop');
const User = require('../models/User');

/**
 * Helper to sync simple crops array on User model
 */
const syncUserCrops = async (farmerId) => {
  const farmerCrops = await Crop.find({ farmer: farmerId });
  const uniqueCropNames = [...new Set(farmerCrops.map((c) => c.cropName))];
  await User.findByIdAndUpdate(farmerId, { crops: uniqueCropNames });
};

/**
 * @desc    Get crops for logged in farmer
 * @route   GET /api/crops/my-crops
 * @access  Private (Farmer)
 */
const getMyCrops = async (req, res, next) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new crop for farmer
 * @route   POST /api/crops
 * @access  Private (Farmer)
 */
const addCrop = async (req, res, next) => {
  try {
    const {
      cropName,
      category,
      acreage,
      season,
      sowingDate,
      expectedHarvestDate,
      expectedYield,
      status,
      notes,
    } = req.body;

    if (!cropName || !acreage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide crop name and acreage',
      });
    }

    const farmer = await User.findById(req.user._id);

    const crop = await Crop.create({
      farmer: req.user._id,
      farmerName: farmer.name,
      village: farmer.village || 'Village',
      taluka: farmer.taluka || 'Taluka',
      district: farmer.district || 'District',
      cropName: cropName.trim(),
      category: category || 'Cash Crop',
      acreage: Number(acreage),
      season: season || 'Kharif',
      sowingDate: sowingDate || '',
      expectedHarvestDate: expectedHarvestDate || '',
      expectedYield: expectedYield || '',
      status: status || 'Growing',
      notes: notes || '',
    });

    await syncUserCrops(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      crop,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing crop
 * @route   PUT /api/crops/:id
 * @access  Private (Farmer)
 */
const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this crop' });
    }

    const {
      cropName,
      category,
      acreage,
      season,
      sowingDate,
      expectedHarvestDate,
      expectedYield,
      status,
      notes,
    } = req.body;

    if (cropName) crop.cropName = cropName.trim();
    if (category) crop.category = category;
    if (acreage !== undefined) crop.acreage = Number(acreage);
    if (season) crop.season = season;
    if (sowingDate !== undefined) crop.sowingDate = sowingDate;
    if (expectedHarvestDate !== undefined) crop.expectedHarvestDate = expectedHarvestDate;
    if (expectedYield !== undefined) crop.expectedYield = expectedYield;
    if (status) crop.status = status;
    if (notes !== undefined) crop.notes = notes;

    const updatedCrop = await crop.save();

    await syncUserCrops(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      crop: updatedCrop,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a crop
 * @route   DELETE /api/crops/:id
 * @access  Private (Farmer)
 */
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this crop' });
    }

    await Crop.findByIdAndDelete(req.params.id);

    await syncUserCrops(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Crop removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated crop & area metrics with real farmers and listings
 * @route   GET /api/crops/area-data
 * @access  Public
 */
const getAreaData = async (req, res, next) => {
  try {
    const { district, taluka, village } = req.query;

    const CropListing = require('../models/CropListing');

    const filter = {};
    if (district && district !== 'All') {
      filter.district = new RegExp(`^${district.trim()}$`, 'i');
    }
    if (taluka && taluka !== 'All') {
      filter.taluka = new RegExp(`^${taluka.trim()}$`, 'i');
    }
    if (village && village !== 'All') {
      filter.village = new RegExp(`^${village.trim()}$`, 'i');
    }

    // Retrieve all matching crop records
    const crops = await Crop.find(filter).populate('farmer', 'name mobile email village taluka district landSize location');

    // Retrieve all farmers in the selected area
    const farmerFilter = { role: 'farmer' };
    if (district && district !== 'All') farmerFilter.district = new RegExp(`^${district.trim()}$`, 'i');
    if (taluka && taluka !== 'All') farmerFilter.taluka = new RegExp(`^${taluka.trim()}$`, 'i');
    if (village && village !== 'All') farmerFilter.village = new RegExp(`^${village.trim()}$`, 'i');

    const registeredFarmers = await User.find(farmerFilter).select('name email mobile village taluka district landSize crops createdAt location');

    // Get active crop listings for this area
    const listingFilter = { status: 'Available' };
    if (district && district !== 'All') listingFilter.district = new RegExp(`^${district.trim()}$`, 'i');
    if (taluka && taluka !== 'All') listingFilter.taluka = new RegExp(`^${taluka.trim()}$`, 'i');
    if (village && village !== 'All') listingFilter.village = new RegExp(`^${village.trim()}$`, 'i');

    const activeListings = await CropListing.find(listingFilter).populate('farmer', 'name mobile');

    // Calculate aggregated metrics
    const totalFarmersCount = registeredFarmers.length;
    let totalAcreage = 0;
    const cropAcreageMap = {};
    const cropFarmersMap = {};

    crops.forEach((c) => {
      const name = c.cropName || 'Other';
      const acres = Number(c.acreage) || 0;
      totalAcreage += acres;

      cropAcreageMap[name] = (cropAcreageMap[name] || 0) + acres;

      if (!cropFarmersMap[name]) {
        cropFarmersMap[name] = new Set();
      }
      cropFarmersMap[name].add(c.farmerName || (c.farmer && c.farmer.name) || 'Unknown Farmer');
    });

    // Also consider crops listed in User.crops if no explicit Crop collection items exist
    registeredFarmers.forEach((farmer) => {
      if (Array.isArray(farmer.crops)) {
        farmer.crops.forEach((cName) => {
          if (cName && !cropAcreageMap[cName]) {
            // Default baseline acreage estimate if not in Crop collection
            cropAcreageMap[cName] = 2.0;
            totalAcreage += 2.0;
          }
          if (!cropFarmersMap[cName]) {
            cropFarmersMap[cName] = new Set();
          }
          cropFarmersMap[cName].add(farmer.name);
        });
      }
    });

    const cropEntries = Object.entries(cropAcreageMap).map(([cropName, acreage]) => ({
      cropName,
      acreage: Math.round(acreage * 10) / 10,
      farmersCount: cropFarmersMap[cropName] ? cropFarmersMap[cropName].size : 1,
      percentage: totalAcreage > 0 ? Math.round((acreage / totalAcreage) * 1000) / 10 : 0,
    })).sort((a, b) => b.acreage - a.acreage);

    const mostGrownCrop = cropEntries.length > 0 ? cropEntries[0] : { cropName: 'Sugarcane', acreage: 0, percentage: 0 };
    const leastGrownCrop = cropEntries.length > 0 ? cropEntries[cropEntries.length - 1] : { cropName: 'None', acreage: 0, percentage: 0 };

    // Get Maharashtra districts and their talukas based on actual farmer registrations
    const allFarmers = await User.find({ role: 'farmer' }).select('district taluka village');
    
    // Build dynamic district list from registered farmers
    const districtSet = new Set();
    const talukasByDistrict = {};
    
    allFarmers.forEach((farmer) => {
      if (farmer.district) {
        districtSet.add(farmer.district);
        
        if (!talukasByDistrict[farmer.district]) {
          talukasByDistrict[farmer.district] = new Set();
        }
        if (farmer.taluka) {
          talukasByDistrict[farmer.district].add(farmer.taluka);
        }
      }
    });

    const districts = ['All', ...Array.from(districtSet).sort()];
    
    // Get talukas for selected district or all talukas
    let talukas = ['All'];
    if (district && district !== 'All' && talukasByDistrict[district]) {
      talukas = ['All', ...Array.from(talukasByDistrict[district]).sort()];
    } else {
      // All talukas from all districts
      const allTalukasSet = new Set();
      Object.values(talukasByDistrict).forEach(talukaSet => {
        talukaSet.forEach(t => allTalukasSet.add(t));
      });
      talukas = ['All', ...Array.from(allTalukasSet).sort()];
    }

    const villages = ['All', ...new Set(allFarmers.map((f) => f.village).filter(Boolean))].sort();

    // Build farmer directory with listings
    const farmerCropDirectory = registeredFarmers.map((farmer) => {
      const farmerCropsList = crops.filter(
        (c) => (c.farmer && c.farmer._id.toString() === farmer._id.toString()) || c.farmerName === farmer.name
      );

      // Get farmer's active listings
      const farmerListings = activeListings.filter(
        (listing) => listing.farmer && listing.farmer._id.toString() === farmer._id.toString()
      );

      const cropSummary = farmerCropsList.length > 0
        ? farmerCropsList.map((c) => `${c.cropName} (${c.acreage} ac)`).join(', ')
        : (farmer.crops && farmer.crops.length > 0 ? farmer.crops.join(', ') : 'Not recorded');

      const farmerTotalAcres = farmerCropsList.reduce((acc, c) => acc + (c.acreage || 0), 0) || farmer.landSize || '2 Acres';

      return {
        id: farmer._id,
        name: farmer.name,
        village: farmer.village || 'N/A',
        taluka: farmer.taluka || 'N/A',
        district: farmer.district || 'N/A',
        mobile: farmer.mobile,
        crops: farmer.crops || [],
        cropSummary,
        totalAcreage: farmerTotalAcres,
        activeListingsCount: farmerListings.length,
        listings: farmerListings.map(l => ({
          id: l._id,
          cropName: l.cropName,
          quantity: l.quantity,
          unit: l.unit,
          pricePerUnit: l.pricePerUnit,
          status: l.status
        })),
        location: farmer.location && farmer.location.lat && farmer.location.lng ? {
          lat: farmer.location.lat,
          lng: farmer.location.lng,
          available: true
        } : { available: false }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        filterApplied: { district: district || 'All', taluka: taluka || 'All', village: village || 'All' },
        totalFarmers: totalFarmersCount,
        totalCultivatedAcres: Math.round(totalAcreage * 10) / 10,
        cropsGrownCount: cropEntries.length,
        mostCommonCrop: mostGrownCrop,
        leastCommonCrop: leastGrownCrop,
        cropBreakdown: cropEntries,
        farmerDirectory: farmerCropDirectory,
        options: {
          districts,
          talukas,
          villages,
          talukasByDistrict: Object.fromEntries(
            Object.entries(talukasByDistrict).map(([dist, talukaSet]) => [dist, Array.from(talukaSet).sort()])
          )
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCrops,
  addCrop,
  updateCrop,
  deleteCrop,
  getAreaData,
};
