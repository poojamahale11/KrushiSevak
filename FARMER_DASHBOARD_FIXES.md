# Farmer Dashboard Listing Form Fixes

## Issue
The "Sell Your Harvest Directly" feature is not working. Needs:
1. Support for 5 minimum images (not just 1)
2. Expiry date field
3. Proper API integration for multiple image upload
4. Fixed "Publish for Customers" button

## Changes Required

### 1. State Initialization (Line ~42)

**Replace**:
```javascript
const [listingImage, setListingImage] = useState(null);
```

**With**:
```javascript
const [listingImages, setListingImages] = useState([]);
```

### 2. listingForm State (Line ~44)

**Add expiryDate field**:
```javascript
const [listingForm, setListingForm] = useState({ 
  cropName:'', 
  category:'Vegetable', 
  quantity:'', 
  unit:'kg', 
  pricePerUnit:'', 
  quality:'', 
  harvestDate:'',
  expiryDate:'',  // ADD THIS
  description:'' 
});
```

### 3. handleSaveListing Function (Line ~255)

**Replace entire function with**:
```javascript
const handleSaveListing = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMsg('');
  
  try {
    // Validation
    if (!listingForm.cropName || !listingForm.quantity || !listingForm.pricePerUnit) {
      setError('Please fill in all required fields: Crop name, Quantity, and Price');
      return;
    }
    
    if (listingImages.length < 5) {
      setError('Please upload at least 5 images of your crop');
      return;
    }
    
    if (!listingForm.expiryDate) {
      setError('Please set an expiry date for this listing');
      return;
    }
    
    if (!profileForm.location && !user?.location) {
      setError('Please save your real farm location first using "Use My Current Location".');
      return;
    }
    
    // Step 1: Create listing
    const res = await api.createCropListing(listingForm);
    
    if (res.success) {
      let savedListing = res.listing;
      
      // Step 2: Upload all images
      if (listingImages.length > 0) {
        try {
          const imageRes = await api.uploadCropListingImages(savedListing._id, listingImages);
          if (imageRes.success) {
            savedListing = imageRes.listing;
          }
        } catch (imgErr) {
          console.error('Image upload error:', imgErr);
        }
      }
      
      // Step 3: Update UI
      setListings(prev => [savedListing, ...prev]);
      setListingModalOpen(false);
      setListingImages([]);
      setListingForm({
        cropName:'',
        category:'Vegetable',
        quantity:'',
        unit:'kg',
        pricePerUnit:'',
        quality:'',
        harvestDate:'',
        expiryDate:'',
        description:''
      });
      setSuccessMsg(`Crop listing published successfully with ${listingImages.length} images! Customers can now see it in marketplace.`);
    }
  } catch (err) {
    console.error('Listing creation error:', err);
    setError(err.message || 'Failed to create crop listing. Please try again.');
  }
};
```

### 4. Modal Close Button (Line ~898)

**Replace**:
```javascript
onClick={() => {setListingModalOpen(false);setListingImage(null);}}
```

**With**:
```javascript
onClick={() => {setListingModalOpen(false);setListingImages([]);}}
```

### 5. Image Upload Input (Line ~907)

**Replace**:
```javascript
<div className="form-group">
  <label className="form-label">Crop photo</label>
  <input className="form-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setListingImage(e.target.files?.[0] || null)}/>
  <small style={{color:'var(--text-muted)'}}>JPG/PNG/WEBP, max 7 MB</small>
</div>
```

**With**:
```javascript
<div className="form-group col-span-2">
  <label className="form-label">Crop photos (minimum 5 required) *</label>
  <input 
    className="form-input" 
    type="file" 
    accept="image/jpeg,image/jpg,image/png,image/webp" 
    multiple 
    onChange={e => {
      const files = Array.from(e.target.files || []);
      if (files.length > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setListingImages(files);
    }}
  />
  <small style={{color:'var(--text-muted)'}}>
    Select 5 images (JPG/PNG/WEBP, max 7 MB each)
    {listingImages.length > 0 && ` - ${listingImages.length} image(s) selected`}
  </small>
</div>
```

### 6. Add Expiry Date Field (After Harvest Date)

**Add after harvest date field**:
```javascript
<div className="form-group">
  <label className="form-label">Expiry date *</label>
  <input 
    className="form-input" 
    type="date" 
    required 
    min={new Date().toISOString().split('T')[0]}
    value={listingForm.expiryDate} 
    onChange={e=>setListingForm({...listingForm,expiryDate:e.target.value})}
  />
  <small style={{color:'var(--text-muted)'}}>
    When this listing should expire
  </small>
</div>
```

### 7. Image Preview (Replace Line ~910)

**Replace**:
```javascript
{listingImage && <div style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.7rem',background:'#f8fafc',borderRadius:'10px',marginTop:'.8rem'}}><ImageIcon size={18}/><span style={{fontSize:'.82rem'}}>{listingImage.name}</span></div>}
```

**With**:
```javascript
{listingImages.length > 0 && (
  <div style={{marginTop:'1rem'}}>
    <p style={{fontSize:'.85rem',fontWeight:600,marginBottom:'.5rem'}}>
      Selected Images ({listingImages.length}/5):
    </p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'.5rem'}}>
      {listingImages.map((img, idx) => (
        <div key={idx} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.3rem',padding:'.5rem',background:'#f8fafc',borderRadius:'8px'}}>
          <ImageIcon size={16}/>
          <span style={{fontSize:'.75rem',textAlign:'center',wordBreak:'break-word'}}>{img.name}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

## Testing

After applying these changes:

1. Login as Farmer
2. Go to Dashboard → "Sell Your Harvest Directly"
3. Click "+ Create Listing"
4. Fill all fields including expiry date
5. Upload 5 images
6. Click "Publish for Customers"
7. Verify:
   - Success message appears
   - Listing appears in farmer's listings
   - All 5 images uploaded
   - Listing visible in Customer Marketplace

## API Integration

The `api.uploadCropListingImages()` function has been added to `frontend/src/services/api.js`:

```javascript
uploadCropListingImages: (id, imageFiles) => { 
  const token = localStorage.getItem('krushisevak_token'); 
  const fd = new FormData(); 
  imageFiles.forEach(file => fd.append('images', file)); 
  return fetch(`/api/crop-listings/${id}/images`, { 
    method:'POST', 
    headers: token ? { Authorization:`Bearer ${token}` } : {}, 
    body:fd 
  }).then(async r => { 
    const d=await r.json(); 
    if(!r.ok) throw new Error(d.message || 'Crop photos upload failed'); 
    return d; 
  }); 
},
```

This calls the backend endpoint `POST /api/crop-listings/:id/images` which was already updated to handle multiple images.
