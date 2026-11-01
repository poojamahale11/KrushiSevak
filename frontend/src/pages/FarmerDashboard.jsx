import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Store,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Save,
  X,
  AlertCircle,
  Clock,
  LocateFixed,
  Navigation,
  Image as ImageIcon,
  Camera,
  Search,
  Filter,
  UploadCloud,
  Check,
  ChevronRight,
  Eye,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { CreateListingModal } from '../components/CreateListingModal';

export const FarmerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  // State
  const [crops, setCrops] = useState([]);
  const [listings, setListings] = useState([]);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [listingForm, setListingForm] = useState({ 
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
  const [listingImages, setListingImages] = useState([]);
  const [viewPhotosListing, setViewPhotosListing] = useState(null);
  const [viewPhotosIdx, setViewPhotosIdx] = useState(0);
  const [locationSaving, setLocationSaving] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Interactive Tab & Search States
  const [activeTab, setActiveTab] = useState('crops'); // 'crops' | 'listings' | 'weather'
  const [cropStatusFilter, setCropStatusFilter] = useState('All');
  const [cropSeasonFilter, setCropSeasonFilter] = useState('All');
  const [cropSearch, setCropSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  // Profile photo file input ref
  const photoInputRef = useRef(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobile: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
    landSize: '',
    location: null,
    profileImage: '',
  });

  const [cropForm, setCropForm] = useState({
    cropName: '',
    category: 'Cash Crop',
    acreage: '',
    season: 'Kharif',
    sowingDate: '',
    expectedHarvestDate: '',
    expectedYield: '',
    status: 'Growing',
    notes: '',
    sellOnMarketplace: false,
    pricePerUnit: '',
    quantity: '',
    unit: 'quintal',
    quality: 'Grade A',
  });

  // Load farmer data, crops, and weather
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch crops
      const cropsRes = await api.getMyCrops();
      if (cropsRes.success) {
        setCrops(cropsRes.crops || []);
      }

      const listingsRes = await api.getMyCropListings();
      if (listingsRes.success) setListings(listingsRes.listings || []);

      // 2. Fetch location-based weather
      const weatherRes = await api.getWeather({
        location: user?.village || user?.taluka || 'Rahuri',
        district: user?.district || 'Ahmednagar',
      });
      if (weatherRes.success) {
        setWeather(weatherRes.weather);
      }
    } catch (err) {
      console.error('Farmer dashboard data load error:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
        village: user.village || '',
        taluka: user.taluka || '',
        district: user.district || '',
        landSize: user.landSize || '',
        location: user.location || null,
        profileImage: user.profileImage || '',
      });
      loadDashboardData();
    }
  }, [user]);

  // Canvas helper to compress image to high quality 500x500 JPEG (~40KB)
  const compressImage = (file, maxWidth = 500, maxHeight = 500) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Profile Photo Uploader Handler (Instant auto-save to DB & Context)
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG).');
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      const compressedDataUrl = await compressImage(file, 500, 500);

      // Immediately update local form state
      setProfileForm((prev) => ({ ...prev, profileImage: compressedDataUrl }));

      // Save directly to MongoDB backend and global AuthContext
      const res = await api.updateProfile({ profileImage: compressedDataUrl });
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile photo uploaded & saved successfully!');
      }
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError(err.message || 'Failed to process or save profile photo.');
    } finally {
      e.target.value = '';
    }
  };

  // Keyboard shortcut: close photo viewer on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && photoViewerOpen) {
        setPhotoViewerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoViewerOpen]);

  // Remove Profile Photo handler
  const handleRemoveProfilePhoto = async () => {
    try {
      setError('');
      setSuccessMsg('');
      setProfileForm((prev) => ({ ...prev, profileImage: '' }));
      const res = await api.updateProfile({ profileImage: '' });
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile photo removed successfully.');
        setPhotoViewerOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove photo.');
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const payload = { ...profileForm };
      if (!payload.location || !Number.isFinite(Number(payload.location.lat)) || !Number.isFinite(Number(payload.location.lng))) delete payload.location;
      
      const res = await api.updateProfile(payload);
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile and photo updated successfully!');
        setProfileModalOpen(false);
        // Refresh weather with updated village/district
        const weatherRes = await api.getWeather({
          location: res.user.village,
          district: res.user.district,
        });
        if (weatherRes.success) setWeather(weatherRes.weather);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  // Handle Add/Edit Crop
  const handleSaveCrop = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (editingCrop) {
        const res = await api.updateCrop(editingCrop._id, cropForm);
        if (res.success && res.crop) {
          setCrops((prev) => prev.map((c) => (c._id === res.crop._id ? res.crop : c)));
          setSuccessMsg('Crop record updated successfully!');
        }
      } else {
        const res = await api.addCrop(cropForm);
        if (res.success && res.crop) {
          setCrops((prev) => [res.crop, ...prev]);
          if (res.listing) {
            setListings((prev) => [res.listing, ...prev]);
            setSuccessMsg('🌾 Crop registered and immediately published to the Marketplace for customers!');
          } else {
            setSuccessMsg('New crop registered successfully!');
          }
        }
      }
      setCropModalOpen(false);
      setEditingCrop(null);
      resetCropForm();
    } catch (err) {
      setError(err.message || 'Failed to save crop.');
    }
  };

  // Handle Delete Crop
  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to remove this crop record?')) return;
    setError('');
    try {
      const res = await api.deleteCrop(cropId);
      if (res.success) {
        setCrops((prev) => prev.filter((c) => c._id !== cropId));
        setSuccessMsg('Crop record deleted successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete crop.');
    }
  };

  const openSellProduceModal = (crop) => {
    setListingForm({
      cropName: crop.cropName || '',
      category: crop.category || 'Cash Crop',
      quantity: crop.expectedYield ? String(crop.expectedYield).replace(/[^0-9.]/g, '') || '50' : '50',
      unit: 'quintal',
      pricePerUnit: '',
      quality: 'Grade A',
      harvestDate: crop.expectedHarvestDate || '',
      expiryDate: '',
      description: crop.notes ? `Fresh harvest: ${crop.notes}` : `Farm-fresh ${crop.cropName} harvest available directly from farmer.`,
      village: user?.village || '',
      taluka: user?.taluka || '',
      district: user?.district || '',
    });
    setListingModalOpen(true);
    setActiveTab('listings');
  };

  const openAddCropModal = () => {
    setEditingCrop(null);
    resetCropForm();
    setCropModalOpen(true);
  };

  const openEditCropModal = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      cropName: crop.cropName || '',
      category: crop.category || 'Cash Crop',
      acreage: crop.acreage || '',
      season: crop.season || 'Kharif',
      sowingDate: crop.sowingDate || '',
      expectedHarvestDate: crop.expectedHarvestDate || '',
      expectedYield: crop.expectedYield || '',
      status: crop.status || 'Growing',
      notes: crop.notes || '',
    });
    setCropModalOpen(true);
  };

  const resetCropForm = () => {
    setCropForm({
      cropName: '',
      category: 'Cash Crop',
      acreage: '',
      season: 'Kharif',
      sowingDate: '',
      expectedHarvestDate: '',
      expectedYield: '',
      status: 'Growing',
      notes: '',
      sellOnMarketplace: false,
      pricePerUnit: '',
      quantity: '',
      unit: 'quintal',
      quality: 'Grade A',
    });
  };

  const captureFarmerLocation = () => {
    if (!navigator.geolocation) { setError('Your browser does not support GPS location.'); return; }
    setLocationSaving(true); setError('');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        const res = await api.updateProfile({ location });
        if (res.success) { 
          updateUser(res.user); 
          setProfileForm(prev => ({ ...prev, location })); 
          setSuccessMsg('Real farm location saved. Customers can now see distance and directions.'); 
        }
      } catch (err) { setError(err.message || 'Could not save your location.'); }
      finally { setLocationSaving(false); }
    }, () => { setLocationSaving(false); setError('Location permission was not allowed.'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  };

  const handleListingImagesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setError('');
    setListingImages(prev => {
      const combined = [...prev, ...selected];
      if (combined.length > 5) {
        setError('Maximum 5 photos allowed per listing. Keeping the first 5 photos.');
        return combined.slice(0, 5);
      }
      return combined;
    });
  };

  const handleRemoveListingImage = (indexToRemove) => {
    setListingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveListing = async (formData, images) => {
    setError(''); setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        village: formData.village || user?.village || '',
        taluka: formData.taluka || user?.taluka || '',
        district: formData.district || user?.district || '',
      };
      const res = await api.createCropListing(payload);
      if (res.success) {
        let savedListing = res.listing;
        if (images && images.length > 0) {
          const imageRes = await api.uploadCropListingImages(savedListing._id, images);
          if (imageRes.success && imageRes.listing) savedListing = imageRes.listing;
        }
        setListings(prev => [savedListing, ...prev]);
        setListingModalOpen(false);
        setSuccessMsg(`🌾 Produce "${savedListing.cropName}" published to marketplace with ${savedListing.images?.length || images.length} quality photos!`);
      }
    } catch (err) { 
      setError(err.message || 'Failed to create crop listing.'); 
      throw err; // Re-throw so modal can handle it
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this marketplace listing?')) return;
    try { 
      await api.deleteCropListing(id); 
      setListings(prev => prev.filter(x => x._id !== id)); 
      setSuccessMsg('Marketplace listing deleted.'); 
    } catch (err) { setError(err.message || 'Failed to delete listing.'); }
  };

  // Crop Growth Progress Calculation
  const getCropProgress = (sowingDateStr, harvestDateStr) => {
    if (!sowingDateStr || !harvestDateStr) return { pct: 50, daysLeft: null, label: 'Growing' };
    const start = new Date(sowingDateStr).getTime();
    const end = new Date(harvestDateStr).getTime();
    const now = Date.now();
    if (isNaN(start) || isNaN(end)) return { pct: 50, daysLeft: null, label: 'Growing' };
    if (now >= end) return { pct: 100, daysLeft: 0, label: 'Ready for Harvest' };
    if (now <= start) return { pct: 5, daysLeft: Math.ceil((end - now) / 86400000), label: 'Sown' };
    const total = end - start;
    const elapsed = now - start;
    const pct = Math.min(100, Math.max(5, Math.round((elapsed / total) * 100)));
    const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
    return { pct, daysLeft, label: `${daysLeft} days to harvest` };
  };

  // Filter Crops
  const filteredCrops = crops.filter((c) => {
    const matchStatus = cropStatusFilter === 'All' || (c.status || 'Growing') === cropStatusFilter;
    const matchSeason = cropSeasonFilter === 'All' || (c.season || 'Kharif') === cropSeasonFilter;
    const matchSearch = !cropSearch.trim() || (c.cropName || '').toLowerCase().includes(cropSearch.toLowerCase().trim());
    return matchStatus && matchSeason && matchSearch;
  });

  // Filter Listings
  const filteredListings = listings.filter((l) => {
    return !listingSearch.trim() || (l.cropName || '').toLowerCase().includes(listingSearch.toLowerCase().trim());
  });

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="dashboard-container" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Hidden Global Photo File Input */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePhotoUpload}
          style={{ display: 'none' }}
        />

        {/* Toast Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Farmer Profile Header Banner with Photo Upload */}
        <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', borderRadius: 'var(--radius-lg)', padding: '2rem', color: '#ffffff', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            
            {/* Avatar & Photo Upload Trigger (Click to Open WhatsApp-Style Full Photo) */}
            <div
              className="farmer-avatar-upload-wrap"
              onClick={() => setPhotoViewerOpen(true)}
              style={{ cursor: 'pointer', position: 'relative' }}
              title="Click to view profile photo (WhatsApp style)"
            >
              {profileForm.profileImage || user?.profileImage ? (
                <img
                  src={profileForm.profileImage || user?.profileImage}
                  alt={user?.name || 'Farmer'}
                  className="farmer-avatar-img"
                  onError={(e) => {
                    console.error("Avatar image load error");
                  }}
                />
              ) : (
                <div className="farmer-avatar-placeholder">
                  {(user?.name || 'F').charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className="avatar-hover-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <Eye size={22} style={{ color: '#ffffff' }} />
              </div>
              <button
                type="button"
                className="avatar-camera-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  photoInputRef.current?.click();
                }}
                title="Upload or Change Profile Photo"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Farmer Info */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Sprout size={15} /> Verified Producer
                </span>
                {user?.location?.lat ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(74, 222, 128, 0.25)', color: '#4ade80', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(74, 222, 128, 0.4)' }}>
                    <LocateFixed size={14} /> Farm GPS Synced
                  </span>
                ) : (
                  <button
                    onClick={captureFarmerLocation}
                    disabled={locationSaving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(251, 146, 60, 0.3)', color: '#fdba74', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(251, 146, 60, 0.5)', cursor: 'pointer' }}
                  >
                    <MapPin size={14} /> {locationSaving ? 'Pinning GPS...' : 'Pin Farm GPS'}
                  </button>
                )}
              </div>

              <h1 style={{ margin: '0.2rem 0', fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                {t('welcome')}, {user?.name}! 🌾
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', color: '#d1fae5' }}>
                {user?.village || 'Village'}, {user?.taluka || 'Taluka'}, {user?.district || 'District'} • Land Size: <strong style={{ color: '#fed7aa' }}>{user?.landSize || 'Unspecified'}</strong>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="btn btn-sm"
                style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)' }}
              >
                <Edit2 size={15} /> Edit Profile & Photo
              </button>
              <button
                onClick={openAddCropModal}
                className="btn btn-sm"
                style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.5)' }}
              >
                <Plus size={16} /> Register Crop
              </button>
              <button
                onClick={() => {
                  setListingForm({
                    cropName: '',
                    category: 'Vegetable',
                    quantity: '',
                    unit: 'quintal',
                    pricePerUnit: '',
                    quality: 'Grade A',
                    harvestDate: '',
                    expiryDate: '',
                    description: '',
                    village: user?.village || '',
                    taluka: user?.taluka || '',
                    district: user?.district || '',
                  });
                  setListingModalOpen(true);
                }}
                className="btn btn-sm btn-primary"
                style={{ background: '#16a34a', borderColor: '#16a34a', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', fontWeight: 700 }}
              >
                <ShoppingBag size={16} /> Sell Crop on Marketplace
              </button>
            </div>

          </div>
        </div>

        {/* Interactive Quick Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div
            className={`dash-card ${activeTab === 'crops' ? 'active-card-highlight' : ''}`}
            style={{ cursor: 'pointer', transition: 'all 0.25s ease', border: activeTab === 'crops' ? '2px solid var(--primary-500)' : '1px solid var(--border-light)' }}
            onClick={() => setActiveTab('crops')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>REGISTERED CROPS</span>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>{crops.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Click to manage crop growth & harvest
            </div>
          </div>

          <div
            className={`dash-card ${activeTab === 'listings' ? 'active-card-highlight' : ''}`}
            style={{ cursor: 'pointer', transition: 'all 0.25s ease', border: activeTab === 'listings' ? '2px solid #0288d1' : '1px solid var(--border-light)' }}
            onClick={() => setActiveTab('listings')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>MARKET LISTINGS</span>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#e0f2fe', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0288d1' }}>{listings.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Direct marketplace produce sales
            </div>
          </div>

          <div
            className={`dash-card ${activeTab === 'weather' ? 'active-card-highlight' : ''}`}
            style={{ cursor: 'pointer', transition: 'all 0.25s ease', border: activeTab === 'weather' ? '2px solid #d97706' : '1px solid var(--border-light)' }}
            onClick={() => setActiveTab('weather')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>WEATHER STATION</span>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudSun size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{weather?.temperature || 29}°C</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {weather?.condition || 'Clear Sky'} • Humidity {weather?.humidity || 55}%
            </div>
          </div>
        </div>

        {/* Interactive Dashboard Navigation Tabs Bar */}
        <div className="dash-tabs-bar">
          <button
            className={`dash-tab-btn ${activeTab === 'crops' ? 'active' : ''}`}
            onClick={() => setActiveTab('crops')}
          >
            <Sprout size={18} />
            <span>My Registered Crops ({crops.length})</span>
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <ShoppingBag size={18} />
            <span>Marketplace Produce Listings ({listings.length})</span>
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <CloudSun size={18} />
            <span>Agro-Weather & Advisory</span>
          </button>
        </div>

        {/* TAB 1: CROPS MANAGEMENT */}
        {activeTab === 'crops' && (
          <div style={{ marginBottom: '2.5rem' }}>
            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="filter-chips-bar" style={{ margin: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Filter size={14} /> Status:
                </span>
                {['All', 'Growing', 'Ready for Harvest', 'Harvested', 'Planned'].map((st) => (
                  <button
                    key={st}
                    className={`filter-chip ${cropStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setCropStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search crop name..."
                    className="form-input"
                    value={cropSearch}
                    onChange={(e) => setCropSearch(e.target.value)}
                    style={{ paddingLeft: '2.2rem', paddingRight: '1rem', width: 220, fontSize: '0.85rem' }}
                  />
                </div>
                <button onClick={openAddCropModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Plus size={16} />
                  <span>{t('addCrop')}</span>
                </button>
              </div>
            </div>

            {filteredCrops.length === 0 ? (
              <div className="dash-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <Sprout size={48} style={{ color: 'var(--primary-300)', margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Crops Found</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {crops.length === 0 ? t('noCropsYet') : 'No crops match the selected filter criteria.'}
                </p>
                <button onClick={openAddCropModal} className="btn btn-primary">
                  <Plus size={16} />
                  <span>{t('addCrop')}</span>
                </button>
              </div>
            ) : (
              <div className="crops-grid">
                {filteredCrops.map((crop) => {
                  const progress = getCropProgress(crop.sowingDate, crop.expectedHarvestDate);
                  return (
                    <div key={crop._id} className="crop-card">
                      <div className="crop-card-header">
                        <div>
                          <h4 className="crop-card-title">{crop.cropName}</h4>
                          <span className="crop-category-badge">{crop.category || 'Crop'}</span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            background: crop.status === 'Ready for Harvest' ? '#fef3c7' : crop.status === 'Harvested' ? '#e0f2fe' : '#dcfce7',
                            color: crop.status === 'Ready for Harvest' ? '#b45309' : crop.status === 'Harvested' ? '#0369a1' : '#15803d',
                            border: '1px solid currentColor',
                          }}
                        >
                          {crop.status || 'Growing'}
                        </span>
                      </div>

                      {/* Growth Progress Bar */}
                      <div style={{ margin: '0.75rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          <span>Growth Progress</span>
                          <span style={{ color: 'var(--primary-600)' }}>{progress.pct}%</span>
                        </div>
                        <div className="crop-progress-container">
                          <div className="crop-progress-fill" style={{ width: `${progress.pct}%` }} />
                        </div>
                      </div>

                      <div style={{ margin: '0.5rem 0' }}>
                        <div className="crop-detail-row">
                          <span className="info-label">{t('acreage')}:</span>
                          <span className="info-value">{crop.acreage} Acres</span>
                        </div>
                        <div className="crop-detail-row">
                          <span className="info-label">{t('season')}:</span>
                          <span className="info-value">{crop.season}</span>
                        </div>
                        {crop.expectedYield && (
                          <div className="crop-detail-row">
                            <span className="info-label">{t('expectedYield')}:</span>
                            <span className="info-value">{crop.expectedYield}</span>
                          </div>
                        )}
                        {crop.expectedHarvestDate && (
                          <div className="crop-detail-row">
                            <span className="info-label">Expected Harvest:</span>
                            <span className="info-value" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>{crop.expectedHarvestDate}</span>
                          </div>
                        )}
                        {crop.notes && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            "{crop.notes}"
                          </p>
                        )}
                      </div>

                      <div className="crop-card-actions" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => openSellProduceModal(crop)}
                          className="btn btn-sm btn-primary"
                          style={{ flex: '1 1 100%', justifyContent: 'center', background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
                        >
                          <ShoppingBag size={14} />
                          <span>Sell on Marketplace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditCropModal(crop)}
                          className="btn btn-sm btn-outline"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <Edit2 size={14} />
                          <span>{t('edit')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCrop(crop._id)}
                          className="btn btn-sm btn-danger-outline"
                          style={{ padding: '0.4rem 0.65rem' }}
                          title="Delete Crop"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MARKETPLACE PRODUCE LISTINGS */}
        {activeTab === 'listings' && (
          <div className="dash-card" style={{ marginBottom: '2.5rem' }}>
            <div className="dash-card-header" style={{ flexWrap: 'wrap', gap: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={22} style={{ color: '#16a34a' }} />
                  <span>Marketplace Produce Listings ({listings.length})</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                  Crops published here are live in the customer marketplace for immediate purchase and enquiries.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <Link to="/marketplace" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Eye size={14} /> View in Marketplace ↗
                </Link>
                <button
                  onClick={() => {
                    setListingForm({
                      cropName: '',
                      category: 'Vegetable',
                      quantity: '',
                      unit: 'quintal',
                      pricePerUnit: '',
                      quality: 'Grade A',
                      harvestDate: '',
                      expiryDate: '',
                      description: '',
                      village: user?.village || '',
                      taluka: user?.taluka || '',
                      district: user?.district || '',
                    });
                    setListingModalOpen(true);
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} /> + Add Crop for Sale
                </button>
              </div>
            </div>

            {listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <ShoppingBag size={48} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Active Produce Listings</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.25rem' }}>
                  You haven't listed any crops for sale yet. Publish your crops so customers across Maharashtra can find and buy from you directly.
                </p>
                <button
                  onClick={() => {
                    setListingForm({
                      cropName: '',
                      category: 'Vegetable',
                      quantity: '',
                      unit: 'quintal',
                      pricePerUnit: '',
                      quality: 'Grade A',
                      harvestDate: '',
                      expiryDate: '',
                      description: '',
                      village: user?.village || '',
                      taluka: user?.taluka || '',
                      district: user?.district || '',
                    });
                    setListingModalOpen(true);
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                >
                  <Plus size={15} /> Publish Your First Crop for Sale
                </button>
              </div>
            ) : (
              <div className="produce-grid" style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {filteredListings.map((l) => (
                  <div
                    className="produce-card"
                    key={l._id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ position: 'relative', height: 150, background: '#f0fdf4', overflow: 'hidden' }}>
                      {l.imageUrl || (l.images && l.images.length > 0) ? (
                        <img
                          src={l.images?.[0] || l.imageUrl}
                          alt={l.cropName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                          onClick={() => { setViewPhotosListing(l); setViewPhotosIdx(0); }}
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                          <ShoppingBag size={36} style={{ opacity: 0.7 }} />
                        </div>
                      )}
                      {l.images && l.images.length > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(15, 23, 42, 0.85)',
                            color: '#ffffff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => { setViewPhotosListing(l); setViewPhotosIdx(0); }}
                        >
                          <Camera size={12} />
                          {l.images.length} Photos
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <b style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{l.cropName}</b>
                        <span className="crop-category-badge" style={{ background: '#16a34a', color: '#fff', border: 'none' }}>
                          {l.quality || l.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '1.1rem', margin: '0.2rem 0 0.5rem', color: 'var(--primary-600)', fontWeight: 800 }}>
                        ₹{l.pricePerUnit} <small style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{l.unit}</small>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          • {l.quantity} {l.unit} available
                        </span>
                      </p>
                      {l.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                          {l.description}
                        </p>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {l.images && l.images.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: '0.35rem' }}
                            onClick={() => { setViewPhotosListing(l); setViewPhotosIdx(0); }}
                          >
                            <Camera size={13} /> Photos ({l.images.length})
                          </button>
                        )}
                        <Link
                          to="/marketplace"
                          className="btn btn-sm btn-outline"
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: '0.35rem' }}
                        >
                          <Eye size={13} /> View Live
                        </Link>
                        <button
                          className="btn btn-sm btn-danger-outline"
                          style={{ padding: '0.35rem 0.65rem' }}
                          onClick={() => handleDeleteListing(l._id)}
                          title="Remove Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AGRO-WEATHER STATION */}
        {activeTab === 'weather' && (
          <div className="weather-card" style={{ marginBottom: '2.5rem' }}>
            <div className="weather-header">
              <div>
                <div className="weather-location">
                  <MapPin size={18} />
                  <span>{weather?.location || `${user?.village || 'Rahuri'}, ${user?.district || 'Ahmednagar'}`}</span>
                </div>
                <span className="weather-updated">Agro-Met Station Live • {weather?.condition || 'Clear Sky'}</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700 }}>
                Live Station
              </div>
            </div>

            <div className="weather-main-grid">
              <div className="weather-temp-huge">
                {weather?.temperature || 29}
                <span>°C</span>
              </div>

              <div className="weather-metrics-grid">
                <div className="weather-metric-pill">
                  <span className="weather-metric-label">{t('humidity')}</span>
                  <span className="weather-metric-val">
                    <Droplets size={14} /> {weather?.humidity || 55}%
                  </span>
                </div>
                <div className="weather-metric-pill">
                  <span className="weather-metric-label">{t('windSpeed')}</span>
                  <span className="weather-metric-val">
                    <Wind size={14} /> {weather?.windSpeed || 14} km/h
                  </span>
                </div>
                <div className="weather-metric-pill">
                  <span className="weather-metric-label">{t('rainfall')}</span>
                  <span className="weather-metric-val">
                    <CloudSun size={14} /> {weather?.rainfallProbability || 15}%
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Day Forecast */}
            {weather?.forecast && (
              <div className="weather-forecast-row">
                {weather.forecast.map((fc, idx) => (
                  <div key={idx} className="forecast-day-card">
                    <div className="forecast-day-name">{fc.day.slice(0, 3)}</div>
                    <div className="forecast-day-temp">{fc.tempMax}° / {fc.tempMin}°</div>
                    <div className="forecast-day-rain">🌧️ {fc.rainProb}%</div>
                  </div>
                ))}
              </div>
            )}

            {/* Spraying / Irrigation Advisory */}
            {weather?.advisories && weather.advisories.length > 0 && (
              <div className="advisory-box" style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', marginTop: '1.25rem' }}>
                <strong style={{ color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} />
                  Agro-Meteorology Spraying & Sowing Advisory:
                </strong>
                <ul style={{ color: '#f0fdf4', marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                  {weather.advisories.map((adv, i) => (
                    <li key={i} style={{ marginBottom: '0.35rem' }}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Navigation Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Integrated Agricultural Services</h3>
          <div className="quick-cards-grid">
            <Link to="/crop-area-data" className="quick-action-card">
              <div className="card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <TrendingUp size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{t('cropAreaData')}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                View regional crop percentages, most grown crops, and farmer directories in {user?.district || 'your district'}.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Open Analytics & Charts →
              </span>
            </Link>

            <Link to="/disease-detection" className="quick-action-card">
              <div className="card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>AI Crop Disease Doctor</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Upload crop leaf photos for instant pest & disease diagnosis with prescribed remedies.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Scan Crop Disease →
              </span>
            </Link>

            <Link to="/krushi-seva-kendra" className="quick-action-card">
              <div className="card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Store size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Krushi Seva Kendras</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Locate nearby authorized input stores for genuine seeds, bio-fertilizers & farm machinery.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Find Nearby Stores →
              </span>
            </Link>
          </div>
        </div>

      </div>

      {/* 1. Edit Profile Modal (Includes Photo Upload) */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: 'var(--primary-500)' }} />
                <span>Edit Profile & Photo</span>
              </h3>
              <button onClick={() => setProfileModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              
              {/* Profile Photo Uploader */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.2rem', background: '#f8faf8', borderRadius: '16px', border: '1px dashed #bbf7d0', marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--primary-600)', margin: 0 }}>
                  Profile Photo
                </label>
                <div 
                  style={{ position: 'relative', width: 90, height: 90, cursor: 'pointer' }}
                  onClick={() => setPhotoViewerOpen(true)}
                  title="Click to view full photo (WhatsApp style)"
                >
                  {profileForm.profileImage || user?.profileImage ? (
                    <img
                      src={profileForm.profileImage || user?.profileImage}
                      alt="Profile Avatar"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-500)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                    />
                  ) : (
                    <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                      {(profileForm.name || 'F').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'var(--primary-500)',
                      color: '#ffffff',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                    title="Upload Photo"
                  >
                    <Camera size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => photoInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UploadCloud size={14} /> Upload New Photo
                </button>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">{t('name')} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">{t('mobile')} *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('village')} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.village}
                    onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('taluka')} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.taluka}
                    onChange={(e) => setProfileForm({ ...profileForm, taluka: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('district')} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.district}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('landSize')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6.5 Acres"
                    className="form-input"
                    value={profileForm.landSize}
                    onChange={(e) => setProfileForm({ ...profileForm, landSize: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2" style={{ background:'#f0fdf4', padding:'1rem', borderRadius:'12px', border:'1px solid #bbf7d0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                    <div>
                      <b style={{display:'flex',alignItems:'center',gap:'.35rem'}}><MapPin size={17}/> Real Farm Location</b>
                      <div style={{fontSize:'.78rem',color:'var(--text-muted)',marginTop:'.25rem'}}>
                        {profileForm.location ? `GPS saved: ${Number(profileForm.location.lat).toFixed(5)}, ${Number(profileForm.location.lng).toFixed(5)}` : 'Pin GPS so consumers see farm distance.'}
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm btn-primary" onClick={captureFarmerLocation} disabled={locationSaving} style={{display:'inline-flex',alignItems:'center',gap:'.35rem'}}>
                      <LocateFixed size={15}/>{locationSaving ? 'Saving GPS...' : 'Use My Current Location'}
                    </button>
                  </div>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">{t('address')}</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Full Postal Address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setProfileModalOpen(false)} className="btn btn-outline">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Save size={16} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Crop Modal */}
      {cropModalOpen && (
        <div className="modal-overlay" onClick={() => setCropModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Sprout size={20} style={{ color: 'var(--primary-500)' }} />
                <span>{editingCrop ? t('editCrop') : t('addCrop')}</span>
              </h3>
              <button onClick={() => setCropModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCrop}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">{t('cropName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sugarcane (ऊस), Cotton (कापूस), Onion, Wheat"
                    className="form-input"
                    value={cropForm.cropName}
                    onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('category')}</label>
                  <select
                    className="form-input"
                    value={cropForm.category}
                    onChange={(e) => setCropForm({ ...cropForm, category: e.target.value })}
                  >
                    <option value="Cash Crop">Cash Crop</option>
                    <option value="Grain / Cereal">Grain / Cereal</option>
                    <option value="Pulse / Legume">Pulse / Legume</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Oilseed">Oilseed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('acreage')} (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 2.5"
                    className="form-input"
                    value={cropForm.acreage}
                    onChange={(e) => setCropForm({ ...cropForm, acreage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('season')}</label>
                  <select
                    className="form-input"
                    value={cropForm.season}
                    onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                    <option value="Perennial">Perennial (Year-round)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('status')}</label>
                  <select
                    className="form-input"
                    value={cropForm.status}
                    onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
                  >
                    <option value="Growing">Growing</option>
                    <option value="Ready for Harvest">Ready for Harvest</option>
                    <option value="Harvested">Harvested</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sowing Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={cropForm.sowingDate}
                    onChange={(e) => setCropForm({ ...cropForm, sowingDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Harvest Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={cropForm.expectedHarvestDate}
                    onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">{t('expectedYield')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 40 Tons / 25 Quintals"
                    className="form-input"
                    value={cropForm.expectedYield}
                    onChange={(e) => setCropForm({ ...cropForm, expectedYield: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Notes / Fertilizers Used</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="e.g. Drip irrigated, Organic Neem cake used"
                    value={cropForm.notes}
                    onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })}
                  />
                </div>

                {/* Sell on Marketplace Toggle for New Crops */}
                {!editingCrop && (
                  <div className="form-group col-span-2" style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #bbf7d0',
                    marginTop: '0.25rem'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 700, color: '#166534', fontSize: '0.92rem' }}>
                      <input
                        type="checkbox"
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        checked={cropForm.sellOnMarketplace}
                        onChange={(e) => setCropForm({ ...cropForm, sellOnMarketplace: e.target.checked })}
                      />
                      <span>🌾 Also list this crop for sale on the Marketplace immediately</span>
                    </label>
                    <p style={{ fontSize: '0.8rem', color: '#15803d', margin: '0.35rem 0 0.75rem 2rem' }}>
                      Customers searching in the marketplace will immediately see your crop listing with your contact and farm details.
                    </p>

                    {cropForm.sellOnMarketplace && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', paddingLeft: '2rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem', color: '#166534' }}>Price per Unit (₹) *</label>
                          <input
                            type="number"
                            step="0.5"
                            required={cropForm.sellOnMarketplace}
                            placeholder="e.g. 35"
                            className="form-input"
                            value={cropForm.pricePerUnit}
                            onChange={(e) => setCropForm({ ...cropForm, pricePerUnit: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem', color: '#166534' }}>Sale Quantity *</label>
                          <input
                            type="number"
                            step="0.1"
                            required={cropForm.sellOnMarketplace}
                            placeholder="e.g. 50"
                            className="form-input"
                            value={cropForm.quantity}
                            onChange={(e) => setCropForm({ ...cropForm, quantity: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem', color: '#166534' }}>Unit</label>
                          <select
                            className="form-input"
                            value={cropForm.unit}
                            onChange={(e) => setCropForm({ ...cropForm, unit: e.target.value })}
                          >
                            <option value="quintal">quintal</option>
                            <option value="kg">kg</option>
                            <option value="ton">ton</option>
                            <option value="box">box</option>
                            <option value="bag">bag</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCropModalOpen(false)} className="btn btn-outline">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Save size={16} />
                  <span>{editingCrop ? 'Update Crop' : 'Save & Publish Crop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Produce Listing Modal */}
      <CreateListingModal
        isOpen={listingModalOpen}
        onClose={() => setListingModalOpen(false)}
        onSubmit={handleSaveListing}
        user={user}
      />

      {/* ================= CROP PHOTOS GALLERY MODAL ================= */}
      {viewPhotosListing && (
        <div className="modal-overlay" onClick={() => setViewPhotosListing(null)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Camera size={20} style={{ color: '#16a34a' }} />
                <span>Crop Quality Photos — {viewPhotosListing.cropName}</span>
              </h3>
              <button onClick={() => setViewPhotosListing(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Photos Display */}
            {(() => {
              const allImgs = (viewPhotosListing.images && viewPhotosListing.images.length > 0)
                ? viewPhotosListing.images
                : (viewPhotosListing.imageUrl ? [viewPhotosListing.imageUrl] : []);
              const currentImg = allImgs[viewPhotosIdx] || allImgs[0];

              return (
                <div>
                  <div style={{ position: 'relative', height: '320px', background: '#0f172a', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentImg ? (
                      <img
                        src={currentImg}
                        alt={viewPhotosListing.cropName}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                        <Camera size={48} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
                        <p>No photos uploaded for this listing</p>
                      </div>
                    )}
                    {allImgs.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewPhotosIdx(prev => (prev > 0 ? prev - 1 : allImgs.length - 1))}
                          style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewPhotosIdx(prev => (prev < allImgs.length - 1 ? prev + 1 : 0))}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          ›
                        </button>
                        <span style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#fff',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {viewPhotosIdx + 1} / {allImgs.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {allImgs.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {allImgs.map((imgUrl, i) => (
                        <div
                          key={i}
                          onClick={() => setViewPhotosIdx(i)}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: viewPhotosIdx === i ? '2px solid #16a34a' : '2px solid transparent',
                            flexShrink: 0
                          }}
                        >
                          <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Total <b>{allImgs.length}</b> verified photos uploaded for buyers
                    </span>
                    <button type="button" onClick={() => setViewPhotosListing(null)} className="btn btn-outline btn-sm">
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= WHATSAPP-STYLE FULL PROFILE PHOTO VIEWER MODAL ================= */}
      {photoViewerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(9, 17, 13, 0.94)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setPhotoViewerOpen(false)}
        >
          {/* WhatsApp Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              background: 'rgba(15, 23, 19, 0.9)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button
                onClick={() => setPhotoViewerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Back"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {user?.name || 'Farmer Profile'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={12} /> Verified KrushiSevak Farmer
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
                title="Change Photo"
              >
                <Camera size={15} />
                <span>Change Photo</span>
              </button>

              {(profileForm.profileImage || user?.profileImage) && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePhoto}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(220, 38, 38, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(220, 38, 38, 0.4)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer',
                  }}
                  title="Remove Photo"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setPhotoViewerOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '0.45rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close (ESC)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Center Image Display (WhatsApp Zoom View) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setPhotoViewerOpen(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '440px',
                maxHeight: '440px',
                width: '88vw',
                height: '88vw',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                background: '#132a13',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'whatsappZoom 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {profileForm.profileImage || user?.profileImage ? (
                <img
                  src={profileForm.profileImage || user?.profileImage}
                  alt={user?.name || 'Profile'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                    color: '#ffffff',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      border: '2px dashed rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {(user?.name || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#ffffff', fontSize: '1.25rem' }}>No Profile Photo Yet</h4>
                    <p style={{ margin: 0, color: '#dcfce7', fontSize: '0.85rem' }}>
                      Add a farm or profile photo to build trust with buyers & Krushi Kendra owners.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
                  >
                    <Camera size={16} />
                    <span>Upload Photo Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(15, 23, 19, 0.9)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Camera size={17} />
              <span>{profileForm.profileImage || user?.profileImage ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhotoViewerOpen(false);
                setProfileModalOpen(true);
              }}
              className="btn btn-outline"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Edit2 size={16} />
              <span>Edit Profile Details</span>
            </button>

            <button
              type="button"
              onClick={() => setPhotoViewerOpen(false)}
              className="btn btn-outline"
              style={{
                background: 'transparent',
                color: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
