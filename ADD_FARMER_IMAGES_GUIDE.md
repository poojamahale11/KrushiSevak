# 📸 Farmer Testimonial Images Guide

## Image Requirements

### Size & Dimensions
- **Exact Display Size:** 42px × 42px (circular/round)
- **Recommended Upload Size:** 200px × 200px or 400px × 400px (square)
- **Aspect Ratio:** 1:1 (square images work best)
- **Format:** JPG, JPEG, PNG, or WEBP
- **File Size:** Keep under 200KB for fast loading

### Image Specifications
The images will be displayed as **42px diameter circles** with:
- Border: 2px solid green
- Object-fit: cover (automatically crops to fill the circle)
- Border-radius: 100% (full circle)

---

## Where to Place Images

**Folder Location:**
```
frontend/public/images/
```

**Required Image Names (EXACT):**

1. **farmer1-ramesh.jpg**
   - Person: Ramesh Patil
   - Description: Farmer with grapes/sugarcane (white/light colored shirt)
   - Location: Rahuri, Ahmednagar
   
2. **farmer2-bhausaheb.jpg**
   - Person: Bhausaheb Shinde
   - Description: Grape exporter (in vineyard/farm setting)
   - Location: Nashik
   
3. **farmer3-sunita.jpg**
   - Person: Sunita Deshmukh
   - Description: Female farmer (with vegetables/crops)
   - Location: Pune

---

## Image Preparation Tips

### Using the Uploaded Image (Ramesh Patil - farmer with vegetables)

The image you uploaded shows a farmer in a white shirt with vegetable crates in a vineyard. This is PERFECT for farmer testimonials!

**To prepare this image:**

1. **Crop to Square:**
   - Focus on the farmer's face and upper body
   - Use 1:1 aspect ratio (square crop)
   - Center the face in the frame

2. **Resize:**
   - Recommended: 400px × 400px
   - Minimum: 200px × 200px
   - The website will automatically scale it to 42px × 42px

3. **Save As:**
   ```
   farmer1-ramesh.jpg  (or farmer2-bhausaheb.jpg or farmer3-sunita.jpg)
   ```

4. **Place in Folder:**
   ```
   frontend/public/images/farmer1-ramesh.jpg
   ```

---

## Quick Steps to Add Images

### Method 1: Using Photo Editor (Recommended)

1. **Open the image** in any photo editor (Paint, Photoshop, Canva, etc.)

2. **Crop to square (1:1):**
   - Focus on the person's face
   - Include upper body/shoulders
   - Make sure the face is clearly visible

3. **Resize to 400×400px** (optional but recommended)

4. **Save as JPG** with quality 80-90%

5. **Rename exactly:**
   - `farmer1-ramesh.jpg`
   - `farmer2-bhausaheb.jpg`
   - `farmer3-sunita.jpg`

6. **Copy to:** `frontend/public/images/`

---

### Method 2: Using Online Tool (Easiest)

1. Go to **https://www.iloveimg.com/crop-image**
2. Upload your image
3. Select **"Custom" → 1:1 (square)**
4. Crop focusing on the face
5. Download
6. Rename and place in `frontend/public/images/`

---

## For Your Uploaded Image

You uploaded an image that looks like **Ramesh Patil or Bhausaheb Shinde** (farmer in vineyard with vegetables).

**To use this image:**

1. **Save it from the chat** (right-click → Save Image As)

2. **Crop it to square** focusing on the farmer's face (white shirt, vegetables)

3. **Rename to:**
   - `farmer1-ramesh.jpg` (if using for Ramesh Patil)
   - OR `farmer2-bhausaheb.jpg` (if using for Bhausaheb Shinde)

4. **Place in:** `frontend/public/images/`

5. **Restart frontend:**
   ```
   cd frontend
   npm run dev
   ```

6. **Refresh browser:** Press `Ctrl + Shift + R`

---

## What Happens on Website

### Before (No Images):
```
[RP] Ramesh Patil
     Verified Grower
```
(Shows initials in a green circle)

### After (With Images):
```
[📸 Photo] Ramesh Patil
           Verified Grower
```
(Shows actual farmer photo in a 42px circle)

---

## Testimonial Mapping

| Image File | Displays For | Text Quote |
|------------|--------------|------------|
| farmer1-ramesh.jpg | Ramesh Patil (Rahuri, Ahmednagar) | "KrushiSevak made it effortless to manage my 6.5 acres of sugarcane and onions..." |
| farmer2-bhausaheb.jpg | Bhausaheb Shinde (Nashik) | "I started selling my grapes directly to customers..." |
| farmer3-sunita.jpg | Sunita Deshmukh (Pune) | "As a woman farmer, KrushiSevak gave me confidence..." |

---

## If Images Don't Show

The website has **automatic fallback**:
- If image fails to load → Shows initials (RP, BS, SD)
- No error will appear to users
- But real images look MUCH more professional! 📸

---

## After Adding Images

1. ✅ Restart frontend: `cd frontend && npm run dev`
2. ✅ Open: http://localhost:5173
3. ✅ Scroll to **"Voices from the Field"** section
4. ✅ Verify all 3 farmer photos display correctly
5. ✅ Clear browser cache if needed: `Ctrl + Shift + R`

---

## Current Status

- ✅ Frontend code updated (images configured in Home.jsx)
- ✅ Images folder created: `frontend/public/images/`
- ⚠️ **Images NOT uploaded yet** (you need to add them)
- ✅ Frontend server running: http://localhost:5173
- ✅ Backend server running: http://localhost:5000

---

## Need Different Size Images?

If you want **LARGER profile images** in testimonials:

Edit `frontend/src/pages/Home.jsx` and change:
```javascript
width: '42px',   // Change to '60px' or '80px'
height: '42px',  // Change to '60px' or '80px'
```

Then upload **larger square images** (e.g., 600×600px or 800×800px).

---

## Summary

**What You Need to Do:**

1. Take 3 farmer photos (or use the one you uploaded 3 times)
2. Crop each to **square (1:1 ratio)**
3. Rename exactly: `farmer1-ramesh.jpg`, `farmer2-bhausaheb.jpg`, `farmer3-sunita.jpg`
4. Place in: `frontend/public/images/`
5. Refresh browser

**Expected Result:**
- Beautiful round farmer photos in testimonials
- Professional look
- Builds trust with users 🌾✨
