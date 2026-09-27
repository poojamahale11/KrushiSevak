# KrushiSevak Website - Complete Setup & Startup Guide

## 🚀 Quick Start (Run Both Backend and Frontend)

### Step 1: Start MongoDB (Required)
Make sure MongoDB is running on your system:
```powershell
# Check if MongoDB is running
mongod --version

# If not running, start MongoDB service
net start MongoDB
```

### Step 2: Start Backend Server
Open a **new terminal** and run:
```powershell
cd backend
npm install
node server.js
```

✅ You should see: `🚀 KrushiSevak Backend Server running on http://localhost:5000`

### Step 3: Start Frontend Application
Open **another new terminal** and run:
```powershell
cd frontend
npm install
npm run dev
```

✅ You should see: `Local: http://localhost:5173/`

### Step 4: Access the Website
Open your browser and go to: **http://localhost:5173**

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to server" error on registration

**Solution:**
1. Verify backend is running on http://localhost:5000
2. Check terminal for backend errors
3. Ensure MongoDB is running and connected
4. Check backend/.env file has correct settings

### Problem: MongoDB connection error

**Solution:**
```powershell
# Check MongoDB status
net start MongoDB

# Or start MongoDB manually
mongod --dbpath="C:\data\db"
```

### Problem: Port already in use

**Solution:**
```powershell
# For backend (port 5000)
netstat -ano | findstr :5000
# Kill the process if needed

# For frontend (port 5173)
netstat -ano | findstr :5173
# Kill the process if needed
```

---

## 📋 Environment Configuration

### Backend Environment (.env)
Location: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/krushisevak
JWT_SECRET=krushisevak_super_secret_jwt_key_2026_phase1_safe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### MongoDB Database
- Database Name: `krushisevak`
- Connection: `mongodb://127.0.0.1:27017/krushisevak`

---

## 🌐 Website Features

1. **User Registration & Login**
   - Farmer accounts
   - Customer accounts
   - Store Owner (Krushi Seva Kendra) accounts

2. **Farmer Dashboard**
   - Crop management
   - Disease detection
   - Weather information
   - AI Assistant
   - Marketplace listings

3. **Customer Dashboard**
   - Browse products
   - Order from Krushi Seva Kendras
   - Buy crops from farmers
   - Track orders

4. **Store Owner Dashboard**
   - Manage inventory
   - Process orders
   - Stock management

5. **AI Features**
   - Multilingual chatbot
   - Crop disease detection
   - Farming advice

---

## 🛠 Development Commands

### Backend
```powershell
cd backend
npm install          # Install dependencies
node server.js       # Start server
node seed/seed.js    # Seed database with sample data
```

### Frontend
```powershell
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## ✅ Complete System Check

Run these commands to verify everything is working:

```powershell
# 1. Check MongoDB
mongo --eval "db.version()"

# 2. Check Backend
curl http://localhost:5000/api/health

# 3. Check Frontend
curl http://localhost:5173
```

---

## 📞 Support

If you encounter any issues:
1. Check both terminal windows for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Clear browser cache and try again
5. Restart both backend and frontend servers

---

## 🎯 Next Steps After Setup

1. Create a test account (Farmer/Customer/Store Owner)
2. Explore the dashboard features
3. Test the AI Assistant
4. Try disease detection (upload crop images)
5. Browse marketplace and place test orders

**Website is ready! Happy farming! 🌾**
