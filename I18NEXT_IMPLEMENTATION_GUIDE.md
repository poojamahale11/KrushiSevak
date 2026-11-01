# 🌐 i18next Implementation Guide for KrushiSevak

**Status:** ✅ i18next & react-i18next installed  
**Date:** October 8, 2026

---

## ✅ What I've Done

### 1. Installed Packages
```bash
npm install i18next react-i18next
```

**Packages Added:**
- `i18next@23.x` - Core translation library
- `react-i18next@14.x` - React bindings for i18next

### 2. Created Folder Structure
```
frontend/src/locales/  (Created)
```

---

## 📋 Implementation Steps

### Step 1: Create i18n Configuration

**File:** `frontend/src/i18n.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

// Get saved language or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: savedLanguage, // Set initial language from localStorage
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for simpler setup
    },
  });

// Save language to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
```

---

### Step 2: Update main.jsx

**File:** `frontend/src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './i18n'; // ← ADD THIS LINE (Import i18n config)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

---

### Step 3: Migrate Existing LanguageContext to use i18next

**Option A: Keep LanguageContext (Wrapper approach)**

Update `frontend/src/context/LanguageContext.jsx`:

```javascript
import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  
  // Sync with existing localStorage key if needed
  useEffect(() => {
    const savedLang = localStorage.getItem('krushisevak_lang');
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (newLang) => {
    if (['en', 'hi', 'mr'].includes(newLang)) {
      i18n.changeLanguage(newLang);
      localStorage.setItem('krushisevak_lang', newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      lang: i18n.language, 
      setLang: changeLanguage, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```

**Option B: Direct i18next usage (Simpler)**

Remove LanguageContext entirely and use `useTranslation()` directly in components:

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Use t() for translations
  const text = t('navbar.home');
  
  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return <div>{text}</div>;
}
```

---

### Step 4: Update Navbar for Language Selector

**File:** `frontend/src/components/Navbar.jsx`

Add this to your existing Navbar (find the language dropdown section):

```javascript
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <nav className="navbar">
      {/* ... existing navbar content ... */}
      
      {/* Language Selector Dropdown */}
      <div className="language-selector">
        <button className="lang-btn">
          <Globe size={18} />
          <span>{currentLang.nativeName}</span>
        </button>
        <div className="lang-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={i18n.language === lang.code ? 'active' : ''}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
```

---

### Step 5: Convert Components to use i18next

**Before (using old system):**
```javascript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  return <button>{t('login')}</button>;
}
```

**After (using i18next):**
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t('auth.login')}</button>;
}
```

---

### Step 6: Replace Hardcoded Text

**Priority Order:**

1. **Authentication Pages** (Login.jsx, Register.jsx)
2. **Navbar** (Navbar.jsx)
3. **Dashboards** (FarmerDashboard.jsx, CustomerDashboard.jsx, StoreOwnerDashboard.jsx)
4. **Marketplace** (Marketplace.jsx)
5. **AI Assistant** (AgriAssistant.jsx, DiseaseDetection.jsx)
6. **Other Pages** (About.jsx, Home.jsx, Footer.jsx)

**Example Replacements:**

```javascript
// Hardcoded text → Translation key

// Before
<button>Login</button>

// After
<button>{t('auth.login')}</button>

// Before
<input placeholder="Enter your email" />

// After
<input placeholder={t('auth.placeholderEmail')} />

// Before
setError('Please provide both email and password.');

// After
setError(t('errors.emailPasswordRequired'));

// Before
<h1>Farmer Dashboard</h1>

// After
<h1>{t('dashboard.farmer.title')}</h1>
```

---

## 📁 Translation File Structure

### Recommended Organization

```json
{
  "navbar": {
    "home": "Home",
    "marketplace": "Marketplace",
    "cropData": "Crop & Area Data",
    "diseaseDetection": "Disease Detection",
    "krushiKendra": "Krushi Seva Kendra",
    "aiAssistant": "AI Assistant",
    "profile": "Profile",
    "dashboard": "Dashboard",
    "logout": "Logout",
    "login": "Login",
    "register": "Register"
  },
  
  "auth": {
    "login": "Login",
    "register": "Register",
    "loginTitle": "Welcome Back to KrushiSevak",
    "loginSubtitle": "Sign in to access your personalized agricultural dashboard",
    "registerTitle": "Create Your KrushiSevak Account",
    "registerSubtitle": "Join thousands of farmers",
    "email": "Email Address",
    "password": "Password",
    "name": "Full Name",
    "mobile": "Mobile Number",
    "placeholderEmail": "name@example.com",
    "placeholderPassword": "••••••••",
    "loginBtn": "Sign In",
    "registerBtn": "Create Account",
    "noAccount": "Don't have an account?",
    "haveAccount": "Already have an account?",
    "registerHere": "Register here",
    "loginHere": "Login here"
  },
  
  "errors": {
    "emailPasswordRequired": "Please provide both email and password.",
    "loginFailed": "Login failed. Please check your credentials.",
    "allFieldsRequired": "Please fill in all required fields.",
    "passwordLength": "Password must be at least 6 characters long.",
    "mobileInvalid": "Please provide a valid mobile number.",
    "registrationFailed": "Registration failed. Please try again.",
    "cannotConnect": "Cannot connect to server.",
    "emailExists": "An account with this email already exists.",
    "imageInvalid": "Please select a valid image file.",
    "imageSize": "Image must be under 7 MB.",
    "saveFailed": "Failed to save.",
    "loadFailed": "Failed to load data."
  },
  
  "success": {
    "photoUploaded": "Profile photo uploaded successfully!",
    "photoRemoved": "Profile photo removed successfully.",
    "profileUpdated": "Profile updated successfully!",
    "cropAdded": "New crop registered successfully!",
    "cropUpdated": "Crop record updated successfully!",
    "listingCreated": "Produce published to marketplace!"
  },
  
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "add": "Add",
    "search": "Search",
    "loading": "Loading...",
    "refresh": "Refresh",
    "reset": "Reset",
    "submit": "Submit",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "yes": "Yes",
    "no": "No"
  },
  
  "dashboard": {
    "farmer": {
      "title": "Farmer Management Portal",
      "description": "Manage your farm profile, track crops, monitor weather",
      "registeredCrops": "REGISTERED CROPS",
      "marketListings": "MARKET LISTINGS",
      "weatherStation": "WEATHER STATION",
      "myCrops": "My Registered Crops",
      "addCrop": "Register Crop",
      "sellCrop": "Sell Crop on Marketplace"
    },
    "customer": {
      "title": "Customer Produce Hub",
      "description": "Explore fresh farm produce",
      "browseProduce": "Fresh Harvest from Verified Farmers",
      "nearbySuggestions": "Nearby Farmers in Your Region"
    },
    "store": {
      "title": "Agri Seva Kendra Portal",
      "description": "Manage store inventory",
      "myInventory": "Store Inventory & Products",
      "addProduct": "Add New Product"
    }
  },
  
  "marketplace": {
    "title": "Farmer Marketplace",
    "searchPlaceholder": "Search vegetables, fruits, grains...",
    "contactFarmer": "Contact Farmer",
    "viewDetails": "View Details",
    "getDirections": "Get Directions",
    "available": "Available",
    "inStock": "In Stock",
    "organic": "Organic",
    "premium": "Premium",
    "farmFresh": "Farm Fresh"
  },
  
  "cropData": {
    "title": "Crop & Regional Cultivation Intelligence",
    "selectDistrict": "Select District",
    "selectTaluka": "Select Taluka",
    "selectVillage": "Select Village",
    "totalFarmers": "Registered Farmers",
    "totalAcres": "Total Cultivated Land",
    "mostCommonCrop": "Most Grown Crop"
  },
  
  "aiAssistant": {
    "title": "Smart Farmer Advisor",
    "subtitle": "Text • Voice • Image Diagnosis",
    "placeholder": "Ask any farming question...",
    "analyzing": "Krushi AI is analyzing",
    "quickQuestions": "Quick Questions:",
    "disclaimer": "For pesticides/fertilizers, confirm product dosage from official approved labels."
  },
  
  "disease": {
    "title": "AI Crop Doctor",
    "subtitle": "& Treatment Advisory",
    "uploadTitle": "Upload Crop / Leaf Photo",
    "chooseGallery": "Choose from Gallery",
    "analyzing": "Analyzing...",
    "analyzeBtn": "Analyze Image",
    "reset": "Reset",
    "detected": "Detected Objects",
    "treatment": "Recommended Treatment",
    "prevention": "Prevention"
  },
  
  "profile": {
    "editProfile": "Edit Profile",
    "changePhoto": "Change Photo",
    "addPhoto": "Add Photo",
    "memberSince": "Member Since",
    "village": "Village / Town",
    "taluka": "Taluka / Block",
    "district": "District",
    "landSize": "Total Land Size (Acres)",
    "crops": "Primary Crops"
  },
  
  "footer": {
    "platformLinks": "Platform Links",
    "ecosystem": "Ecosystem",
    "helpline": "Krushi Helpline",
    "allRightsReserved": "All rights reserved.",
    "verifiedNetwork": "100% Verified Farmer Network"
  },
  
  "status": {
    "growing": "Growing",
    "readyHarvest": "Ready for Harvest",
    "harvested": "Harvested",
    "planned": "Planned",
    "active": "Active",
    "lowStock": "Low Stock",
    "outOfStock": "Out of Stock"
  },
  
  "badges": {
    "verifiedGrower": "Verified Grower",
    "verifiedProducer": "Verified Producer",
    "verifiedBuyer": "Verified Buyer",
    "grapeExporter": "Grape Exporter",
    "consumer": "Consumer",
    "farmGPSSynced": "Farm GPS Synced"
  },
  
  "buttons": {
    "editProfile": "Edit Profile",
    "registerCrop": "Register Crop",
    "sellCrop": "Sell Crop on Marketplace",
    "browseMark etplace": "Browse Marketplace",
    "contactFarmer": "Contact Farmer",
    "getDirections": "Get Directions",
    "uploadPhoto": "Upload or Change Profile Photo",
    "chooseGallery": "Choose from Gallery",
    "analyzeImage": "Analyze Image",
    "joinNetwork": "Join the KrushiSevak Network"
  },
  
  "confirmation": {
    "deleteCrop": "Are you sure you want to remove this crop record?",
    "deleteProduct": "Are you sure you want to delete this product from inventory?",
    "deleteListing": "Delete this marketplace listing?"
  }
}
```

---

## 🔄 Migration Checklist

### Phase 1: Setup ✅
- [x] Install i18next & react-i18next
- [ ] Create `src/i18n.js`
- [ ] Create `src/locales/en.json`
- [ ] Create `src/locales/hi.json`
- [ ] Create `src/locales/mr.json`
- [ ] Update `src/main.jsx`
- [ ] Update/remove `src/context/LanguageContext.jsx`

### Phase 2: Convert Components
- [ ] Navbar.jsx - Add language selector
- [ ] Login.jsx - Replace hardcoded text
- [ ] Register.jsx - Replace hardcoded text
- [ ] FarmerDashboard.jsx - Replace hardcoded text
- [ ] CustomerDashboard.jsx - Replace hardcoded text
- [ ] StoreOwnerDashboard.jsx - Replace hardcoded text
- [ ] Marketplace.jsx - Replace hardcoded text
- [ ] AgriAssistant.jsx - Replace hardcoded text
- [ ] DiseaseDetection.jsx - Replace hardcoded text
- [ ] CropAreaData.jsx - Replace hardcoded text
- [ ] Home.jsx - Replace hardcoded text
- [ ] About.jsx - Replace hardcoded text
- [ ] Footer.jsx - Replace hardcoded text
- [ ] CreateListingModal.jsx - Replace hardcoded text

### Phase 3: Testing
- [ ] Test language switching (EN → MR → HI)
- [ ] Test localStorage persistence
- [ ] Test navigation with different languages
- [ ] Test refresh with selected language
- [ ] Test all 3 user roles (Farmer/Customer/Store)
- [ ] Check for remaining hardcoded text

---

## 🧪 Testing Commands

```bash
# Run frontend
cd frontend
npm run dev

# Browser testing:
1. Open http://localhost:5173
2. Click language selector → Choose मराठी
3. Verify ALL text changes to Marathi
4. Navigate to different pages → Language should persist
5. Refresh browser (F5) → Marathi should remain
6. Change to हिंदी → ALL text should change
7. Refresh again → Hindi should remain
8. Change back to English → English should return everywhere
```

---

## 📊 Progress Tracking

| Component | Hardcoded Strings | i18next Keys Added | Status |
|-----------|-------------------|-------------------|--------|
| en.json | - | 0/200 | ⚠️ TODO |
| hi.json | - | 0/200 | ⚠️ TODO |
| mr.json | - | 0/200 | ⚠️ TODO |
| i18n.js | - | - | ⚠️ TODO |
| main.jsx | - | - | ⚠️ TODO |
| Navbar.jsx | 10 | 0 | ⚠️ TODO |
| Login.jsx | 10 | 2 | 🔄 Partial |
| Register.jsx | 40 | 0 | ⚠️ TODO |
| FarmerDashboard.jsx | 60 | 0 | ⚠️ TODO |
| CustomerDashboard.jsx | 50 | 0 | ⚠️ TODO |
| **TOTAL** | **~350** | **~2** | **~1%** |

---

## ⚠️ Important Notes

### DO Translate:
- Button text
- Labels
- Headings
- Error messages
- Success messages
- Placeholders
- Helper text
- Status labels
- Navigation items

### DON'T Translate:
- Farmer names (e.g., "Pooja Mahale")
- Village/Taluka names (e.g., "Rahuri", "Nashik")
- User-entered crop names
- User-entered product names
- User-entered addresses
- API endpoints
- Console.log messages

### Example:
```javascript
// WRONG - Translating user data
t('farmerName.poojaMahale') // ❌

// CORRECT - Only label translated
<label>{t('profile.farmerName')}: Pooja Mahale</label> // ✅
```

---

## 🚀 Quick Start (After creating files)

1. **Create i18n.js** (copy from Step 1 above)
2. **Create locale JSON files** (copy structure from above)
3. **Update main.jsx** (add import './i18n')
4. **Update Navbar.jsx** (add language selector)
5. **Start replacing hardcoded text** with `t('keys')`
6. **Test in browser**

---

**Next Steps:** Create the 4 critical files (i18n.js, en.json, hi.json, mr.json) and start converting components one by one.

