import React, { useState, useEffect } from 'react';
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
  const [listingImages, setListingImages] = useState([]); // Changed from single to multiple
  const [locationSaving, setLocationSaving] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

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
      });
      loadDashboardData();
    }
  }, [user]);

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
        setSuccessMsg('Profile updated successfully in MongoDB!');
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
        // Edit existing crop
        const res = await api.updateCrop(editingCrop._id, cropForm);
        if (res.success && res.crop) {
          setCrops((prev) => prev.map((c) => (c._id === res.crop._id ? res.crop : c)));
          setSuccessMsg('Crop record updated successfully!');
        }
      } else {
        // Add new crop
        const res = await api.addCrop(cropForm);
        if (res.success && res.crop) {
          setCrops((prev) => [res.crop, ...prev]);
          setSuccessMsg('New crop registered successfully to MongoDB!');
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
        if (res.success) { updateUser(res.user); setProfileForm(prev => ({ ...prev, location })); setSuccessMsg('Real farm location saved. Customers can now see distance and directions.'); }
      } catch (err) { setError(err.message || 'Could not save your location.'); }
      finally { setLocationSaving(false); }
    }, () => { setLocationSaving(false); setError('Location permission was not allowed. Please enable location permission in your browser.'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  };

  const handleSaveListing = async (e) => {
    e.preventDefault(); setError(''); setSuccessMsg('');
    try {
      if (!profileForm.location && !user?.location) { setError('Please save your real farm location first using “Use My Current Location”.'); return; }
      const res = await api.createCropListing(listingForm);
      if (res.success) {
        let savedListing = res.listing;
        if (listingImage) {
          const imageRes = await api.uploadCropListingImage(savedListing._id, listingImage);
          if (imageRes.success) savedListing = imageRes.listing;
        }
        setListings(prev => [savedListing, ...prev]);
        setListingModalOpen(false);
        setListingImage(null);
        setListingForm({ cropName:'', category:'Vegetable', quantity:'', unit:'kg', pricePerUnit:'', quality:'', harvestDate:'', description:'' });
        setSuccessMsg('Crop published with your real farm location. Customers can find it nearby.');
      }
    } catch (err) { setError(err.message || 'Failed to create crop listing.'); }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this marketplace listing?')) return;
    try { await api.deleteCropListing(id); setListings(prev => prev.filter(x => x._id !== id)); setSuccessMsg('Marketplace listing deleted.'); }
    catch (err) { setError(err.message || 'Failed to delete listing.'); }
  };

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
        {/* Alerts & Notifications */}
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

        {/* Farmer Dashboard Header */}
        <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.18)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', marginBottom: '0.85rem' }}>
            <Sprout size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t('farmerDashboardTitle')}</span>
          </div>
          <h1>{t('welcome')}, {user?.name}! 🌾</h1>
          <p>{t('farmerDashboardDesc')}</p>

          <div className="dashboard-meta">
            <div className="meta-item">
              <MapPin size={16} />
              <span>{user?.village || 'Village'}, {user?.taluka || 'Taluka'}, {user?.district || 'District'}</span>
            </div>
            <div className="meta-item">
              <Phone size={16} />
              <span>{user?.mobile || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <Calendar size={16} />
              <span>{t('memberSince')}: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Top Grid: Profile Card & Live Weather Widget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Farm Profile View / Edit Card */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>
                <Sprout size={20} style={{ color: '#2e7d32' }} />
                <span>{t('farmDetails')}</span>
              </h3>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="btn btn-sm btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Edit2 size={14} />
                <span>{t('editProfile')}</span>
              </button>
            </div>

            <div className="info-list">
              <div className="info-row">
                <span className="info-label">{t('name')}</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t('mobile')}</span>
                <span className="info-value">{user?.mobile}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t('landSize')}</span>
                <span className="info-value" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
                  {user?.landSize || 'Not specified'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">{t('village')}</span>
                <span className="info-value">{user?.village || 'Not specified'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t('taluka')}</span>
                <span className="info-value">{user?.taluka || 'Not specified'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t('district')}</span>
                <span className="info-value">{user?.district || 'Not specified'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t('address')}</span>
                <span className="info-value" style={{ maxWidth: '240px', fontSize: '0.82rem' }}>
                  {user?.address || `${user?.village || ''}, ${user?.district || ''}`}
                </span>
              </div>
            </div>
          </div>

          {/* Location-based Weather Widget */}
          <div className="weather-card">
            <div className="weather-header">
              <div>
                <div className="weather-location">
                  <MapPin size={18} />
                  <span>{weather?.location || `${user?.village || 'Rahuri'}, ${user?.district || 'Ahmednagar'}`}</span>
                </div>
                <span className="weather-updated">Agro-Met Station Live • {weather?.condition || 'Clear Sky'}</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                Live Advisory
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

            {/* 4-Day Forecast Strip */}
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
              <div className="advisory-box" style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}>
                <strong style={{ color: '#fed7aa' }}>
                  <Sparkles size={16} />
                  {t('advisory')}:
                </strong>
                <ul style={{ color: '#f0fdf4' }}>
                  {weather.advisories.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Farmer-to-Customer Marketplace */}
        <div className="dash-card" style={{ marginBottom: '2.5rem' }}>
          <div className="dash-card-header"><h3>🌾 Sell Your Harvest Directly</h3><button onClick={() => setListingModalOpen(true)} className="btn btn-sm btn-primary">+ Create Listing</button></div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Publish your available harvest so customers can search, contact you and place orders.</p>
          {listings.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No marketplace listings yet.</p> : <div className="produce-grid">{listings.map((l) => <div className="produce-card" key={l._id}><div style={{display:'flex',justifyContent:'space-between'}}><b>{l.cropName}</b><span className="crop-category-badge">{l.status}</span></div><p style={{fontSize:'.84rem'}}>₹{l.pricePerUnit}/{l.unit} • {l.quantity} {l.unit}</p><button className="btn btn-sm btn-outline" onClick={() => handleDeleteListing(l._id)}>Delete Listing</button></div>)}</div>}
        </div>

        {/* Crop Management Section (CRUD) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sprout size={24} style={{ color: 'var(--primary-500)' }} />
                <span>{t('myCrops')}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>({crops.length})</span>
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Add, edit, or delete crop information stored in MongoDB.
              </p>
            </div>
            <button onClick={openAddCropModal} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} />
              <span>{t('addCrop')}</span>
            </button>
          </div>

          {crops.length === 0 ? (
            <div className="dash-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Sprout size={48} style={{ color: 'var(--primary-300)', margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Crops Registered Yet</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('noCropsYet')}</p>
              <button onClick={openAddCropModal} className="btn btn-primary">
                <Plus size={16} />
                <span>{t('addCrop')}</span>
              </button>
            </div>
          ) : (
            <div className="crops-grid">
              {crops.map((crop) => (
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
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: crop.status === 'Ready for Harvest' ? '#fef3c7' : crop.status === 'Harvested' ? '#e0f2fe' : '#dcfce7',
                        color: crop.status === 'Ready for Harvest' ? '#b45309' : crop.status === 'Harvested' ? '#0369a1' : '#15803d',
                        border: '1px solid currentColor',
                      }}
                    >
                      {crop.status || 'Growing'}
                    </span>
                  </div>

                  <div style={{ margin: '0.75rem 0' }}>
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
                        <span className="info-value">{crop.expectedHarvestDate}</span>
                      </div>
                    )}
                    {crop.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        "{crop.notes}"
                      </p>
                    )}
                  </div>

                  <div className="crop-card-actions">
                    <button
                      onClick={() => openEditCropModal(crop)}
                      className="btn btn-sm btn-outline"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Edit2 size={14} />
                      <span>{t('edit')}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCrop(crop._id)}
                      className="btn btn-sm btn-danger-outline"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title="Delete Crop"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Navigation Cards (Crop & Area, Disease Detection, Kendra, Marketplace) */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Integrated Agricultural Services</h3>
          <div className="quick-cards-grid">
            {/* 1. Crop & Area Data */}
            <Link to="/crop-area-data" className="quick-action-card">
              <div className="card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <TrendingUp size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{t('cropAreaData')}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                View regional crop percentages, most grown crops, and farmer directories in {user?.district || 'your area'}.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Open Analytics & Charts →
              </span>
            </Link>

            {/* 2. Disease Detection */}
            <Link to="/disease-detection" className="quick-action-card">
              <div className="card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{t('exploreDiseaseDetection')}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {t('exploreDiseaseDetectionDesc')}
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Scan Crop Disease →
              </span>
            </Link>

            {/* 3. Krushi Seva Kendra */}
            <Link to="/krushi-seva-kendra" className="quick-action-card">
              <div className="card-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Store size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{t('exploreKendra')}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {t('exploreKendraDesc')}
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Find Nearby Kendras →
              </span>
            </Link>

            {/* 4. Marketplace */}
            <Link to="/marketplace" className="quick-action-card">
              <div className="card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <ShoppingBag size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{t('exploreMarketplace')}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {t('exploreMarketplaceDesc')}
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Sell Harvest Directly →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Edit Profile Modal */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: 'var(--primary-500)' }} />
                <span>{t('editProfile')}</span>
              </h3>
              <button onClick={() => setProfileModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
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
                    <div><b style={{display:'flex',alignItems:'center',gap:'.35rem'}}><MapPin size={17}/> Real Farm Location</b><div style={{fontSize:'.78rem',color:'var(--text-muted)',marginTop:'.25rem'}}>{profileForm.location ? `GPS saved: ${Number(profileForm.location.lat).toFixed(5)}, ${Number(profileForm.location.lng).toFixed(5)}` : 'Required so customers can see your farm on the map.'}</div></div>
                    <button type="button" className="btn btn-sm btn-primary" onClick={captureFarmerLocation} disabled={locationSaving} style={{display:'inline-flex',alignItems:'center',gap:'.35rem'}}><LocateFixed size={15}/>{locationSaving ? 'Saving GPS...' : 'Use My Current Location'}</button>
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
                  <span>{t('save')} Profile</span>
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
                    placeholder="e.g. Red Onion, Sugarcane (Co 86032), Wheat"
                    className="form-input"
                    value={cropForm.cropName}
                    onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('cropCategory')}</label>
                  <select
                    className="form-input"
                    value={cropForm.category}
                    onChange={(e) => setCropForm({ ...cropForm, category: e.target.value })}
                  >
                    <option value="Cash Crop">Cash Crop (ऊस, कापूस)</option>
                    <option value="Grain">Grain / Cereals (गहू, भात, ज्वारी)</option>
                    <option value="Vegetable">Vegetables (कांदा, टोमॅटो)</option>
                    <option value="Fruit">Fruits (द्राक्षे, डाळिंब, मोसंबी)</option>
                    <option value="Pulses">Pulses (तूर, हरभरा)</option>
                    <option value="Oilseed">Oilseeds (सोयाबीन, भुईमूग)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('acreage')} *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
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
                    <option value="Kharif">Kharif (खरीप)</option>
                    <option value="Rabi">Rabi (रब्बी)</option>
                    <option value="Zaid">Zaid / Summer (उन्हाळी)</option>
                    <option value="Perennial / Annual">Perennial / Annual (वार्षिक / बारमाही)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('cropStatus')}</label>
                  <select
                    className="form-input"
                    value={cropForm.status}
                    onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
                  >
                    <option value="Growing">Growing (लागवड / वाढ चालू)</option>
                    <option value="Ready for Harvest">Ready for Harvest (काढणीस तयार)</option>
                    <option value="Harvested">Harvested (काढणी झालेली)</option>
                    <option value="Planned">Planned (नियोजित)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('sowingDate')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={cropForm.sowingDate}
                    onChange={(e) => setCropForm({ ...cropForm, sowingDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('expectedHarvestDate')}</label>
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
                    placeholder="e.g. 120 Quintals / 85 Tonnes"
                    className="form-input"
                    value={cropForm.expectedYield}
                    onChange={(e) => setCropForm({ ...cropForm, expectedYield: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">{t('notes')}</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Drip irrigated, export grade quality, organic bio-fertilizer used"
                    className="form-input"
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
                  <span>{editingCrop ? t('save') : t('add')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        {listingModalOpen && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
            <form onSubmit={handleSaveListing} className="dash-card" style={{width:'min(680px,100%)',maxHeight:'92vh',overflowY:'auto',background:'#fff'}}>
              <div className="dash-card-header"><h3>Sell Your Crop</h3><button type="button" className="btn btn-sm btn-outline" onClick={() => {setListingModalOpen(false);setListingImage(null);}}>×</button></div>
              <p style={{fontSize:'.84rem',color:'var(--text-muted)',marginBottom:'1rem'}}>Add the exact crop details customers need. Your saved GPS location will be attached automatically.</p>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Crop name *</label><input className="form-input" placeholder="e.g. Onion" required value={listingForm.cropName} onChange={e=>setListingForm({...listingForm,cropName:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={listingForm.category} onChange={e=>setListingForm({...listingForm,category:e.target.value})}><option>Vegetable</option><option>Fruit</option><option>Grain</option><option>Pulses</option><option>Cash Crop</option><option>Other</option></select></div>
                <div className="form-group"><label className="form-label">Quantity *</label><input className="form-input" type="number" min="0.1" step="0.1" placeholder="e.g. 500" required value={listingForm.quantity} onChange={e=>setListingForm({...listingForm,quantity:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Unit *</label><select className="form-input" value={listingForm.unit} onChange={e=>setListingForm({...listingForm,unit:e.target.value})}><option value="kg">kg</option><option value="quintal">quintal</option><option value="ton">ton</option><option value="bag">bag</option></select></div>
                <div className="form-group"><label className="form-label">Price per unit (₹) *</label><input className="form-input" type="number" min="0" step="0.01" placeholder="e.g. 28 per kg" required value={listingForm.pricePerUnit} onChange={e=>setListingForm({...listingForm,pricePerUnit:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Quality / grade</label><input className="form-input" placeholder="e.g. A Grade" value={listingForm.quality} onChange={e=>setListingForm({...listingForm,quality:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Harvest date</label><input className="form-input" type="date" value={listingForm.harvestDate} onChange={e=>setListingForm({...listingForm,harvestDate:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Crop photo</label><input className="form-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setListingImage(e.target.files?.[0] || null)}/><small style={{color:'var(--text-muted)'}}>JPG/PNG/WEBP, max 7 MB</small></div>
                <div className="form-group col-span-2"><label className="form-label">Description</label><textarea className="form-input" rows={3} placeholder="Mention size, packing, freshness, pickup details..." value={listingForm.description} onChange={e=>setListingForm({...listingForm,description:e.target.value})}/></div>
              </div>
              {listingImage && <div style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.7rem',background:'#f8fafc',borderRadius:'10px',marginTop:'.8rem'}}><ImageIcon size={18}/><span style={{fontSize:'.82rem'}}>{listingImage.name}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.75rem',marginTop:'1rem',flexWrap:'wrap'}}>
                <span style={{fontSize:'.78rem',color: user?.location ? '#166534' : '#b45309',display:'flex',alignItems:'center',gap:'.3rem'}}><MapPin size={14}/>{user?.location ? 'Real farm GPS location ready' : 'Save your GPS location before publishing'}</span>
                <button className="btn btn-primary" type="submit" style={{display:'inline-flex',alignItems:'center',gap:'.4rem'}}><Sprout size={16}/> Publish for Customers</button>
              </div>
            </form>
          </div>
        )}
    </div>
  );
};
