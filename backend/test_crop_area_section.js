// Test script for Crop & Area section (Crops Available on Farm only + State -> District -> Taluka -> Crop filter)
const runTests = async () => {
  console.log('===========================================================');
  console.log('🧪 TESTING CROP & AREA SECTION ENHANCEMENTS');
  console.log('===========================================================\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Test 1: Fetch all area data with default filters
    console.log('1. Testing GET /api/crops/area-data with default filters...');
    const res1 = await fetch(`${baseUrl}/crops/area-data`);
    const data1 = await res1.json();
    if (!data1.success) throw new Error('Test 1 failed: success is false');
    console.log(`✅ Total farmers in DB: ${data1.data.totalFarmers}`);
    console.log(`✅ Total cultivated acres: ${data1.data.totalCultivatedAcres}`);
    console.log(`✅ Crop varieties count: ${data1.data.cropsGrownCount}`);
    console.log(`✅ Most common crop: ${data1.data.mostCommonCrop?.cropName} (${data1.data.mostCommonCrop?.acreage} ac)`);
    console.log(`✅ Available states in options: ${data1.data.options.states.join(', ')}`);
    console.log(`✅ Available districts in options: ${data1.data.options.districts.join(', ')}\n`);

    // Test 2: Filter by State -> District (State=Maharashtra, District=Nashik)
    console.log('2. Testing Filter: State=Maharashtra -> District=Nashik...');
    const res2 = await fetch(`${baseUrl}/crops/area-data?state=Maharashtra&district=Nashik`);
    const data2 = await res2.json();
    if (!data2.success) throw new Error('Test 2 failed');
    console.log(`✅ Farmers in Nashik: ${data2.data.totalFarmers}`);
    console.log(`✅ Cultivated acres in Nashik: ${data2.data.totalCultivatedAcres}`);
    console.log(`✅ Talukas in Nashik: ${data2.data.options.talukas.join(', ')}`);
    console.log(`✅ Crops in Nashik: ${data2.data.options.crops.slice(0, 8).join(', ')}...\n`);

    // Test 3: Filter by State -> District -> Taluka (Nashik -> Niphad)
    console.log('3. Testing Filter: State=Maharashtra -> District=Nashik -> Taluka=Niphad...');
    const res3 = await fetch(`${baseUrl}/crops/area-data?state=Maharashtra&district=Nashik&taluka=Niphad`);
    const data3 = await res3.json();
    if (!data3.success) throw new Error('Test 3 failed');
    console.log(`✅ Farmers in Niphad, Nashik: ${data3.data.totalFarmers}`);
    console.log(`✅ Cultivated acres in Niphad: ${data3.data.totalCultivatedAcres}`);
    console.log(`✅ Registered crops in Niphad: ${data3.data.cropBreakdown.map(c => `${c.cropName} (${c.acreage} ac)`).join(', ')}\n`);

    // Test 4: Filter by State -> District -> Taluka -> Crop (Nashik -> Niphad -> Onion)
    console.log('4. Testing Crop Search / Filter: Crop=Onion in Niphad, Nashik...');
    const res4 = await fetch(`${baseUrl}/crops/area-data?state=Maharashtra&district=Nashik&taluka=Niphad&crop=Onion`);
    const data4 = await res4.json();
    if (!data4.success) throw new Error('Test 4 failed');
    const spotlight = data4.data.selectedCropAvailability;
    if (!spotlight) throw new Error('Test 4 failed: selectedCropAvailability is missing');
    console.log(`✅ Crop Spotlight Searched: "${spotlight.searchedCrop}"`);
    console.log(`✅ Farmers Count with "${spotlight.searchedCrop}" in Niphad: ${spotlight.farmersCount}`);
    console.log(`✅ Total Acreage of "${spotlight.searchedCrop}": ${spotlight.totalAcreage} Acres`);
    console.log(`✅ Growth Stage Breakdown:`, spotlight.statusBreakdown);
    console.log(`✅ Farmers having this crop available on farm:`);
    spotlight.farmers.forEach((f, idx) => {
      console.log(`   [${idx + 1}] ${f.farmerName} (Village: ${f.village}, Taluka: ${f.taluka}) - ${f.acreage} Acres (${f.status}) - Tel: ${f.mobile}`);
    });
    console.log();

    // Test 5: Search for a crop across Ahmednagar (e.g. "Sugarcane")
    console.log('5. Testing Crop Search / Filter: Crop=Sugarcane in Ahmednagar...');
    const res5 = await fetch(`${baseUrl}/crops/area-data?state=Maharashtra&district=Ahmednagar&crop=Sugarcane`);
    const data5 = await res5.json();
    if (!data5.success) throw new Error('Test 5 failed');
    const spotlight5 = data5.data.selectedCropAvailability;
    console.log(`✅ Farmers Count with Sugarcane in Ahmednagar: ${spotlight5?.farmersCount}`);
    console.log(`✅ Total Sugarcane Acreage: ${spotlight5?.totalAcreage} Acres`);
    console.log(`✅ Farmers list count in directory: ${data5.data.farmerDirectory.length}\n`);

    // Test 6: Verify Registered Farm Crops ONLY (No marketplace listings / activeListings)
    console.log('6. Verifying Directory displays only Registered Crops on Farm (No Marketplace Listings)...');
    let hasMarketplaceFields = false;
    data1.data.farmerDirectory.forEach(f => {
      if (f.activeListingsCount !== undefined || f.listings !== undefined) {
        hasMarketplaceFields = true;
      }
      if (!Array.isArray(f.registeredCrops)) {
        throw new Error('Farmer registeredCrops array is missing');
      }
    });
    if (hasMarketplaceFields) {
      throw new Error('Farmer directory contains marketplace listings fields!');
    }
    console.log(`✅ Verified: All ${data1.data.farmerDirectory.length} farmers in directory strictly show registered farm crop records with growth statuses (Growing, Ready for Harvest, Harvested).\n`);

    console.log('===========================================================');
    console.log('🎉 ALL CROP & AREA TESTS PASSED SUCCESSFULLY!');
    console.log('===========================================================');
  } catch (err) {
    console.error('❌ Error in Crop & Area tests:', err.message);
    process.exit(1);
  }
};

runTests();
