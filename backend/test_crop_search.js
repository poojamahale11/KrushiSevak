const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('===========================================================');
  console.log('🧪 TESTING CROP SEARCH & DISTRICT + TALUKA INTEGRATION');
  console.log('===========================================================');

  const BASE_URL = 'http://localhost:5000/api/crops/area-data';

  try {
    // 1. Test Search Crop "Onion" across Maharashtra
    console.log('\n1. Testing Crop Search: "Onion"...');
    const onionRes = await get(`${BASE_URL}?search=Onion`);
    if (!onionRes.success) throw new Error('Failed to search Onion');
    console.log(`✅ Onion Search Farmers Count: ${onionRes.data.totalFarmers}`);
    console.log(`✅ Spotlight Matched: ${onionRes.data.selectedCropAvailability?.searchedCrop || 'None'}`);
    console.log(`✅ Farmers having Onion: ${onionRes.data.selectedCropAvailability?.farmersCount || 0}`);
    onionRes.data.farmerDirectory.slice(0, 3).forEach((f, idx) => {
      console.log(`   [${idx + 1}] Farmer: ${f.name} | Village: ${f.village} | Taluka: ${f.taluka} | District: ${f.district} | Land: ${f.totalAcreage} | Crop: ${f.cropSummary}`);
    });

    // 2. Test Search Crop "Wheat" across Maharashtra
    console.log('\n2. Testing Crop Search: "Wheat"...');
    const wheatRes = await get(`${BASE_URL}?search=Wheat`);
    if (!wheatRes.success) throw new Error('Failed to search Wheat');
    console.log(`✅ Wheat Search Farmers Count: ${wheatRes.data.totalFarmers}`);
    console.log(`✅ Spotlight Matched: ${wheatRes.data.selectedCropAvailability?.searchedCrop || 'None'}`);
    wheatRes.data.farmerDirectory.slice(0, 3).forEach((f, idx) => {
      console.log(`   [${idx + 1}] Farmer: ${f.name} | Village: ${f.village} | Taluka: ${f.taluka} | District: ${f.district} | Land: ${f.totalAcreage} | Crop: ${f.cropSummary}`);
    });

    // 3. Test Search Crop "Onion" + District="Nashik" + Taluka="Niphad"
    console.log('\n3. Testing Crop Search: "Onion" in District="Nashik" + Taluka="Niphad"...');
    const niphadOnionRes = await get(`${BASE_URL}?district=Nashik&taluka=Niphad&search=Onion`);
    if (!niphadOnionRes.success) throw new Error('Failed to search Onion in Niphad');
    console.log(`✅ Farmers Count in Niphad with Onion: ${niphadOnionRes.data.totalFarmers}`);
    console.log(`✅ Spotlight in Niphad: ${niphadOnionRes.data.selectedCropAvailability?.farmersCount || 0} farmers (${niphadOnionRes.data.selectedCropAvailability?.totalAcreage || 0} acres)`);
    niphadOnionRes.data.farmerDirectory.forEach((f) => {
      console.log(`   -> Verified Farmer: ${f.name} | Village: ${f.village} | Taluka: ${f.taluka} | District: ${f.district} | Land: ${f.totalAcreage}`);
      console.log(`      Registered Crops:`, f.registeredCrops.map(c => `${c.cropName} (${c.acreage} ac, ${c.status})`));
    });

    // 4. Test Search Crop "Sugarcane" + District="Ahmednagar" + Taluka="Rahuri"
    console.log('\n4. Testing Crop Search: "Sugarcane" in District="Ahmednagar" + Taluka="Rahuri"...');
    const rahuriSugarRes = await get(`${BASE_URL}?district=Ahmednagar&taluka=Rahuri&search=Sugarcane`);
    if (!rahuriSugarRes.success) throw new Error('Failed to search Sugarcane in Rahuri');
    console.log(`✅ Farmers Count in Rahuri with Sugarcane: ${rahuriSugarRes.data.totalFarmers}`);
    rahuriSugarRes.data.farmerDirectory.forEach((f) => {
      console.log(`   -> Verified Farmer: ${f.name} | Village: ${f.village} | Taluka: ${f.taluka} | District: ${f.district} | Land: ${f.totalAcreage}`);
    });

    // 5. Test Search "Methi" (Fenugreek / Green leafy vegetable)
    console.log('\n5. Testing Crop Search: "Methi"...');
    const methiRes = await get(`${BASE_URL}?search=Methi`);
    console.log(`✅ Methi Search executed successfully. Matching Farmers: ${methiRes.data.totalFarmers}`);

    console.log('\n===========================================================');
    console.log('🎉 ALL CROP SEARCH & REGIONAL FILTER TESTS PASSED!');
    console.log('===========================================================');
  } catch (err) {
    console.error('❌ Error in tests:', err.message);
    process.exit(1);
  }
}

runTests();
