const Crop = require('../models/Crop');
const CropListing = require('../models/CropListing');
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
 * Helper to sync simple crops array on User model
 */
const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      state,
      sellOnMarketplace,
      pricePerUnit,
      quantity,
      unit,
      quality,
      description
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
      village: farmer.village || req.body.village || 'Village',
      taluka: farmer.taluka || req.body.taluka || 'Taluka',
      district: farmer.district || req.body.district || 'District',
      state: farmer.state || state || 'Maharashtra',
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

    let listing = null;
    // If farmer chose to immediately list this crop for sale on the marketplace
    if (sellOnMarketplace && pricePerUnit) {
      try {
        let listingLocation = undefined;
        if (farmer.location && Number.isFinite(Number(farmer.location.lat)) && Number.isFinite(Number(farmer.location.lng))) {
          listingLocation = { lat: Number(farmer.location.lat), lng: Number(farmer.location.lng) };
        } else if (farmer.village || farmer.taluka || farmer.district) {
          try {
            const geocoded = await geocodeAddress({
              village: farmer.village,
              taluka: farmer.taluka,
              district: farmer.district,
              state: farmer.state || 'Maharashtra',
              country: 'India'
            });
            if (geocoded && geocoded.lat && geocoded.lng) listingLocation = geocoded;
          } catch (e) {}
        }

        if (!listingLocation) {
          const distKey = (farmer.district || '').toLowerCase().trim();
          listingLocation = DISTRICT_COORDINATES[distKey] || { lat: 19.3951, lng: 74.6534 };
        }

        listing = await CropListing.create({
          farmer: farmer._id,
          farmerName: farmer.name,
          cropName: cropName.trim(),
          category: category || 'Other',
          quantity: Number(quantity) || Number(expectedYield?.replace(/[^0-9.]/g, '')) || 50,
          unit: unit || 'quintal',
          pricePerUnit: Number(pricePerUnit),
          quality: quality || 'Grade A',
          harvestDate: expectedHarvestDate || '',
          description: description || notes || `Farm fresh ${cropName.trim()} harvest available for direct sale.`,
          village: farmer.village || '',
          taluka: farmer.taluka || '',
          district: farmer.district || '',
          contact: farmer.mobile || '',
          location: listingLocation,
          isActive: true
        });
      } catch (listingErr) {
        console.error('Error auto-creating marketplace listing:', listingErr.message);
      }
    }

    await syncUserCrops(req.user._id);

    res.status(201).json({
      success: true,
      message: listing 
        ? 'Crop registered and published to marketplace for customers!' 
        : 'Crop added successfully',
      crop,
      listing
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
      state
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
    if (state) crop.state = state;

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

const {
  MAHARASHTRA_DISTRICTS_AND_TALUKAS,
  ALL_MAHARASHTRA_DISTRICTS,
  getDistrictRegex,
  getTalukaRegex,
} = require('../utils/maharashtraLocations');

/**
 * Standard Canonical Maharashtra Crop Families and Synonym Dictionary
 */
const CROP_CANONICAL_MAP = [
  { canonical: 'Sugarcane', category: 'Cash Crop', keywords: ['sugarcane', 'sugar cane', 'us', 'ऊस', 'co 86032', 'co86032'] },
  { canonical: 'Onion', category: 'Vegetable', keywords: ['onion', 'kanda', 'कांदा', 'gavran', 'red onion'] },
  { canonical: 'Grapes', category: 'Fruit', keywords: ['grape', 'grapes', 'graphs', 'draksh', 'द्राक्ष', 'sonaka', 'thompson', 'tas-a-ganesh'] },
  { canonical: 'Wheat', category: 'Grain', keywords: ['wheat', 'gahu', 'गहू', 'sharbati', 'lokwan', 'sihor'] },
  { canonical: 'Tomato', category: 'Vegetable', keywords: ['tomato', 'tamatar', 'टोमॅटो', 'abhinav'] },
  { canonical: 'Soyabean', category: 'Oilseed', keywords: ['soyabean', 'soya bean', 'soya', 'सोयाबीन', 'js 335', 'js335'] },
  { canonical: 'Cotton', category: 'Fiber Crop', keywords: ['cotton', 'kapas', 'कापूस', 'bt cotton', 'hybrid cotton'] },
  { canonical: 'Pomegranate', category: 'Fruit', keywords: ['pomegranate', 'dalimb', 'डाळिंब', 'bhagwa', 'arukta'] },
  { canonical: 'Rice', category: 'Grain', keywords: ['rice', 'paddy', 'bhat', 'तांदूळ', 'indrayani', 'kolam', 'basmati'] },
  { canonical: 'Bajra', category: 'Grain', keywords: ['bajra', 'pearl millet', 'बाजरी', 'hybrid bajra'] },
  { canonical: 'Turmeric', category: 'Spice', keywords: ['turmeric', 'haldi', 'हळद', 'salem'] },
  { canonical: 'Papaya', category: 'Fruit', keywords: ['papaya', 'पपई', 'taiwan 786'] },
  { canonical: 'Maize', category: 'Grain', keywords: ['maize', 'corn', 'मका'] },
  { canonical: 'Groundnut', category: 'Oilseed', keywords: ['groundnut', 'peanut', 'भुईमूग', 'shengdana'] },
  { canonical: 'Sweet Lime (Mosambi)', category: 'Fruit', keywords: ['sweet lime', 'mosambi', 'मोसंबी', 'citrus'] },
  { canonical: 'Jowar', category: 'Grain', keywords: ['jowar', 'sorghum', 'ज्वारी', 'maldandi'] },
  { canonical: 'Gram (Harbara)', category: 'Pulse', keywords: ['gram', 'chana', 'harbara', 'हरभरा', 'chickpea'] },
  { canonical: 'Ginger', category: 'Spice', keywords: ['ginger', 'adrak', 'आले'] },
  { canonical: 'Garlic', category: 'Spice', keywords: ['garlic', 'lahsun', 'लसूण'] },
  { canonical: 'Chilli', category: 'Spice', keywords: ['chilli', 'chili', 'mirchi', 'मिरची'] },
  { canonical: 'Banana', category: 'Fruit', keywords: ['banana', 'kela', 'केळी', 'g9'] },
  { canonical: 'Custard Apple (Sitaphal)', category: 'Fruit', keywords: ['custard apple', 'sitaphal', 'सीताफळ'] },
  { canonical: 'Guava', category: 'Fruit', keywords: ['guava', 'peru', 'पेरू', 'sardar'] },
  { canonical: 'Mango', category: 'Fruit', keywords: ['mango', 'aam', 'हापूस', 'आंबा', 'alphonso', 'kesar'] },
];

/**
 * Determine canonical crop name from any raw string
 */
const getCanonicalCrop = (cropName) => {
  if (!cropName) return 'Other';
  const str = cropName.toLowerCase().trim();
  for (const entry of CROP_CANONICAL_MAP) {
    if (entry.keywords.some((kw) => str.includes(kw)) || entry.canonical.toLowerCase() === str) {
      return entry.canonical;
    }
  }
  // Title-case fallback
  return cropName.trim().replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Determine standard category for a crop
 */
const getCropCategory = (cropName) => {
  if (!cropName) return 'Cash Crop';
  const str = cropName.toLowerCase().trim();
  for (const entry of CROP_CANONICAL_MAP) {
    if (entry.keywords.some((kw) => str.includes(kw)) || entry.canonical.toLowerCase() === str) {
      return entry.category;
    }
  }
  return 'Cash Crop';
};

/**
 * Bidirectional fuzzy matching between search/filter crop and farmer's crop
 */
const matchCrop = (cropA, cropB) => {
  if (!cropA || !cropB) return false;
  const a = cropA.toLowerCase().trim();
  const b = cropB.toLowerCase().trim();
  if (a === 'all' || b === 'all') return true;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const canA = getCanonicalCrop(a);
  const canB = getCanonicalCrop(b);
  if (canA.toLowerCase() === canB.toLowerCase()) return true;

  for (const entry of CROP_CANONICAL_MAP) {
    const aMatch = entry.keywords.some((kw) => a.includes(kw)) || entry.canonical.toLowerCase() === a;
    const bMatch = entry.keywords.some((kw) => b.includes(kw)) || entry.canonical.toLowerCase() === b;
    if (aMatch && bMatch) return true;
  }
  return false;
};

/**
 * @desc    Get aggregated crop & area metrics with REGISTERED CROPS (Crops Available on Farm) only.
 *          Dropdowns: Maharashtra -> District -> Taluka -> Crop
 * @route   GET /api/crops/area-data
 * @access  Public
 */
const getAreaData = async (req, res, next) => {
  try {
    const { state, district, taluka, village, crop, search } = req.query;

    // 1. Build Location filter for Registered Crops
    const cropFilter = {};
    const farmerFilter = { role: 'farmer' };

    // State is Maharashtra
    const stateCondition = {
      $or: [
        { state: new RegExp('^Maharashtra$', 'i') },
        { state: { $exists: false } },
        { state: '' },
        { state: null }
      ]
    };
    cropFilter.$and = [stateCondition];
    farmerFilter.$and = [stateCondition];

    // District Filter (Matches standard name and common aliases in DB)
    if (district && district !== 'All') {
      const distRegex = getDistrictRegex(district);
      if (distRegex) {
        cropFilter.district = distRegex;
        farmerFilter.district = distRegex;
      }
    }

    // Taluka Filter (Matches exact taluka of the district)
    if (taluka && taluka !== 'All') {
      const talukaRegex = getTalukaRegex(taluka);
      if (talukaRegex) {
        cropFilter.taluka = talukaRegex;
        farmerFilter.taluka = talukaRegex;
      }
    }

    // Village Filter
    if (village && village !== 'All') {
      const villageRegex = new RegExp(`^${escapeRegex(village.trim())}$`, 'i');
      cropFilter.village = villageRegex;
      farmerFilter.village = villageRegex;
    }

    // Retrieve all matching Registered Farmers in the area from MongoDB
    const registeredFarmers = await User.find(farmerFilter).select(
      'name email mobile village taluka district state landSize crops createdAt location profileImage'
    );

    // Retrieve all Registered Crops in the area (Crops Available on Farm) from MongoDB
    const allAreaCrops = await Crop.find(cropFilter).populate(
      'farmer',
      'name mobile email village taluka district state landSize location profileImage'
    );

    // 2. Canonical Crop Breakdown Aggregation for the Selected Area
    const canonicalMap = {};
    let totalAcreage = 0;

    // A) Process all Crop documents from MongoDB
    allAreaCrops.forEach((c) => {
      const canonical = getCanonicalCrop(c.cropName);
      const acres = Number(c.acreage) || 0;
      totalAcreage += acres;

      if (!canonicalMap[canonical]) {
        canonicalMap[canonical] = {
          cropName: canonical,
          category: c.category || getCropCategory(canonical),
          acreage: 0,
          farmersSet: new Set(),
          statusCounts: { Growing: 0, 'Ready for Harvest': 0, Harvested: 0, Planned: 0 },
          varieties: new Set(),
          farmers: [],
        };
      }

      canonicalMap[canonical].acreage += acres;
      canonicalMap[canonical].varieties.add(c.cropName);
      const fIdentifier = (c.farmer && c.farmer._id ? c.farmer._id.toString() : null) || c.farmerName || 'Farmer';
      canonicalMap[canonical].farmersSet.add(fIdentifier);

      const status = c.status || 'Growing';
      if (canonicalMap[canonical].statusCounts[status] !== undefined) {
        canonicalMap[canonical].statusCounts[status] += 1;
      } else {
        canonicalMap[canonical].statusCounts['Growing'] += 1;
      }

      canonicalMap[canonical].farmers.push({
        farmerId: c.farmer?._id || null,
        farmerName: c.farmerName || c.farmer?.name || 'Farmer',
        mobile: c.farmer?.mobile || '',
        village: c.village,
        taluka: c.taluka,
        district: c.district,
        state: c.state || 'Maharashtra',
        cropName: c.cropName,
        category: c.category || getCropCategory(canonical),
        acreage: c.acreage,
        season: c.season || 'Kharif',
        status: c.status || 'Growing',
        sowingDate: c.sowingDate || '',
        expectedHarvestDate: c.expectedHarvestDate || '',
        expectedYield: c.expectedYield || '',
        notes: c.notes || '',
      });
    });

    // B) Merge crops recorded in farmer profile if not already captured
    registeredFarmers.forEach((farmer) => {
      if (Array.isArray(farmer.crops)) {
        farmer.crops.forEach((cName) => {
          if (!cName) return;
          const canonical = getCanonicalCrop(cName);
          const fId = farmer._id.toString();

          if (!canonicalMap[canonical]) {
            canonicalMap[canonical] = {
              cropName: canonical,
              category: getCropCategory(canonical),
              acreage: 0,
              farmersSet: new Set(),
              statusCounts: { Growing: 0, 'Ready for Harvest': 0, Harvested: 0, Planned: 0 },
              varieties: new Set(),
              farmers: [],
            };
          }

          if (!canonicalMap[canonical].farmersSet.has(fId)) {
            const defaultAcres = 2.0;
            canonicalMap[canonical].acreage += defaultAcres;
            totalAcreage += defaultAcres;
            canonicalMap[canonical].farmersSet.add(fId);
            canonicalMap[canonical].statusCounts['Growing'] += 1;
            canonicalMap[canonical].varieties.add(cName);
            canonicalMap[canonical].farmers.push({
              farmerId: farmer._id,
              farmerName: farmer.name,
              mobile: farmer.mobile,
              village: farmer.village,
              taluka: farmer.taluka,
              district: farmer.district,
              state: farmer.state || 'Maharashtra',
              cropName: cName,
              category: getCropCategory(canonical),
              acreage: defaultAcres,
              season: 'Kharif',
              status: 'Growing',
              sowingDate: '',
              expectedHarvestDate: '',
              expectedYield: '',
              notes: 'Registered in profile',
            });
          }
        });
      }
    });

    // Build sorted crop breakdown
    const cropEntries = Object.values(canonicalMap)
      .map((entry) => ({
        cropName: entry.cropName,
        category: entry.category,
        acreage: Math.round(entry.acreage * 10) / 10,
        farmersCount: entry.farmersSet.size,
        percentage: totalAcreage > 0 ? Math.round((entry.acreage / totalAcreage) * 1000) / 10 : 0,
        statusCounts: entry.statusCounts,
        readyCount: entry.statusCounts['Ready for Harvest'] || 0,
        growingCount: entry.statusCounts['Growing'] || 0,
        harvestedCount: entry.statusCounts['Harvested'] || 0,
        plannedCount: entry.statusCounts['Planned'] || 0,
        varieties: [...entry.varieties],
        farmers: entry.farmers,
      }))
      .sort((a, b) => b.acreage - a.acreage);

    const mostGrownCrop = cropEntries.length > 0 ? cropEntries[0] : { cropName: 'Sugarcane', acreage: 0, percentage: 0, farmersCount: 0 };
    const leastGrownCrop = cropEntries.length > 0 ? cropEntries[cropEntries.length - 1] : { cropName: 'None', acreage: 0, percentage: 0, farmersCount: 0 };

    // 3. Filter Farmers Directory (REGISTERED CROPS ONLY)
    let filteredFarmers = registeredFarmers;

    // Filter by Crop
    if (crop && crop !== 'All') {
      filteredFarmers = filteredFarmers.filter((farmer) => {
        const farmerCrops = allAreaCrops.filter(
          (c) => (c.farmer && c.farmer._id.toString() === farmer._id.toString()) || c.farmerName === farmer.name
        );
        const hasMatchingCropDoc = farmerCrops.some((c) => matchCrop(crop, c.cropName));
        const hasMatchingUserCrop = Array.isArray(farmer.crops) && farmer.crops.some((c) => matchCrop(crop, c));
        return hasMatchingCropDoc || hasMatchingUserCrop;
      });
    }

    // Search query filter
    if (search && search.trim()) {
      const sTerm = search.trim();
      const sRegex = new RegExp(escapeRegex(sTerm), 'i');
      filteredFarmers = filteredFarmers.filter((farmer) => {
        const farmerCrops = allAreaCrops.filter(
          (c) => (c.farmer && c.farmer._id.toString() === farmer._id.toString()) || c.farmerName === farmer.name
        );
        const hasMatchingCropDoc = farmerCrops.some(
          (c) => matchCrop(sTerm, c.cropName) || sRegex.test(c.cropName) || sRegex.test(c.category)
        );
        const hasMatchingUserCrop = Array.isArray(farmer.crops) && farmer.crops.some((c) => matchCrop(sTerm, c) || sRegex.test(c));
        const hasMatchingProfile =
          sRegex.test(farmer.name) ||
          sRegex.test(farmer.village) ||
          sRegex.test(farmer.taluka) ||
          sRegex.test(farmer.district);
        return hasMatchingCropDoc || hasMatchingUserCrop || hasMatchingProfile;
      });
    }

    // 4. Compute Specific Crop Availability Spotlight
    let selectedCropAvailability = null;
    const targetCropName = crop && crop !== 'All' ? crop : search && search.trim() ? search.trim() : null;

    if (targetCropName) {
      const matchedCanonicalEntries = cropEntries.filter((ce) => matchCrop(targetCropName, ce.cropName));
      if (matchedCanonicalEntries.length > 0) {
        const primaryMatched = matchedCanonicalEntries[0];
        const combinedFarmersSet = new Set();
        let combinedAcreage = 0;
        const combinedStatus = { Growing: 0, 'Ready for Harvest': 0, Harvested: 0, Planned: 0 };
        const combinedFarmerDetails = [];

        matchedCanonicalEntries.forEach((entry) => {
          combinedAcreage += entry.acreage;
          entry.farmers.forEach((f) => {
            const key = f.farmerId ? f.farmerId.toString() : `${f.farmerName}-${f.village}`;
            if (!combinedFarmersSet.has(key)) {
              combinedFarmersSet.add(key);
              combinedFarmerDetails.push(f);
            }
            if (f.status && combinedStatus[f.status] !== undefined) {
              combinedStatus[f.status] += 1;
            }
          });
        });

        selectedCropAvailability = {
          searchedCrop: targetCropName,
          matchedCrop: primaryMatched.cropName,
          matchedCrops: matchedCanonicalEntries.map((e) => e.cropName),
          farmersCount: filteredFarmers.length > 0 ? filteredFarmers.length : combinedFarmersSet.size,
          totalAcreage: Math.round(combinedAcreage * 10) / 10,
          statusBreakdown: combinedStatus,
          readyCount: combinedStatus['Ready for Harvest'] || 0,
          growingCount: combinedStatus['Growing'] || 0,
          farmers: combinedFarmerDetails,
          areaSummary: {
            state: 'Maharashtra',
            district: district || 'All Districts',
            taluka: taluka || 'All Talukas',
            village: village || 'All Villages',
          },
        };
      }
    }

    // 5. Official 36 Maharashtra Districts and dynamic Taluka options
    const districts = ['All', ...ALL_MAHARASHTRA_DISTRICTS];

    // Talukas for the selected district (or All)
    let talukas = ['All'];
    if (district && district !== 'All') {
      const matchedDistrictKey = Object.keys(MAHARASHTRA_DISTRICTS_AND_TALUKAS).find(
        (dKey) => dKey.toLowerCase() === district.toLowerCase() || getDistrictRegex(dKey)?.test(district)
      );

      if (matchedDistrictKey && MAHARASHTRA_DISTRICTS_AND_TALUKAS[matchedDistrictKey]) {
        talukas = ['All', ...MAHARASHTRA_DISTRICTS_AND_TALUKAS[matchedDistrictKey]];
      }
    }

    // Clean list of canonical registered crops available in this area
    const availableCropsList = ['All', ...cropEntries.map((c) => c.cropName)];
    const allCropsFromDB = await Crop.distinct('cropName');

    // 6. Build Farmer Directory output with full crop details
    const farmerCropDirectory = filteredFarmers.map((farmer) => {
      const farmerCropsList = allAreaCrops.filter(
        (c) => (c.farmer && c.farmer._id.toString() === farmer._id.toString()) || c.farmerName === farmer.name
      );

      let registeredCropObjects = farmerCropsList.map((c) => ({
        id: c._id,
        cropName: c.cropName,
        canonicalCrop: getCanonicalCrop(c.cropName),
        category: c.category || getCropCategory(c.cropName),
        acreage: Number(c.acreage) || 0,
        season: c.season || 'Kharif',
        sowingDate: c.sowingDate || '',
        expectedHarvestDate: c.expectedHarvestDate || '',
        expectedYield: c.expectedYield || '',
        status: c.status || 'Growing',
        notes: c.notes || '',
      }));

      // Also merge any crops registered in farmer.crops profile array
      if (Array.isArray(farmer.crops) && farmer.crops.length > 0) {
        farmer.crops.forEach((cName, idx) => {
          if (!cName) return;
          const cleanName = cName.trim();
          const isAlreadyPresent = registeredCropObjects.some((ro) => matchCrop(cleanName, ro.cropName));
          if (!isAlreadyPresent) {
            const defaultAcres = 2.0;
            registeredCropObjects.push({
              id: `${farmer._id}-crop-${idx}`,
              cropName: cleanName,
              canonicalCrop: getCanonicalCrop(cleanName),
              category: getCropCategory(cleanName),
              acreage: defaultAcres,
              season: 'Kharif',
              sowingDate: '',
              expectedHarvestDate: '',
              expectedYield: '',
              status: 'Growing',
              notes: 'Registered in profile',
            });
          }
        });
      }

      // If a specific crop was selected, sort matching crops first
      if (targetCropName) {
        registeredCropObjects.sort((a, b) => {
          const aMatch = matchCrop(targetCropName, a.cropName) ? 1 : 0;
          const bMatch = matchCrop(targetCropName, b.cropName) ? 1 : 0;
          return bMatch - aMatch;
        });
      }

      const cropSummary =
        registeredCropObjects.length > 0
          ? registeredCropObjects.map((c) => `${c.cropName} (${c.acreage} ac - ${c.status})`).join(', ')
          : farmer.crops && farmer.crops.length > 0
          ? farmer.crops.join(', ')
          : 'Registered Producer';

      const statedLand = farmer.landSize && !isNaN(parseFloat(farmer.landSize)) ? parseFloat(farmer.landSize) : null;
      const cropAcreageSum = registeredCropObjects.reduce((acc, c) => acc + (Number(c.acreage) || 0), 0);
      let farmerTotalAcres = '';
      if (statedLand && statedLand > 0) {
        farmerTotalAcres = `${statedLand} Acres`;
      } else if (cropAcreageSum > 0) {
        farmerTotalAcres = `${Math.round(cropAcreageSum * 10) / 10} Acres`;
      } else {
        farmerTotalAcres = '2.0 Acres';
      }

      return {
        id: farmer._id,
        name: farmer.name,
        village: farmer.village || 'N/A',
        taluka: farmer.taluka || 'N/A',
        district: farmer.district || 'N/A',
        state: farmer.state || 'Maharashtra',
        mobile: farmer.mobile,
        email: farmer.email,
        profileImage: farmer.profileImage || '',
        crops: farmer.crops || [],
        registeredCrops: registeredCropObjects,
        cropSummary,
        totalAcreage: farmerTotalAcres,
        totalRegisteredCropsCount: registeredCropObjects.length,
        location:
          farmer.location && farmer.location.lat && farmer.location.lng
            ? {
                lat: farmer.location.lat,
                lng: farmer.location.lng,
                available: true,
              }
            : { available: false },
      };
    });

    res.status(200).json({
      success: true,
      data: {
        filterApplied: {
          state: 'Maharashtra',
          district: district || 'All',
          taluka: taluka || 'All',
          village: village || 'All',
          crop: crop || 'All',
          search: search || '',
        },
        totalFarmers: farmerCropDirectory.length,
        totalRegisteredFarmersInArea: registeredFarmers.length,
        totalCultivatedAcres: Math.round(totalAcreage * 10) / 10,
        cropsGrownCount: cropEntries.length,
        mostCommonCrop: mostGrownCrop,
        leastCommonCrop: leastGrownCrop,
        selectedCropAvailability,
        cropBreakdown: cropEntries,
        farmerDirectory: farmerCropDirectory,
        options: {
          state: 'Maharashtra',
          states: ['Maharashtra'],
          districts,
          talukas,
          crops: availableCropsList,
          allCrops: allCropsFromDB,
          talukasByDistrict: MAHARASHTRA_DISTRICTS_AND_TALUKAS,
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


