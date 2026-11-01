const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Crop = require('./models/Crop');

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krushisevak');
  console.log('MongoDB connected');

  const farmers = await User.find({ role: 'farmer' });
  console.log(`\nFound ${farmers.length} farmers in MongoDB:`);
  for (const f of farmers) {
    const userCrops = await Crop.find({ farmer: f._id });
    console.log(`- [${f._id}] Name: "${f.name}" | District: "${f.district}" | Taluka: "${f.taluka}" | Village: "${f.village}" | Land: "${f.landSize}"`);
    console.log(`    User.crops:`, f.crops);
    console.log(`    Crop docs count: ${userCrops.length} ->`, userCrops.map(c => `${c.cropName} (${c.acreage} ac, ${c.status})`));
  }

  const allCrops = await Crop.find({});
  console.log(`\nTotal Crop documents in DB: ${allCrops.length}`);

  await mongoose.disconnect();
}

inspect();
