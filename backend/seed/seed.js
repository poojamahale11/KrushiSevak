const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Product = require('../models/Product');
const Order = require('../models/Order');

const seedUsers = [
  // 1. Primary Demo Farmer - Ahmednagar
  {
    name: 'Ramesh Patil',
    email: 'ramesh.farmer@krushisevak.in',
    mobile: '9876543210',
    password: 'Farmer@123',
    role: 'farmer',
    village: 'Rahuri',
    taluka: 'Rahuri',
    district: 'Ahmednagar',
    landSize: '6.5 Acres',
    crops: ['Sugarcane', 'Onion', 'Wheat', 'Soyabean'],
    address: 'At Post Rahuri, Taluka Rahuri, Dist. Ahmednagar, Maharashtra 413705',
  },
  // 2. Demo Farmer 2 - Nashik
  {
    name: 'Bhausaheb Shinde',
    email: 'bhausaheb.farmer@krushisevak.in',
    mobile: '9823112233',
    password: 'Farmer@123',
    role: 'farmer',
    village: 'Niphad',
    taluka: 'Niphad',
    district: 'Nashik',
    landSize: '8.0 Acres',
    crops: ['Grapes', 'Onion', 'Tomato', 'Pomegranate'],
    address: 'Near Godavari Canal, Niphad, Dist. Nashik, Maharashtra 422303',
  },
  // 3. Demo Farmer 3 - Pune
  {
    name: 'Santosh Jadhav',
    email: 'santosh.farmer@krushisevak.in',
    mobile: '9834556677',
    password: 'Farmer@123',
    role: 'farmer',
    village: 'Baramati',
    taluka: 'Baramati',
    district: 'Pune',
    landSize: '4.5 Acres',
    crops: ['Sugarcane', 'Cotton', 'Bajra', 'Wheat'],
    address: 'Jalochi Road, Baramati, Dist. Pune, Maharashtra 413102',
  },
  // 4. Demo Farmer 4 - Kolhapur
  {
    name: 'Ananda Gaikwad',
    email: 'ananda.farmer@krushisevak.in',
    mobile: '9850123456',
    password: 'Farmer@123',
    role: 'farmer',
    village: 'Karveer',
    taluka: 'Karveer',
    district: 'Kolhapur',
    landSize: '5.0 Acres',
    crops: ['Sugarcane', 'Rice', 'Groundnut', 'Soyabean'],
    address: 'Shiroli Pulachi, Karveer, Dist. Kolhapur, Maharashtra 416122',
  },
  // 5. Demo Farmer 5 - Chhatrapati Sambhajinagar
  {
    name: 'Kailas Rathod',
    email: 'kailas.farmer@krushisevak.in',
    mobile: '9860987654',
    password: 'Farmer@123',
    role: 'farmer',
    village: 'Paithan',
    taluka: 'Paithan',
    district: 'Sambhajinagar',
    landSize: '7.2 Acres',
    crops: ['Cotton', 'Sweet Lime (Mosambi)', 'Bajra', 'Jowar'],
    address: 'Near Jayakwadi Dam, Paithan, Dist. Sambhajinagar, Maharashtra 431107',
  },
  // 6. Demo Customer
  {
    name: 'Sunita Deshmukh',
    email: 'sunita.customer@krushisevak.in',
    mobile: '9822334455',
    password: 'Customer@123',
    role: 'customer',
    address: 'Flat 402, Green Meadows, Kothrud, Pune, Maharashtra 411038',
  },
  // 7. Demo Store Owner
  {
    name: 'Vijay Shetkari',
    email: 'vijay.agro@krushisevak.in',
    mobile: '9811223344',
    password: 'Store@123',
    role: 'storeOwner',
    shopName: 'Kisan Agri Seva Kendra & Seeds',
    shopAddress: 'Shop No. 12, APMC Market Yard, Station Road, Ahmednagar, Maharashtra 414001',
    shopContact: '9811223344',
    district: 'Ahmednagar',
    address: 'APMC Market Yard, Ahmednagar, Maharashtra 414001',
  },
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krushisevak';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // 1. Clean up existing demo data
    const emails = seedUsers.map((u) => u.email.toLowerCase());
    const existingUsers = await User.find({ email: { $in: emails } });
    const userIds = existingUsers.map((u) => u._id);

    await Crop.deleteMany({ farmer: { $in: userIds } });
    await Product.deleteMany({ storeOwner: { $in: userIds } });
    await Order.deleteMany({ customer: { $in: userIds } });
    await User.deleteMany({ email: { $in: emails } });
    console.log('Cleaned up previous demo collections.');

    // 2. Hash passwords & insert Users
    const preparedUsers = await Promise.all(
      seedUsers.map(async (userData) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);
        const { password, ...rest } = userData;
        return {
          ...rest,
          email: rest.email.toLowerCase(),
          passwordHash,
        };
      })
    );

    const insertedUsers = await User.insertMany(preparedUsers);
    console.log(` Inserted ${insertedUsers.length} demo accounts.`);

    const ramesh = insertedUsers.find((u) => u.email === 'ramesh.farmer@krushisevak.in');
    const bhausaheb = insertedUsers.find((u) => u.email === 'bhausaheb.farmer@krushisevak.in');
    const santosh = insertedUsers.find((u) => u.email === 'santosh.farmer@krushisevak.in');
    const ananda = insertedUsers.find((u) => u.email === 'ananda.farmer@krushisevak.in');
    const kailas = insertedUsers.find((u) => u.email === 'kailas.farmer@krushisevak.in');
    const sunita = insertedUsers.find((u) => u.email === 'sunita.customer@krushisevak.in');
    const vijay = insertedUsers.find((u) => u.email === 'vijay.agro@krushisevak.in');

    // 3. Seed Crop data
    const cropsToSeed = [
      // Ramesh (Ahmednagar - Rahuri)
      {
        farmer: ramesh._id,
        farmerName: ramesh.name,
        village: ramesh.village,
        taluka: ramesh.taluka,
        district: ramesh.district,
        cropName: 'Sugarcane (Co 86032)',
        category: 'Cash Crop',
        acreage: 2.5,
        season: 'Perennial / Annual',
        sowingDate: '2025-11-10',
        expectedHarvestDate: '2026-12-15',
        expectedYield: '85-90 Tonnes/Acre',
        status: 'Growing',
        notes: 'Drip irrigation connected with sugarcane research institute recommendations.',
      },
      {
        farmer: ramesh._id,
        farmerName: ramesh.name,
        village: ramesh.village,
        taluka: ramesh.taluka,
        district: ramesh.district,
        cropName: 'Red Onion (Gavran)',
        category: 'Vegetable',
        acreage: 2.0,
        season: 'Rabi',
        sowingDate: '2026-01-15',
        expectedHarvestDate: '2026-05-10',
        expectedYield: '120 Quintals',
        status: 'Ready for Harvest',
        notes: 'Good bulb size, export grade quality.',
      },
      {
        farmer: ramesh._id,
        farmerName: ramesh.name,
        village: ramesh.village,
        taluka: ramesh.taluka,
        district: ramesh.district,
        cropName: 'Sharbati Wheat',
        category: 'Grain',
        acreage: 1.2,
        season: 'Rabi',
        sowingDate: '2025-12-05',
        expectedHarvestDate: '2026-04-10',
        expectedYield: '22 Quintals',
        status: 'Harvested',
        notes: 'Stored in farm warehouse, ready for customer order direct sale.',
      },
      {
        farmer: ramesh._id,
        farmerName: ramesh.name,
        village: ramesh.village,
        taluka: ramesh.taluka,
        district: ramesh.district,
        cropName: 'Soyabean (JS 335)',
        category: 'Oilseed',
        acreage: 0.8,
        season: 'Kharif',
        sowingDate: '2026-06-25',
        expectedHarvestDate: '2026-10-15',
        expectedYield: '10 Quintals',
        status: 'Planned',
        notes: 'Pre-monsoon soil preparation completed.',
      },

      // Bhausaheb (Nashik - Niphad)
      {
        farmer: bhausaheb._id,
        farmerName: bhausaheb.name,
        village: bhausaheb.village,
        taluka: bhausaheb.taluka,
        district: bhausaheb.district,
        cropName: 'Thompson Seedless Grapes',
        category: 'Fruit',
        acreage: 4.0,
        season: 'Perennial / Annual',
        sowingDate: '2024-04-01',
        expectedHarvestDate: '2026-03-20',
        expectedYield: '14 Tonnes',
        status: 'Ready for Harvest',
        notes: 'Export quality table grapes, brix sugar level > 18.',
      },
      {
        farmer: bhausaheb._id,
        farmerName: bhausaheb.name,
        village: bhausaheb.village,
        taluka: bhausaheb.taluka,
        district: bhausaheb.district,
        cropName: 'Nashik Red Onion',
        category: 'Vegetable',
        acreage: 2.5,
        season: 'Kharif',
        sowingDate: '2026-06-15',
        expectedHarvestDate: '2026-10-30',
        expectedYield: '150 Quintals',
        status: 'Growing',
        notes: 'Nursery plantation completed.',
      },
      {
        farmer: bhausaheb._id,
        farmerName: bhausaheb.name,
        village: bhausaheb.village,
        taluka: bhausaheb.taluka,
        district: bhausaheb.district,
        cropName: 'Bhagwa Pomegranate',
        category: 'Fruit',
        acreage: 1.5,
        season: 'Perennial / Annual',
        sowingDate: '2024-08-10',
        expectedHarvestDate: '2026-09-15',
        expectedYield: '8 Tonnes',
        status: 'Growing',
        notes: 'Orchard under micro-spray nutrition.',
      },

      // Santosh (Pune - Baramati)
      {
        farmer: santosh._id,
        farmerName: santosh.name,
        village: santosh.village,
        taluka: santosh.taluka,
        district: santosh.district,
        cropName: 'Sugarcane',
        category: 'Cash Crop',
        acreage: 2.5,
        season: 'Perennial / Annual',
        sowingDate: '2025-10-15',
        expectedHarvestDate: '2026-11-20',
        expectedYield: '75 Tonnes',
        status: 'Growing',
        notes: 'Co-op sugar factory registered.',
      },
      {
        farmer: santosh._id,
        farmerName: santosh.name,
        village: santosh.village,
        taluka: santosh.taluka,
        district: santosh.district,
        cropName: 'Hybrid Cotton',
        category: 'Cash Crop',
        acreage: 2.0,
        season: 'Kharif',
        sowingDate: '2026-06-20',
        expectedHarvestDate: '2026-12-10',
        expectedYield: '16 Quintals',
        status: 'Growing',
        notes: 'Bollgard II hybrid variety.',
      },

      // Ananda (Kolhapur - Karveer)
      {
        farmer: ananda._id,
        farmerName: ananda.name,
        village: ananda.village,
        taluka: ananda.taluka,
        district: ananda.district,
        cropName: 'Kolhapur Sugarcane',
        category: 'Cash Crop',
        acreage: 3.0,
        season: 'Perennial / Annual',
        sowingDate: '2025-09-01',
        expectedHarvestDate: '2026-10-30',
        expectedYield: '110 Tonnes',
        status: 'Growing',
        notes: 'Panchganga river basin fertile black soil.',
      },
      {
        farmer: ananda._id,
        farmerName: ananda.name,
        village: ananda.village,
        taluka: ananda.taluka,
        district: ananda.district,
        cropName: 'Indrayani Fragrant Rice',
        category: 'Grain',
        acreage: 2.0,
        season: 'Kharif',
        sowingDate: '2026-06-10',
        expectedHarvestDate: '2026-11-05',
        expectedYield: '30 Quintals',
        status: 'Growing',
        notes: 'Natural organic cultivation.',
      },

      // Kailas (Sambhajinagar - Paithan)
      {
        farmer: kailas._id,
        farmerName: kailas.name,
        village: kailas.village,
        taluka: kailas.taluka,
        district: kailas.district,
        cropName: 'BT Cotton',
        category: 'Cash Crop',
        acreage: 4.2,
        season: 'Kharif',
        sowingDate: '2026-06-25',
        expectedHarvestDate: '2026-12-25',
        expectedYield: '32 Quintals',
        status: 'Growing',
        notes: 'Deep black soil cultivation.',
      },
      {
        farmer: kailas._id,
        farmerName: kailas.name,
        village: kailas.village,
        taluka: kailas.taluka,
        district: kailas.district,
        cropName: 'Sweet Lime (Mosambi)',
        category: 'Fruit',
        acreage: 3.0,
        season: 'Perennial / Annual',
        sowingDate: '2023-07-15',
        expectedHarvestDate: '2026-08-30',
        expectedYield: '18 Tonnes',
        status: 'Ready for Harvest',
        notes: 'Famous Marathwada GI Sweet Lime.',
      },
    ];

    const insertedCrops = await Crop.insertMany(cropsToSeed);
    console.log(` Inserted ${insertedCrops.length} farm crop records.`);

    // 4. Seed Products for Store Owner (Vijay)
    const productsToSeed = [
      {
        name: 'Mahyco Hybrid Cotton Seeds (MRC 7351)',
        category: 'Seeds',
        price: 860,
        stockQuantity: 45,
        unit: 'packet (450g)',
        isOutOfStock: false,
        brand: 'Mahyco Seeds',
        description: 'Certified BG-II high-yielding hybrid cotton seed with excellent boll retention.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: 'Panchganga Gavran Red Onion Seeds',
        category: 'Seeds',
        price: 1450,
        stockQuantity: 30,
        unit: 'kg',
        isOutOfStock: false,
        brand: 'Panchganga',
        description: 'High germination rate, uniform globe shape, strong storage durability up to 6 months.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: 'Neem Coated Urea (46% Nitrogen)',
        category: 'Urea',
        price: 266,
        stockQuantity: 120,
        unit: 'bag (45 kg)',
        isOutOfStock: false,
        brand: 'IFFCO / RCF',
        description: 'Govt subsidized neem coated fertilizer for balanced vegetative growth and nitrogen efficiency.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: 'Mahadhan 19:19:19 100% Water Soluble Fertilizer',
        category: 'Fertilizers',
        price: 1850,
        stockQuantity: 25,
        unit: 'bag (25 kg)',
        isOutOfStock: false,
        brand: 'Mahadhan',
        description: 'Drip grade NPK balanced nutrition for vegetable crops, sugarcane, and fruit orchards.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: 'Coragen Insecticide (Chlorantraniliprole 18.5% SC)',
        category: 'Pesticides',
        price: 1680,
        stockQuantity: 18,
        unit: 'bottle (150 ml)',
        isOutOfStock: false,
        brand: 'FMC',
        description: 'Broad-spectrum pest protection against sugarcane borer, cotton bollworm, and fruit borers.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: 'Kocide 3000 Copper Hydroxide Bio-Fungicide',
        category: 'Pesticides',
        price: 920,
        stockQuantity: 0,
        unit: 'pack (500 g)',
        isOutOfStock: true,
        brand: 'Corteva Agriscience',
        description: 'Advanced copper fungicide for downy mildew, anthracnose, and bacterial leaf blight.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: '16L Battery Operated Knapsack Agri Sprayer',
        category: 'Equipment & Tools',
        price: 2450,
        stockQuantity: 12,
        unit: 'unit',
        isOutOfStock: false,
        brand: 'KisanKranti Agro',
        description: 'Rechargeable 12V 8Ah battery, stainless steel lance with 4 nozzle attachments.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
      {
        name: 'Organic Neem Cake Powder Soil Conditioner',
        category: 'Other agricultural products',
        price: 850,
        stockQuantity: 50,
        unit: 'bag (50 kg)',
        isOutOfStock: false,
        brand: 'GreenBio Earth',
        description: '100% natural organic soil amendment and nematode repellent for healthy root systems.',
        storeOwner: vijay._id,
        shopName: vijay.shopName,
        shopContact: vijay.shopContact,
        shopAddress: vijay.shopAddress,
        district: vijay.district,
      },
    ];

    const insertedProducts = await Product.insertMany(productsToSeed);
    console.log(` Inserted ${insertedProducts.length} store inventory products.`);

    // 5. Seed Customer Orders for Sunita
    const sampleOrders = [
      {
        customer: sunita._id,
        customerName: sunita.name,
        items: [
          {
            name: 'Fresh Farm Gavran Red Onions (Direct Harvest)',
            category: 'Vegetable',
            price: 28,
            quantity: 25,
            unit: 'kg',
            shopName: 'Ramesh Patil Farm (Rahuri)',
          },
          {
            name: 'Organic Sharbati Whole Wheat Grain',
            category: 'Grain',
            price: 42,
            quantity: 30,
            unit: 'kg',
            shopName: 'Ramesh Patil Farm (Rahuri)',
          },
        ],
        totalAmount: 1960,
        orderStatus: 'Delivered',
        paymentMethod: 'UPI / Online',
        deliveryAddress: sunita.address,
        orderDate: new Date('2026-07-28T10:30:00.000Z'),
      },
      {
        customer: sunita._id,
        customerName: sunita.name,
        items: [
          {
            name: 'Thompson Export Seedless Grapes',
            category: 'Fruit',
            price: 90,
            quantity: 5,
            unit: 'kg box',
            shopName: 'Bhausaheb Shinde Orchards (Niphad)',
          },
          {
            name: 'Fragrant Indrayani Rice (Unpolished)',
            category: 'Grain',
            price: 65,
            quantity: 10,
            unit: 'kg bag',
            shopName: 'Ananda Gaikwad Farm (Kolhapur)',
          },
        ],
        totalAmount: 1100,
        orderStatus: 'Processing',
        paymentMethod: 'Cash on Delivery',
        deliveryAddress: sunita.address,
        orderDate: new Date('2026-08-12T14:15:00.000Z'),
      },
    ];

    const insertedOrders = await Order.insertMany(sampleOrders);
    console.log(` Inserted ${insertedOrders.length} customer order history records.`);

    console.log(`\n======================================================`);
    console.log(` KRUSHISEVAK PHASE 2 DATABASE SEEDING COMPLETED`);
    console.log(`======================================================`);
    console.log(`Demo Logins:`);
    console.log(`🌾 FARMER:      ramesh.farmer@krushisevak.in     / Farmer@123`);
    console.log(`🛒 CUSTOMER:    sunita.customer@krushisevak.in   / Customer@123`);
    console.log(`🏪 STORE OWNER: vijay.agro@krushisevak.in        / Store@123`);
    console.log(`======================================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
