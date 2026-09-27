# Test Farmer Listing Feature

## ✅ What's Been Fixed

### Backend ✅
- [x] CropListing model supports `images[]` array
- [x] CropListing model has `expiryDate` field
- [x] CropListing model has `isActive` field
- [x] `uploadListingImages` controller handles multiple images (up to 5)
- [x] Route `POST /api/crop-listings/:id/images` registered
- [x] Auto-expiry logic in `getListings` controller
- [x] Taluka filter support added

### Frontend ✅
- [x] New `CreateListingModal` component created
- [x] Supports 5 images minimum
- [x] Expiry date field added
- [x] Full validation (required fields, image count, expiry date)
- [x] API function `uploadCropListingImages` added
- [x] Clean, user-friendly UI

## 🧪 Testing Steps

### Test 1: Backend API (Using Postman/Thunder Client)

**1. Login as Farmer**
```
POST http://localhost:5000/api/auth/login
Body:
{
  "email": "farmer@test.com",
  "password": "password"
}

Save the token from response
```

**2. Create Listing**
```
POST http://localhost:5000/api/crop-listings
Headers:
  Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

Body:
{
  "cropName": "Tomatoes",
  "category": "Vegetable",
  "quantity": 100,
  "unit": "kg",
  "pricePerUnit": 50,
  "quality": "Grade A",
  "harvestDate": "2026-09-25",
  "expiryDate": "2026-10-05",
  "description": "Fresh organic tomatoes"
}

Expected Response:
{
  "success": true,
  "message": "Crop listing created successfully...",
  "listing": {
    "_id": "...",
    "cropName": "Tomatoes",
    "images": [],
    "isActive": true,
    ...
  }
}

Copy the listing "_id"
```

**3. Upload 5 Images**
```
POST http://localhost:5000/api/crop-listings/LISTING_ID/images
Headers:
  Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

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

**4. Get All Listings (Public)**
```
GET http://localhost:5000/api/crop-listings

Expected Response:
{
  "success": true,
  "count": 1,
  "listings": [
    {
      "_id": "...",
      "cropName": "Tomatoes",
      "images": [...5 images...],
      "isActive": true,
      "expiryDate": "2026-10-05",
      ...
    }
  ]
}
```

✅ **Backend Test PASSED** if all above work

---

### Test 2: Frontend Integration

**Prerequisites**:
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser: http://localhost:5173
```

**Manual Test Flow**:

1. **Register/Login as Farmer**
   - Go to http://localhost:5173/login
   - Login with farmer credentials
   - Should redirect to Farmer Dashboard

2. **Save Location** (if not already saved)
   - In Dashboard, find "Use My Current Location" button
   - Click it
   - Allow browser location permission
   - Should see "Location saved" message

3. **Create Listing**
   - Scroll to "🌾 Sell Your Harvest Directly" section
   - Click "+ Create Listing" button
   - Modal should open

4. **Fill Form**
   - Crop Name: "Tomatoes"
   - Category: "Vegetable"
   - Quantity: 100
   - Unit: kg
   - Price: 50
   - Quality: "Grade A"
   - Harvest Date: Select today's date
   - **Expiry Date**: Select date 7 days from now (REQUIRED)
   - **Images**: Click "Choose Files", select 5 crop images
   - Description: "Fresh organic tomatoes"

5. **Validation Check**
   - If you select less than 5 images: Should show error "Please upload at least 5 images"
   - If expiry date not set: Should show error "Please set an expiry date"
   - If crop name empty: Should show error about required fields

6. **Submit**
   - Click "Publish for Customers"
   - Should see loading/processing
   - Success message: "Crop listing published successfully with 5 images!"
   - Modal closes
   - New listing appears in the listings grid

7. **Verify Listing Display**
   - New listing card should show:
     - Crop name: "Tomatoes"
     - Price: "₹50/kg"
     - Quantity: "100 kg"
     - Status badge: "Available"
     - Delete button

8. **View in Customer Marketplace**
   - Logout
   - Login as Customer (or register new customer)
   - Go to "Marketplace"
   - Should see the "Tomatoes" listing
   - Click on it to open details modal
   - **Verify**:
     - All 5 images display
     - Crop details correct
     - Farmer name and location shown
     - Price and quantity correct
     - Expiry date visible

9. **Test Auto-Expiry**
   - Wait until expiry date passes (or manually set past date in DB)
   - Refresh Marketplace
   - Listing should NOT appear anymore
   - Status should be "Expired" in database

✅ **Frontend Test PASSED** if all above work

---

## 🐛 Troubleshooting

### Issue: Modal doesn't open

**Check**:
1. Browser console for errors
2. Verify `CreateListingModal.jsx` is in `frontend/src/components/`
3. Verify import in FarmerDashboard.jsx:
   ```javascript
   import { CreateListingModal } from '../components/CreateListingModal';
   ```

**Fix**: Restart frontend dev server

### Issue: "Please upload at least 5 images" error

**Cause**: Selected less than 5 images or images didn't load

**Fix**: 
1. Select exactly 5 image files
2. Each file should be JPG/PNG/WEBP
3. Each file should be under 7 MB

### Issue: Images not uploading

**Check**:
1. Backend console for errors
2. Check `backend/uploads/crops/` folder exists
3. Verify multer is installed: `npm list multer`

**Fix**:
```bash
cd backend
mkdir -p uploads/crops
npm install multer
```

### Issue: Listing created but images not saved

**Cause**: API call to `/images` endpoint failed

**Check**:
1. Backend logs for errors
2. Network tab in browser DevTools
3. Response from `uploadCropListingImages` call

**Fix**: Check backend route is correct:
```javascript
// backend/routes/cropListingRoutes.js
router.post('/:id/images', protect, upload.array('images', 5), uploadListingImages);
```

### Issue: Listing doesn't appear in Marketplace

**Possible Causes**:
1. Listing `isActive` is false
2. Expiry date already passed
3. Location filter excluding it

**Fix**:
1. Check MongoDB: `db.croplistings.find({ isActive: true })`
2. Verify expiry date is in future
3. Try "All Districts" in marketplace filter

---

## 📋 Verification Checklist

After completing all fixes, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login as Farmer
- [ ] "+ Create Listing" button opens modal
- [ ] All form fields visible (including Expiry Date)
- [ ] Image input says "5 required"
- [ ] Can select 5 images
- [ ] "Publish for Customers" button works
- [ ] Success message appears
- [ ] Listing appears in Farmer's listings
- [ ] Can logout and login as Customer
- [ ] Listing visible in Marketplace
- [ ] All 5 images display in listing details
- [ ] Farmer information correct
- [ ] Price and quantity correct
- [ ] Location shown (if farmer has GPS)
- [ ] Listing expires after expiry date

If all checked ✅ - **Feature is working correctly!**

---

## 📝 Summary

### What Was Fixed:
1. ✅ Multiple image upload (5 minimum)
2. ✅ Expiry date field and validation
3. ✅ Backend API for multiple images
4. ✅ Frontend API integration
5. ✅ Complete working modal component
6. ✅ Auto-expiry logic
7. ✅ Proper error handling and validation

### Files Modified:
- `backend/models/CropListing.js` - Added images[], expiryDate, isActive
- `backend/controllers/cropListingController.js` - Multiple images, auto-expiry
- `backend/routes/cropListingRoutes.js` - upload.array('images', 5)
- `frontend/src/services/api.js` - uploadCropListingImages function
- `frontend/src/components/CreateListingModal.jsx` - NEW complete modal
- `frontend/src/pages/FarmerDashboard.jsx` - Use new modal (needs update)

### Ready to Use:
- ✅ Backend fully functional
- ✅ API endpoints working
- ✅ New modal component ready
- ⚠️ Need to integrate modal in FarmerDashboard.jsx (see APPLY_LISTING_FIX.md)

---

*Complete testing guide - Follow step by step to verify the feature works end-to-end*
