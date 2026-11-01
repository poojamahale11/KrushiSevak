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

async function testAllDropdownCrops() {
  const initial = await get('http://localhost:5000/api/crops/area-data');
  const cropList = initial.data.cropBreakdown.map(c => c.cropName);
  console.log(`Testing all ${cropList.length} crops from dropdown list:`);

  for (const cropName of cropList) {
    const encoded = encodeURIComponent(cropName);
    const res = await get(`http://localhost:5000/api/crops/area-data?crop=${encoded}`);
    const farmersCount = res.data.farmerDirectory.length;
    const spotlightCount = res.data.selectedCropAvailability ? res.data.selectedCropAvailability.farmersCount : 0;
    console.log(`- Crop: "${cropName}" -> Farmers Directory: ${farmersCount} farmers | Spotlight: ${spotlightCount} farmers`);
    if (farmersCount === 0) {
      console.log(`  ❌ 0 FARMERS FOUND FOR "${cropName}"!`);
    } else {
      res.data.farmerDirectory.forEach(f => {
        console.log(`     Farmer: ${f.name} (${f.village}, ${f.district}) -> Crops: ${f.registeredCrops.map(c => c.cropName).join(', ')}`);
      });
    }
  }
}

testAllDropdownCrops();
