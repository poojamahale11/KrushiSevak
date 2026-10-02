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
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

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
  const [listingImage, setListingImage] = useState(null);
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
          setSuccessMsg('New crop registered successfully!');
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

  const handleSaveListing = async (e) => {
    e.preventDefault(); setError(''); setSuccessMsg('');
    try {
      const payload = {
        ...listingForm,
        village: listingForm.village || user?.village || '',
        taluka: listingForm.taluka || user?.taluka || '',
        district: listingForm.district || user?.district || '',
      };
      const res = await api.createCropListing(payload);
      if (res.success) {
        let savedListing = res.listing;
        if (listingImage) {
          const imageRes = await api.uploadCropListingImage(savedListing._id, listingImage);
          if (imageRes.success) savedListing = imageRes.listing;
        }
        setListings(prev => [savedListing, ...prev]);
        setListingModalOpen(false);
        setListingImage(null);
        setListingForm({ cropName:'', category:'Vegetable', quantity:'', unit:'kg', pricePerUnit:'', quality:'', harvestDate:'', expiryDate:'', description:'', village:'', taluka:'', district:'' });
        setSuccessMsg('Crop published to marketplace successfully!');
      }
    } catch (err) { setError(err.message || 'Failed to create crop listing.'); }
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
            
            {/* Avatar & Photo Upload Trigger */}
            <div className="farmer-avatar-upload-wrap">
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
              <button
                type="button"
                className="avatar-camera-btn"
                onClick={() => photoInputRef.current?.click()}
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
                className="btn btn-sm btn-primary"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
              >
                <Plus size={16} /> Register Crop
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
            <div className="dash-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={22} style={{ color: '#0288d1' }} />
                  <span>Sell Your Harvest Directly</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                  Publish your available harvest so consumers and buyers can contact you directly.
                </p>
              </div>
              <button onClick={() => setListingModalOpen(true)} className="btn btn-sm btn-primary">
                + Create Produce Listing
              </button>
            </div>

            {listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <ShoppingBag size={42} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No active marketplace listings published yet.</p>
                <button onClick={() => setListingModalOpen(true)} className="btn btn-sm btn-primary" style={{ marginTop: '0.75rem' }}>
                  + Create First Listing
                </button>
              </div>
            ) : (
              <div className="produce-grid" style={{ marginTop: '1.25rem' }}>
                {filteredListings.map((l) => (
                  <div className="produce-card" key={l._id}>
                    {l.imageUrl && (
                      <img src={l.imageUrl} alt={l.cropName} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '10px 10px 0 0', display: 'block', marginBottom: '0.75rem' }} />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{l.cropName}</b>
                      <span className="crop-category-badge">{l.quality || l.category}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', margin: '0.4rem 0 0.8rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                      ₹{l.pricePerUnit} / {l.unit} • Available: {l.quantity} {l.unit}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-danger-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDeleteListing(l._id)}>
                        <Trash2 size={14} /> Remove
                      </button>
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
                <div style={{ position: 'relative', width: 90, height: 90 }}>
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
                    placeholder="e.g. Sugarcane (ऊस), Cotton (कापूस), Onion"
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
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCropModalOpen(false)} className="btn btn-outline">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Save size={16} />
                  <span>{editingCrop ? 'Update Crop' : 'Save Crop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Produce Listing Modal */}
      {listingModalOpen && (
        <div className="modal-overlay" onClick={() => setListingModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <ShoppingBag size={20} style={{ color: 'var(--primary-500)' }} />
                <span>Create Produce Listing</span>
              </h3>
              <button onClick={() => setListingModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveListing}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">Crop / Produce Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Sugarcane, Fresh Tomatoes"
                    className="form-input"
                    value={listingForm.cropName}
                    onChange={(e) => setListingForm({ ...listingForm, cropName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={listingForm.category}
                    onChange={(e) => setListingForm({ ...listingForm, category: e.target.value })}
                  >
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Grain">Grain / Cereal</option>
                    <option value="Pulse">Pulse / Legume</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quality Grade</label>
                  <select
                    className="form-input"
                    value={listingForm.quality}
                    onChange={(e) => setListingForm({ ...listingForm, quality: e.target.value })}
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Organic">Organic Certified</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 500"
                    className="form-input"
                    value={listingForm.quantity}
                    onChange={(e) => setListingForm({ ...listingForm, quantity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-input"
                    value={listingForm.unit}
                    onChange={(e) => setListingForm({ ...listingForm, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                    <option value="box">box</option>
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Price per Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 35"
                    className="form-input"
                    value={listingForm.pricePerUnit}
                    onChange={(e) => setListingForm({ ...listingForm, pricePerUnit: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Produce Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setListingImage(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Farm fresh harvest, direct field pickup available."
                    value={listingForm.description}
                    onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setListingModalOpen(false)} className="btn btn-outline">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
