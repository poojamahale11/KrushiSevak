# KrushiSevak Website - Complete Testing Guide

## 🎯 Purpose
This guide will help you verify that the entire website is working correctly after the fixes have been applied.

---

## ✅ What Was Fixed

### Issue: JSON Parsing Error on Registration
**Error Message**: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

**Root Cause**: 
- Frontend API service was not handling empty or malformed responses properly
- No validation for response content before parsing JSON
- Poor error messages for connection failures

**Solution Applied**:
1. ✅ Improved `frontend/src/services/api.js` with better error handling
2. ✅ Added response text validation before JSON parsing
3. ✅ Better error messages for connection issues
4. ✅ User-friendly error messages in registration form
5. ✅ Created automated startup scripts

---

## 🚀 Step 1: Start the Website

### Option A: Automated (Recommended)
```powershell
# Navigate to project root
cd c:\Users\pooja\Downloads\KrushiSevskAntigravity_AIChatbot\KrushiSevskAntigravity_AIChatbot

# Run the startup script
.\start-all.ps1
```

This will:
- Open two new PowerShell windows
- Start backend on http://localhost:5000
- Start frontend on http://localhost:5173

### Option B: Manual

**Terminal 1 - Backend:**
```powershell
cd c:\Users\pooja\Downloads\KrushiSevskAntigravity_AIChatbot\KrushiSevskAntigravity_AIChatbot\backend
node server.js
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\pooja\Downloads\KrushiSevskAntigravity_AIChatbot\KrushiSevskAntigravity_AIChatbot\frontend
npm run dev
```

---

## ✅ Step 2: Verify Backend is Running

### Test 1: Health Check
Open browser or use curl:
```
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.456
}
```

### Test 2: Root Endpoint
```
http://localhost:5000/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "KrushiSevak Backend API is running - Final Kendra + AI Update",
  "version": "8.0.0",
  "timestamp": "2026-09-25T..."
}
```

---

## ✅ Step 3: Verify Frontend is Running

### Test: Open Frontend
Open browser to:
```
http://localhost:5173
```

**Expected Result:**
- KrushiSevak homepage loads
- No console errors
- Navigation menu visible
- "Login" and "Register" buttons visible

---

## ✅ Step 4: Test Registration (CRITICAL TEST)

### Test Case 1: Register as Farmer

1. **Go to Registration Page:**
   - Click "Register" button in navbar
   - OR navigate to: http://localhost:5173/register

2. **Fill in the Form:**
   - **Full Name**: Test Farmer
   - **Email**: testfarmer@test.com
   - **Mobile**: 9876543210
   - **Password**: test123
   - **Role**: Select "Farmer" tab
   - **Village**: Rahuri (optional)
   - **Taluka**: Rahuri (optional)
   - **District**: Ahmednagar (optional)
   - **Land Size**: 5 Acres (optional)
   - **Crops**: Wheat, Sugarcane (optional)

3. **Submit the Form:**
   - Click "Register (Farmer)" button

4. **Expected Result:**
   - ✅ Registration successful
   - ✅ Automatically logged in
   - ✅ Redirected to Farmer Dashboard
   - ✅ No JSON parsing errors
   - ✅ No connection errors

5. **If Error Appears:**
   - Check backend terminal for error messages
   - Verify MongoDB is running: `net start MongoDB`
   - Check browser console (F12) for errors
   - Verify backend is on port 5000

### Test Case 2: Register as Customer

1. **Logout** (if logged in)
2. **Go to Registration Page**
3. **Fill in Form:**
   - **Full Name**: Test Customer
   - **Email**: testcustomer@test.com
   - **Mobile**: 9876543211
   - **Password**: test123
   - **Role**: Select "Customer" tab
   - **Address**: Test Address (optional)

4. **Submit and Verify:**
   - ✅ Registration successful
   - ✅ Redirected to Customer Dashboard

### Test Case 3: Register as Store Owner

1. **Logout** (if logged in)
2. **Go to Registration Page**
3. **Fill in Form:**
   - **Full Name**: Test Store Owner
   - **Email**: teststoreowner@test.com
   - **Mobile**: 9876543212
   - **Password**: test123
   - **Role**: Select "Store Owner" tab
   - **Shop Name**: Test Krushi Seva Kendra (required)
   - **Shop Address**: Test Location (optional)
   - **Shop Contact**: 9876543212 (optional)

4. **Submit and Verify:**
   - ✅ Registration successful
   - ✅ Redirected to Store Owner Dashboard

---

## ✅ Step 5: Test Login

### Test: Login with Registered Account

1. **Logout** (if logged in)
2. **Go to Login Page**: http://localhost:5173/login
3. **Enter Credentials:**
   - Email: testfarmer@test.com
   - Password: test123
   - Role: Farmer
4. **Click Login**
5. **Expected Result:**
   - ✅ Login successful
   - ✅ Redirected to Farmer Dashboard
   - ✅ User name displayed in navbar

---

## ✅ Step 6: Test Core Features

### For Farmers:

1. **Add a Crop:**
   - Go to Farmer Dashboard
   - Click "Add Crop" or similar
   - Fill in crop details
   - Save
   - ✅ Crop should appear in your list

2. **Test Disease Detection:**
   - Go to Disease Detection page
   - Upload a crop image (any image for testing)
   - Click Analyze
   - ✅ Should get analysis result

3. **Create Marketplace Listing:**
   - Go to Marketplace
   - Click "Create Listing" or similar
   - Fill in details
   - ✅ Listing should be created

4. **Test AI Assistant:**
   - Go to AI Assistant page
   - Ask a question: "What is the best time to plant wheat?"
   - ✅ Should get AI response

### For Customers:

1. **Browse Marketplace:**
   - Go to Marketplace
   - ✅ See available crop listings

2. **View Krushi Seva Kendras:**
   - Go to Krushi Seva Kendra page
   - ✅ See registered stores

3. **Place an Order:**
   - Add item to cart
   - Complete checkout
   - ✅ Order should be placed

### For Store Owners:

1. **Add a Product:**
   - Go to Store Dashboard
   - Click "Add Product"
   - Fill in details (name, price, stock)
   - Upload image (optional)
   - ✅ Product should be added

2. **View Orders:**
   - Go to Orders section
   - ✅ See customer orders

3. **Update Order Status:**
   - Click on an order
   - Change status (Pending → Processing → Completed)
   - ✅ Status should update

---

## ✅ Step 7: Test Additional Features

### Test Weather:
- Go to Weather page
- Select location
- ✅ Weather information displayed

### Test Crop Area Data:
- Go to Crop & Area Data page
- Select district/taluka
- ✅ Statistics displayed

### Test Notifications:
- Perform actions (place order, detect disease)
- Click notification bell
- ✅ Notifications appear

### Test Language Switching:
- Click language selector (EN/HI/MR)
- ✅ UI text changes

---

## ❌ Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Symptoms:**
- Error message on registration/login
- Red error alert

**Solution:**
```powershell
# Check if backend is running
curl http://localhost:5000/api/health

# If not running, start it
cd backend
node server.js
```

### Issue 2: MongoDB Connection Error

**Symptoms:**
- Backend terminal shows "MongoDB Connection Error"
- Cannot start backend

**Solution:**
```powershell
# Start MongoDB service
net start MongoDB

# Verify it's running
net start | findstr MongoDB
```

### Issue 3: Port Already in Use

**Symptoms:**
- Error: "Port 5000 is already in use"
- Error: "Port 5173 is already in use"

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual ID)
taskkill /PID <PID> /F
```

### Issue 4: Frontend Shows Blank Page

**Symptoms:**
- White screen
- "Loading..." never completes

**Solution:**
1. Check browser console (F12) for errors
2. Verify frontend is running on port 5173
3. Clear browser cache and reload
4. Restart frontend server

### Issue 5: Old JSON Error Still Appears

**Symptoms:**
- Still seeing "Failed to execute 'json'" error

**Solution:**
```powershell
# Restart both servers
# 1. Stop backend (Ctrl+C)
# 2. Stop frontend (Ctrl+C)

# 3. Start backend
cd backend
node server.js

# 4. Start frontend (new terminal)
cd frontend
npm run dev

# 5. Clear browser cache (Ctrl+Shift+Delete)
# 6. Reload page (Ctrl+F5)
```

---

## 📊 Test Results Checklist

Use this checklist to track your testing progress:

### Backend Tests
- [ ] Backend starts without errors
- [ ] Health check returns "healthy"
- [ ] MongoDB connects successfully
- [ ] API responds on port 5000

### Frontend Tests
- [ ] Frontend starts without errors
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] No console errors

### Registration Tests
- [ ] Farmer registration works
- [ ] Customer registration works
- [ ] Store Owner registration works
- [ ] No JSON parsing errors
- [ ] Proper error messages shown
- [ ] Redirects to correct dashboard

### Login Tests
- [ ] Login works for all roles
- [ ] Token is stored
- [ ] User info displayed
- [ ] Protected routes accessible

### Feature Tests
- [ ] Farmer can add crops
- [ ] Disease detection works
- [ ] AI Assistant responds
- [ ] Marketplace displays listings
- [ ] Store owners can add products
- [ ] Customers can browse and order
- [ ] Notifications work
- [ ] Language switching works

### Error Handling Tests
- [ ] Invalid credentials show error
- [ ] Duplicate email shows error
- [ ] Backend offline shows clear message
- [ ] Form validation works

---

## ✅ Final Verification

If all tests pass, your website is **fully functional**! 🎉

### Success Criteria:
1. ✅ Both servers start without errors
2. ✅ Registration works for all roles
3. ✅ No JSON parsing errors
4. ✅ Login works correctly
5. ✅ Core features are accessible
6. ✅ Error messages are clear and helpful

---

## 📞 Need Help?

If you encounter issues:

1. **Check Terminal Logs:**
   - Backend terminal for server errors
   - Frontend terminal for build errors

2. **Check Browser Console:**
   - Press F12
   - Look for errors in Console tab

3. **Verify Services:**
   - MongoDB is running
   - Backend is on port 5000
   - Frontend is on port 5173

4. **Review Documentation:**
   - `START_WEBSITE.md` - Startup guide
   - `README.md` - Complete documentation
   - `TESTING_GUIDE.md` - This file

---

## 🎓 Testing Tips

1. **Use Different Browsers:** Test in Chrome, Edge, Firefox
2. **Test Incognito Mode:** Ensures fresh state
3. **Clear Cache Regularly:** Ctrl+Shift+Delete
4. **Check Network Tab:** F12 → Network to see API calls
5. **Monitor Terminal Output:** Watch for errors in real-time

---

**Happy Testing! 🚀**

The website is now fully fixed and ready to use!
