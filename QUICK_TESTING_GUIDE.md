# Quick Testing Guide - Farmer Portal Updates

## 🚀 Start the Application

```bash
# Terminal 1 - Backend
cd backend
node server.js
# Should show: Server running on port 5000

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should show: http://localhost:5173
```

---

## ✅ Test 1: Multiple Image Upload (5 Minutes)

### Using Postman/Thunder Client:

**Step 1: Login as Farmer**
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "farmer@test.com",
  "password": "your-password"
}

Copy the "token" from response
```

**Step 2: Create Crop Listing**
```
POST http://localhost:5000/api/crop-listings
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (JSON):
{
  "cropName": "Tomatoes",
  "quantity": 100,
  "unit": "kg",
  "pricePerUnit": 50,
  "expiryDate": "2026-10-05"
}

Copy the listing "_id" from response
```

**Step 3: Upload 5 Images**
```
POST http://localhost:5000/api/crop-listings/LISTING_ID_HERE/images
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (form-data):
  images: [Select 5 image files]

Expected Response:
{
  "success": true,
  "message": "5 crop photo(s) uploaded",
  "imagesUploaded": 5,
  "listing": {
    "images": [
      "/uploads/crops/crop-xxx-1.jpg",
      "/uploads/crops/crop-xxx-2.jpg",
      "/uploads/crops/crop-xxx-3.jpg",
      "/uploads/crops/crop-xxx-4.jpg",
      "/uploads/crops/crop-xxx-5.jpg"
    ]
  }
}
```

✅ **Success**: 5 images uploaded and saved

---

## ✅ Test 2: Complete Farmer Flow (10 Minutes)

### Using the Browser (http://localhost:5173):

**1. Register as Farmer**
- Click "Register"
- Fill form:
  - Name: Test Farmer
  - Email: testfarmer@example.com
  - Password: Test123!
  - Mobile: 9876543210
  - Role: Select "Farmer"
- Click Register

**2. Update Profile**
- Go to Profile page
- Fill location:
  - Village: Patoda
  - Taluka: Yeola
  - District: Nashik
  - Land Size: 5 acres
  - Crops: Wheat, Onion
- Click Update
- Check backend console for: "Geocoding successful"

**3. Add Cultivated Crop**
- Go to Farmer Dashboard
- Click "My Crops" or "Add Crop"
- Fill:
  - Crop Name: Wheat
  - Acreage: 3
  - Season: Rabi
- Click Add
- Verify crop appears in list

**4. Create Crop Listing**
- Go to "My Listings" or "Sell Crops"
- Click "Create New Listing"
- Fill:
  - Crop: Wheat
  - Quantity: 50
  - Unit: quintal
  - Price: 2500
  - Quality: Grade A
  - Expiry: Select date 7 days from now
- Click Create

**5. Upload Images**
- Find your newly created listing
- Click "Upload Images" or similar
- Select 5 crop photos
- Click Upload
- Verify all 5 images appear

**6. View as Customer**
- Logout
- Login/Register as Customer
- Go to "Marketplace"
- Select: District: Nashik, Taluka: Yeola
- Search: Wheat
- Find your listing
- Click to open
- **Verify**:
  - ✅ All 5 images display
  - ✅ Farmer name: Test Farmer
  - ✅ Location: Patoda, Yeola, Nashik
  - ✅ Price: ₹2500/quintal
  - ✅ Quantity: 50 quintal

**7. Check Crop & Area Data**
- Go to "Crop & Area Data"
- Select: District: Nashik, Taluka: Yeola
- **Verify**:
  - ✅ Test Farmer appears in directory
  - ✅ Shows 1 active listing
  - ✅ Wheat shown in crop breakdown
  - ✅ GPS indicator present (if geocoding worked)

✅ **Success**: Complete flow working end-to-end

---

## ✅ Test 3: Auto-Expiry (2 Minutes)

### Using Postman:

**Create listing with past expiry date:**
```
POST http://localhost:5000/api/crop-listings
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (JSON):
{
  "cropName": "Test Expired",
  "quantity": 10,
  "unit": "kg",
  "pricePerUnit": 100,
  "expiryDate": "2020-01-01"
}
```

**Fetch all listings:**
```
GET http://localhost:5000/api/crop-listings?status=Available

Expected: "Test Expired" listing NOT in results
```

**Verify in database:**
```
GET http://localhost:5000/api/crop-listings/my-listings
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE

Expected: "Test Expired" listing shows:
  "status": "Expired"
  "isActive": false
```

✅ **Success**: Expired listings auto-hidden from customers

---

## ✅ Test 4: Kendra Real Data (5 Minutes)

### Using Browser:

**1. Register as Store Owner**
- Register with role: "Store Owner"
- Fill shop details

**2. Add Products**
- Go to Kendra Dashboard
- Click "Add Product"
- Fill:
  - Name: Urea Fertilizer
  - Category: Fertilizers
  - Price: 350
  - Stock: 100
  - Unit: bag
- Upload product image
- Click Add

**3. View as Customer**
- Logout, login as Customer
- Go to "Krushi Seva Kendra"
- **Verify**:
  - ✅ Only real Kendra shops appear
  - ✅ Only products they actually added
  - ✅ Real images, prices, stock
  - ✅ No dummy vegetable/fruit images

✅ **Success**: Kendra uses real data only

---

## ✅ Test 5: District/Taluka Filtering (3 Minutes)

### Using Browser (Customer view):

**1. Go to Crop & Area Data**
- Select District: Nashik
- **Verify**: Taluka dropdown shows only Nashik's talukas
  - ✅ Yeola, Niphad, Malegaon, etc.
  - ❌ NOT: Baramati (that's Pune)

**2. Select another District**
- Change District: Pune
- **Verify**: Taluka dropdown updates to Pune's talukas
  - ✅ Baramati, Haveli, etc.
  - ❌ NOT: Yeola (that's Nashik)

**3. Select Taluka**
- District: Nashik, Taluka: Yeola
- **Verify**: Only Yeola farmers appear in directory

**4. Go to Marketplace**
- Select: District: Nashik, Taluka: Yeola
- Search: Any crop
- **Verify**: Only Yeola farmers' listings appear

✅ **Success**: Dynamic district/taluka filtering working

---

## 🎯 Quick Verification Checklist

After all tests, verify:

- [ ] Can upload 5 images per listing
- [ ] All 5 images display correctly
- [ ] Expired listings auto-hide
- [ ] Kendra shows only real products
- [ ] Crop & Area Data shows real farmers
- [ ] District dropdown has all Maharashtra districts
- [ ] Selecting district updates taluka list correctly
- [ ] Only selected taluka's farmers/listings appear
- [ ] Farmer location auto-geocoded
- [ ] Customer sees farmer GPS location
- [ ] Complete flow works: Register → Profile → Crop → Listing → Images → Customer View

---

## 🐛 Troubleshooting

### Images not uploading?
```bash
# Check uploads folder exists
ls backend/uploads/crops/

# Create if missing
mkdir -p backend/uploads/crops/
```

### Listings not appearing?
```bash
# Check listing is active
# In Postman:
GET http://localhost:5000/api/crop-listings/my-listings
# Verify: isActive: true, status: "Available"
```

### Taluka dropdown empty?
```bash
# Check farmer has district set
# In profile, must have district selected
# Backend builds talukas from registered farmers
```

### Location not geocoding?
```bash
# Check backend logs for:
"Geocoding successful: lat, lng"

# If fails:
"Geocoding failed - location will not be available"
# This is OK - feature continues without GPS
```

---

## ✅ All Tests Passed?

If all tests pass:

✅ **Multiple image upload working**
✅ **Auto-expiry working**
✅ **Real data only (no dummy)**
✅ **Complete farmer → customer flow**
✅ **District/taluka filtering correct**
✅ **Location features functional**

**System is ready!** 🎉

---

## 📖 More Details

For complete documentation, see:
- `FARMER_PORTAL_UPDATE.md` - Full technical docs
- `LOCATION_GEOCODING.md` - Location features
- `LOCATION_UPDATE_SUMMARY.md` - Location implementation

---

*Quick Testing Guide Complete* ✅
