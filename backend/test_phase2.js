const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const http = require('http');

// Test runner function using native fetch
const runIntegrationTests = async () => {
  console.log('--- Starting KrushiSevak Phase 2 Integration Tests ---');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Health check
    console.log('1. Testing /health...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('Health:', healthData);
    if (healthData.status !== 'healthy') throw new Error('Health check failed');

    // 2. Farmer Login
    console.log('\n2. Testing Farmer Login...');
    const farmerLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh.farmer@krushisevak.in',
        password: 'Farmer@123',
      }),
    });
    const farmerAuth = await farmerLoginRes.json();
    if (!farmerAuth.token) throw new Error('Farmer login failed');
    console.log('Farmer logged in:', farmerAuth.user.name, '| Role:', farmerAuth.user.role);

    // 3. Farmer Profile Update
    console.log('\n3. Testing Farmer Profile Update...');
    const profileUpdateRes = await fetch(`${baseUrl}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerAuth.token}`,
      },
      body: JSON.stringify({
        name: 'Ramesh Patil',
        landSize: '7.0 Acres',
        village: 'Rahuri',
        taluka: 'Rahuri',
        district: 'Ahmednagar',
      }),
    });
    const updatedProfile = await profileUpdateRes.json();
    console.log('Updated Profile Land Size:', updatedProfile.user.landSize);
    if (updatedProfile.user.landSize !== '7.0 Acres') throw new Error('Profile update mismatch');

    // 4. Farmer Crop CRUD
    console.log('\n4. Testing Farmer Crop CRUD...');
    // Create Crop
    const addCropRes = await fetch(`${baseUrl}/crops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerAuth.token}`,
      },
      body: JSON.stringify({
        cropName: 'Test Hybrid Maize',
        category: 'Grain',
        acreage: 1.5,
        season: 'Kharif',
        status: 'Growing',
      }),
    });
    const addedCrop = await addCropRes.json();
    console.log('Added Crop:', addedCrop.crop.cropName, '| ID:', addedCrop.crop._id);
    const cropId = addedCrop.crop._id;

    // Get My Crops
    const getCropsRes = await fetch(`${baseUrl}/crops/my-crops`, {
      headers: { Authorization: `Bearer ${farmerAuth.token}` },
    });
    const myCrops = await getCropsRes.json();
    console.log('Total Farmer Crops:', myCrops.count);

    // Delete Test Crop
    const delCropRes = await fetch(`${baseUrl}/crops/${cropId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${farmerAuth.token}` },
    });
    const delData = await delCropRes.json();
    console.log('Deleted Crop:', delData.message);

    // 5. Crop & Area Data Analytics
    console.log('\n5. Testing /crops/area-data...');
    const areaDataRes = await fetch(`${baseUrl}/crops/area-data?district=Ahmednagar`);
    const areaData = await areaDataRes.json();
    console.log('Area Data Farmers in Ahmednagar:', areaData.data.totalFarmers);
    console.log('Most Common Crop:', areaData.data.mostCommonCrop);
    console.log('Crop Breakdown length:', areaData.data.cropBreakdown.length);
    console.log('Farmers in directory:', areaData.data.farmerDirectory.length);

    // 6. Store Owner Login & Product Inventory CRUD
    console.log('\n6. Testing Store Owner Inventory CRUD...');
    const storeLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vijay.agro@krushisevak.in',
        password: 'Store@123',
      }),
    });
    const storeAuth = await storeLoginRes.json();
    console.log('Store Owner logged in:', storeAuth.user.name, '| Shop:', storeAuth.user.shopName);

    // Add Product
    const addProdRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        name: 'Test Bio-Zinc Micronutrient',
        category: 'Fertilizers',
        price: 450,
        stockQuantity: 20,
        unit: 'kg',
      }),
    });
    const addedProd = await addProdRes.json();
    console.log('Added Product:', addedProd.product.name, '| ID:', addedProd.product._id);
    const prodId = addedProd.product._id;

    // Patch Stock
    const patchStockRes = await fetch(`${baseUrl}/products/${prodId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({ stockQuantity: 15, isOutOfStock: false }),
    });
    const patched = await patchStockRes.json();
    console.log('Patched stock quantity:', patched.product.stockQuantity);

    // Delete Product
    const delProdRes = await fetch(`${baseUrl}/products/${prodId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${storeAuth.token}` },
    });
    const delProdData = await delProdRes.json();
    console.log('Deleted Product:', delProdData.message);

    // 7. Customer Login & Orders
    console.log('\n7. Testing Customer Orders...');
    const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sunita.customer@krushisevak.in',
        password: 'Customer@123',
      }),
    });
    const custAuth = await custLoginRes.json();
    const ordersRes = await fetch(`${baseUrl}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${custAuth.token}` },
    });
    const ordersData = await ordersRes.json();
    console.log('Customer orders count:', ordersData.count);

    // 8. Weather Service
    console.log('\n8. Testing Weather Service...');
    const weatherRes = await fetch(`${baseUrl}/weather?location=Rahuri&district=Ahmednagar`);
    const weatherData = await weatherRes.json();
    console.log('Weather for:', weatherData.weather.location, '| Temp:', weatherData.weather.temperature + '°C');
    console.log('Forecast days:', weatherData.weather.forecast.length);
    console.log('Advisories:', weatherData.weather.advisories.length);

    console.log('\n======================================================');
    console.log(' ALL 8 KRUSHISEVAK PHASE 2 INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n Test Failed:', err.message);
    process.exit(1);
  }
};

runIntegrationTests();
