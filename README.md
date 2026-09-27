# KrushiSevak - Complete AI-Powered Agricultural Platform 🌾

An intelligent agricultural platform connecting farmers, customers, and Krushi Seva Kendras (Agricultural Service Centers) with AI-powered features.

## 🚀 Quick Start (3 Easy Steps)

### Step 1: Start MongoDB
```powershell
net start MongoDB
```

### Step 2: Run the Startup Script
```powershell
.\start-all.ps1
```

### Step 3: Open Browser
Go to **http://localhost:5173**

That's it! The website should now be running.

---

## 📋 Manual Installation (Alternative Method)

### Prerequisites
- Node.js 18+ (v20/22 recommended)
- MongoDB running on port 27017
- Modern web browser

### Terminal 1 - Backend
```powershell
cd backend
npm install
node server.js
```
✅ Backend runs on http://localhost:5000

### Terminal 2 - Frontend
```powershell
cd frontend
npm install
npm run dev
```
✅ Frontend runs on http://localhost:5173

---

## 🌟 Complete Feature List

### 🌱 For Farmers
- ✅ User registration and role-based authentication
- ✅ Crop management with MongoDB storage
- ✅ AI-powered disease detection (image upload + analysis)
- ✅ Multilingual AI assistant (English, Hindi, Marathi)
- ✅ Weather information by location
- ✅ Farmer-to-customer crop marketplace
- ✅ GPS location for listings (optional)
- ✅ Photo upload for crop listings
- ✅ Real-time notifications
- ✅ Order management

### 🛒 For Customers
- ✅ Browse products and crop listings
- ✅ Search nearby farmers by radius
- ✅ GPS location-based search
- ✅ Direct farmer contact and Google Maps directions
- ✅ Order from Krushi Seva Kendras
- ✅ Purchase crops from farmers
- ✅ Order tracking and history
- ✅ Cart and delivery address management
- ✅ AI assistant for farming advice
- ✅ Notification system

### 🏪 For Store Owners (Krushi Seva Kendras)
- ✅ Product inventory management
- ✅ Photo uploads for products
- ✅ Stock and pricing management
- ✅ Batch/lot number tracking
- ✅ Expiry date management
- ✅ Customer order processing
- ✅ Order status updates
- ✅ Business dashboard
- ✅ Role-specific navigation

### 🤖 AI Features
- ✅ Multilingual chatbot (English, Hindi, Marathi)
- ✅ Text, voice, and image input support
- ✅ Crop disease detection with image recognition
- ✅ Chat history (stored in MongoDB)
- ✅ Personalized farming recommendations
- ✅ Disease detection history

### 📊 Additional Features
- ✅ Crop area statistics by district/taluka/village
- ✅ Weather data using Open-Meteo API (free, no key)
- ✅ Feedback system with 1-5 star ratings
- ✅ Notification system with unread count
- ✅ Responsive UI (desktop/tablet/mobile)
- ✅ Multilingual interface
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **AI**: OpenAI API
- **File Upload**: Multer
- **Weather**: Open-Meteo API

### Frontend
- **Framework**: React 18
- **Router**: React Router v6
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Modern CSS with Variables
- **Context**: React Context API

---

## 📁 Project Structure

```
KrushiSevskAntigravity_AIChatbot/
├── backend/
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── diseaseController.js
│   │   ├── cropController.js
│   │   └── ...
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Crop.js
│   │   ├── Product.js
│   │   └── ...
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & error handling
│   ├── services/          # Business logic
│   ├── uploads/           # Uploaded files
│   │   ├── crops/
│   │   ├── disease/
│   │   └── products/
│   ├── seed/              # Database seeding
│   ├── server.js          # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── FarmerDashboard.jsx
│   │   │   └── ...
│   │   ├── context/       # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js     # Vite configuration
│   └── package.json
│
├── start-all.ps1          # 🚀 Start both servers
├── start-backend.ps1      # Start backend only
├── start-frontend.ps1     # Start frontend only
├── START_WEBSITE.md       # Detailed startup guide
└── README.md              # This file
```

---

## 🔧 Configuration

### Backend Environment (.env)
Location: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/krushisevak
JWT_SECRET=krushisevak_super_secret_jwt_key_2026_phase1_safe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
```

### Frontend Configuration
- Dev server: http://localhost:5173
- API proxy: Configured in `vite.config.js`
- Auto-proxies `/api` and `/uploads` to backend

---

## 🧪 Testing the Website

### 1. Seed Database (Optional)
```powershell
cd backend
npm run seed
```

### 2. Register Test Accounts

**Farmer Account:**
- Email: farmer@test.com
- Password: test123
- Role: Farmer

**Customer Account:**
- Email: customer@test.com
- Password: test123
- Role: Customer

**Store Owner Account:**
- Email: store@test.com
- Password: test123
- Role: Store Owner

### 3. Test Complete Flow

1. ✅ Register a new Farmer account
2. ✅ Login and access Farmer Dashboard
3. ✅ Add crops from dashboard
4. ✅ Create a marketplace listing
5. ✅ Test Disease Detection (upload crop image)
6. ✅ Use AI Assistant (text/voice/image)
7. ✅ Register a Customer account
8. ✅ Browse Marketplace
9. ✅ Search nearby farmers (enable location)
10. ✅ Add items to cart and place order
11. ✅ Register a Store Owner account
12. ✅ Add products with images
13. ✅ Visit Krushi Seva Kendra page
14. ✅ Process customer orders
15. ✅ Check notifications for all roles

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot connect to server"

**Solution:**
```powershell
# 1. Check if backend is running
curl http://localhost:5000/api/health

# 2. Restart backend
cd backend
node server.js
```

### ❌ Error: "MongoDB connection failed"

**Solution:**
```powershell
# Start MongoDB service
net start MongoDB

# Check status
net start | findstr MongoDB
```

### ❌ Error: JSON parsing error (FIXED ✅)

This issue has been **resolved** in the latest version:
- Improved API error handling
- Better response validation
- User-friendly error messages

### ❌ Port already in use

**Solution:**
```powershell
# Find process using port 5000 (backend)
netstat -ano | findstr :5000

# Find process using port 5173 (frontend)
netstat -ano | findstr :5173

# Kill process (replace <PID> with actual ID)
taskkill /PID <PID> /F
```

### ❌ Missing dependencies

**Solution:**
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### User Profile
- `GET /api/users/profile` - Get profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users/kendras` - Get Krushi Seva Kendras

### Crops & Area Data
- `GET /api/crops/my-crops` - Get user's crops (protected)
- `POST /api/crops` - Add new crop (protected)
- `PUT /api/crops/:id` - Update crop (protected)
- `DELETE /api/crops/:id` - Delete crop (protected)
- `GET /api/crops/area-data` - Get area statistics

### Products (Store Inventory)
- `GET /api/products` - Get all products
- `GET /api/products/my-inventory` - Get store inventory (protected)
- `POST /api/products` - Add product (protected, store owner)
- `PUT /api/products/:id` - Update product (protected)
- `POST /api/products/:id/image` - Upload product image (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Crop Listings (Marketplace)
- `GET /api/crop-listings` - Get all listings
- `GET /api/crop-listings/my-listings` - Get user listings (protected)
- `POST /api/crop-listings` - Create listing (protected, farmer)
- `PUT /api/crop-listings/:id` - Update listing (protected)
- `POST /api/crop-listings/:id/image` - Upload crop image (protected)
- `DELETE /api/crop-listings/:id` - Delete listing (protected)

### Orders
- `GET /api/orders/my-orders` - Get user orders (protected)
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/store-orders` - Get store orders (protected, store owner)
- `PATCH /api/orders/store-orders/:id/status` - Update order status (protected)

### AI Features
- `POST /api/chat` - Chat with AI assistant (protected)
- `GET /api/chat/history` - Get chat history (protected)
- `POST /api/disease/analyze` - Analyze crop disease (protected)
- `GET /api/disease/history` - Get disease detection history (protected)

### Others
- `GET /api/weather` - Get weather information
- `POST /api/feedback` - Submit feedback (protected)
- `GET /api/feedback/my` - Get my feedback (protected)
- `GET /api/notifications` - Get notifications (protected)
- `PATCH /api/notifications/:id/read` - Mark notification as read (protected)
- `PATCH /api/notifications/read-all` - Mark all as read (protected)

---

## 🔐 Security Features

- ✅ JWT-based authentication with expiry
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ Protected API routes with middleware
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Secure file uploads

---

## 📝 Recent Updates (Version 8.0.1)

### ✅ FIXED: Registration JSON Parsing Error
- **Issue**: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
- **Solution**: 
  - Improved API error handling in `api.js`
  - Added response text parsing with fallback
  - Better error messages for connection issues
  - Enhanced validation for empty responses

### ✅ ADDED: Startup Scripts
- `start-all.ps1` - Complete automated startup
- `start-backend.ps1` - Backend server only
- `start-frontend.ps1` - Frontend application only

### ✅ IMPROVED: Documentation
- Comprehensive troubleshooting guide
- Step-by-step setup instructions
- Complete API endpoint documentation
- Testing guidelines

---

## 📄 Important Notes

### Disease Detection
The disease detector is **demo-ready**, not a production ML model. The integration point is in `backend/controllers/diseaseController.js` where a trained model/API can be connected.

### Krushi Seva Kendra
- Availability-check only (no direct checkout)
- Store Owners listed from MongoDB with live products
- Products support photos, categories, pricing, stock, expiry
- Role-aware navigation (farmer-only pages hidden from Store Owners)

### Marketplace
- Farmers can save GPS location from dashboard
- Customers can search by radius
- Google Maps directions to farmers
- Direct farmer contact
- Location sharing is optional

### MongoDB
- Database: `krushisevak`
- Connection: `mongodb://127.0.0.1:27017/krushisevak`
- Do NOT use XAMPP for this project

---

## 🚀 Deployment

### Backend (Production)
1. Set production environment variables
2. Use PM2 for process management
3. Configure reverse proxy (Nginx)
4. Use MongoDB Atlas for database

### Frontend (Production)
```powershell
cd frontend
npm run build
# Deploy 'dist' folder to hosting
```

---

## 📞 Support

For detailed troubleshooting, see `START_WEBSITE.md`

Check:
1. Backend terminal logs for errors
2. Browser console for client-side errors
3. MongoDB connection status
4. Environment variable configuration

---

## 📄 License

ISC License - KrushiSevak Team

---

**Made with ❤️ for Indian Farmers**

🌾 **KrushiSevak** - Empowering Agriculture with Intelligence
