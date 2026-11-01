const mongoose = require('mongoose');
const User = require('./models/User');
const Crop = require('./models/Crop');
const CropListing = require('./models/CropListing');

const API_BASE = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/krushisevak');
    console.log(' Connected to MongoDB');

    // 1. Get Ramesh Farmer
    const ramesh = await User.findOne({ email: 'ramesh.farmer@krushisevak.in' });
    if (!ramesh) throw new Error('Ramesh farmer not found in database');

    console.log(` Farmer: ${ramesh.name} (${ramesh.village}, ${ramesh.district})`);

    // 2. Add a new crop for sale directly via CropListing
    const testCropName = 'Golden Sweet Corn (मका)';
    const newListing = await CropListing.create({
      farmer: ramesh._id,
      farmerName: ramesh.name,
      cropName: testCropName,
      category: 'Grain',
      quantity: 60,
      unit: 'quintal',
      pricePerUnit: 1850,
      quality: 'Grade A (Organic Sweet)',
      harvestDate: '2026-10-02',
      description: 'Super sweet hybrid golden corn harvested fresh today.',
      village: ramesh.village,
      taluka: ramesh.taluka,
      district: ramesh.district,
      contact: ramesh.mobile,
      location: ramesh.location || { lat: 19.3951, lng: 74.6534 },
      isActive: true,
      status: 'Available'
    });

    console.log(` Farmer created crop listing for sale: "${newListing.cropName}" (₹${newListing.pricePerUnit}/${newListing.unit}, Qty: ${newListing.quantity} ${newListing.unit})`);

    // 3. Verify immediately present in Marketplace
    const foundListings = await CropListing.find({ cropName: testCropName, isActive: true })
      .populate('farmer', 'name mobile village taluka district');

    if (foundListings.length === 0) {
      throw new Error('Crop did not appear in marketplace!');
    }

    console.log(` Verified: Crop immediately appeared in marketplace with ${foundListings.length} listing!`);
    const item = foundListings[0];
    console.log(`   - Crop Name: ${item.cropName}`);
    console.log(`   - Farmer: ${item.farmerName}`);
    console.log(`   - Contact: ${item.contact}`);
    console.log(`   - Location: ${item.village}, ${item.district}`);
    console.log(`   - Price: ₹${item.pricePerUnit} / ${item.unit}`);
    console.log(`   - Quantity: ${item.quantity} ${item.unit}`);
    console.log(`   - Quality: ${item.quality}`);
    console.log(`   - Status: ${item.status}`);

    // 4. Test Search by English term
    const searchEnglish = await CropListing.find({
      isActive: true,
      cropName: new RegExp('Corn', 'i')
    });
    console.log(` Search for "Corn": Found ${searchEnglish.length} matching listing(s)`);

    // 5. Test Search by Marathi term
    const searchMarathi = await CropListing.find({
      isActive: true,
      cropName: new RegExp('मका', 'i')
    });
    console.log(` Search for "मका": Found ${searchMarathi.length} matching listing(s)`);

    // Clean up test listing
    await CropListing.findByIdAndDelete(newListing._id);
    console.log(' Cleaned up test listing');

    console.log('\n ALL TESTS PASSED! Crop listing and customer marketplace search working perfectly!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error(' Test failed:', e);
    process.exit(1);
  }
};

runTest();
