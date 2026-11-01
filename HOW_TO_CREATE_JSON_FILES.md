# 📄 How to Create Translation JSON Files

## तुम्हाला हे करायचे आहे:

तुमच्याकडे आधीच **`frontend/src/utils/translations.js`** मध्ये सर्व translations आहेत.  
आता तुम्हाला ते **3 JSON files** मध्ये copy करायचे आहेत.

---

## Method 1: Manual Copy-Paste (Recommended - 10-15 mins)

### Step 1: Open translations.js

File location: `frontend/src/utils/translations.js`

### Step 2: Create en.json

1. Create new file: `frontend/src/locales/en.json`
2. Open `translations.js`
3. Find the section: `en: {`
4. Copy everything from `brandName:` to the end of the `en` section
5. Paste into `en.json`
6. **Fix format:**
   - Remove `en: {` wrapper at start
   - Remove the final `},` at end
   - Add `{` at start and `}` at end
   - Add double quotes around keys: `brandName` → `"brandName"`
   - Keep double quotes around values (already there)
   - Remove any trailing commas before closing braces

**Example:**

FROM translations.js:
```javascript
en: {
  brandName: 'KrushiSevak',
  login: 'Login',
  logout: 'Logout',
},
```

TO en.json:
```json
{
  "brandName": "KrushiSevak",
  "login": "Login",
  "logout": "Logout"
}
```

**Key differences:**
- ✅ Keys have double quotes: `"brandName"`
- ✅ No comma after last item in object
- ✅ Proper JSON format

### Step 3: Create hi.json

Same process for Hindi:
1. Create file: `frontend/src/locales/hi.json`
2. Copy from `hi: {` section in translations.js
3. Format as JSON (same as above)

### Step 4: Create mr.json

Same process for Marathi:
1. Create file: `frontend/src/locales/mr.json`
2. Copy from `mr: {` section in translations.js
3. Format as JSON (same as above)

---

## Method 2: VS Code Find & Replace (Faster - 5 mins)

### For each language file:

1. **Copy entire language section** from translations.js to new JSON file

2. **Remove wrapper:**
   - Delete first line: `en: {` or `hi: {` or `mr: {`
   - Delete last line: `},`
   - Add `{` at start and `}` at end

3. **Use Find & Replace in VS Code:**
   - Open Find & Replace (Ctrl + H)
   - Enable regex mode (Alt + R)
   
   **Find:** `^(\s*)(\w+):`  
   **Replace:** `$1"$2":`
   
   This adds quotes around all keys

4. **Remove trailing commas:**
   - Find: `,\s*\n\s*}`
   - Replace: `\n}`

5. **Verify JSON validity:**
   - VS Code will show red squiggles if JSON is invalid
   - OR use online JSON validator: https://jsonlint.com/

---

## Method 3: Use Node Script (Automated - 2 mins)

Create a temporary script to convert automatically.

**File:** `convert-translations.js` (in frontend folder)

```javascript
const fs = require('fs');
const { translations } = require('./src/utils/translations');

// Write en.json
fs.writeFileSync(
  './src/locales/en.json',
  JSON.stringify(translations.en, null, 2),
  'utf8'
);
console.log('✅ en.json created');

// Write hi.json
fs.writeFileSync(
  './src/locales/hi.json',
  JSON.stringify(translations.hi, null, 2),
  'utf8'
);
console.log('✅ hi.json created');

// Write mr.json
fs.writeFileSync(
  './src/locales/mr.json',
  JSON.stringify(translations.mr, null, 2),
  'utf8'
);
console.log('✅ mr.json created');

console.log('\n🎉 All translation files created successfully!');
console.log('Location: frontend/src/locales/');
```

**Run:**
```bash
cd frontend
node convert-translations.js
```

This will automatically create all 3 JSON files!

---

## Verify Files Created

After creating files, check:

```
frontend/src/locales/
├── en.json   (should exist with 200+ keys)
├── hi.json   (should exist with 200+ keys)
└── mr.json   (should exist with 200+ keys)
```

**Check file size:**
- Each file should be ~20-30 KB
- Each file should have 200+ translation keys

**Check JSON validity:**
- Open each file in VS Code
- No red squiggly lines = valid JSON
- OR paste into https://jsonlint.com/

---

## Common Mistakes to Avoid

### ❌ Missing quotes around keys
```json
{
  brandName: "KrushiSevak"  // WRONG
}
```

### ✅ Correct format
```json
{
  "brandName": "KrushiSevak"  // CORRECT
}
```

### ❌ Trailing comma before closing brace
```json
{
  "login": "Login",
  "logout": "Logout",  // WRONG - remove this comma
}
```

### ✅ Correct format
```json
{
  "login": "Login",
  "logout": "Logout"  // CORRECT - no comma
}
```

### ❌ Single quotes (invalid JSON)
```json
{
  'login': 'Login'  // WRONG - use double quotes
}
```

### ✅ Correct format
```json
{
  "login": "Login"  // CORRECT
}
```

---

## Quick Starter Templates

If you want to test first with minimal files:

### Minimal en.json (for testing)
```json
{
  "brandName": "KrushiSevak",
  "home": "Home",
  "login": "Login",
  "logout": "Logout",
  "dashboard": "Dashboard",
  "marketplace": "Marketplace",
  "profile": "Profile",
  "errorEmailPassword": "Please provide both email and password.",
  "errorLoginFailed": "Login failed. Please check your credentials.",
  "verifiedGrower": "Verified Grower",
  "grapeExporter": "Grape Exporter",
  "consumer": "Consumer"
}
```

### Minimal hi.json (for testing)
```json
{
  "brandName": "कृषिसेवक",
  "home": "होम",
  "login": "लॉग इन",
  "logout": "लॉग आउट",
  "dashboard": "डैशबोर्ड",
  "marketplace": "कृषि बाजार",
  "profile": "प्रोफ़ाइल",
  "errorEmailPassword": "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।",
  "errorLoginFailed": "लॉगिन विफल रहा। कृपया अपनी जानकारी जांचें।",
  "verifiedGrower": "सत्यापित उत्पादक",
  "grapeExporter": "अंगूर निर्यातक",
  "consumer": "उपभोक्ता"
}
```

### Minimal mr.json (for testing)
```json
{
  "brandName": "कृषीसेवक",
  "home": "होम",
  "login": "लॉग इन",
  "logout": "लॉग आउट",
  "dashboard": "डॅशबोर्ड",
  "marketplace": "कृषी बाजारपेठ",
  "profile": "प्रोफाइल",
  "errorEmailPassword": "कृपया ईमेल आणि पासवर्ड दोन्ही प्रदान करा.",
  "errorLoginFailed": "लॉगिन अयशस्वी झाले. कृपया आपली माहिती तपासा.",
  "verifiedGrower": "सत्यापित उत्पादक",
  "grapeExporter": "द्राक्ष निर्यातदार",
  "consumer": "ग्राहक"
}
```

**Test with these first**, then add remaining keys from translations.js!

---

## After Creating Files

### Test immediately:
```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

- If you see the website → ✅ Files created correctly
- If you see errors → Check browser console for details
- If translation not working → Add missing keys from translations.js

---

## Need Help?

**Error: "Cannot find module './locales/en.json'"**
- Solution: Create the files in correct location: `frontend/src/locales/`

**Error: "Unexpected token in JSON"**
- Solution: Check JSON validity, remove trailing commas, fix quotes

**Some text not translating:**
- Solution: Add those keys to all 3 JSON files

---

**Recommended Approach:** Use **Method 3** (Node script) - it's fastest and error-free! 🚀
