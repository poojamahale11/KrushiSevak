import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBasket,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  User,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Camera,
  Trash2,
  Tag,
  RefreshCw,
  ExternalLink,
  Eye,
  UploadCloud,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const CustomerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);

  // Profile photo file input ref
  const photoInputRef = useRef(null);

  // Real MongoDB Live Data States
  const [stats, setStats] = useState({
    marketplaceCount: 0,
    farmersCount: 0,
    cropsCount: 0,
  });
  const [recentListings, setRecentListings] = useState([]);
  const [weather, setWeather] = useState(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobile: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
    profileImage: '',
  });

  // Sync profile form with authenticated user
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
        village: user.village || '',
        taluka: user.taluka || '',
        district: user.district || '',
        profileImage: user.profileImage || '',
      });
      loadDashboardData();
    }
  }, [user]);

  // Fetch real data from MongoDB
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Real Marketplace Produce Listings
      const listingsPromise = api.getCropListings().catch((err) => {
        console.warn('Marketplace fetch notice:', err);
        return { success: false, listings: [] };
      });

      // 2. Fetch Real Crop & Area Statistics
      const areaDataPromise = api.getAreaData().catch((err) => {
        console.warn('Area data fetch notice:', err);
        return { success: false, totalFarmers: 0, totalCrops: 0 };
      });

      // 3. Fetch Real-time Regional Weather
      const weatherPromise = api.getWeather({
        location: user?.village || user?.taluka || 'Pune',
        district: user?.district || 'Pune',
      }).catch((err) => {
        console.warn('Weather fetch notice:', err);
        return { success: false, weather: null };
      });

      const [listingsRes, areaDataRes, weatherRes] = await Promise.all([
        listingsPromise,
        areaDataPromise,
        weatherPromise,
      ]);

      const listings = listingsRes.success ? (listingsRes.listings || []) : [];
      const totalFarmers = areaDataRes.success ? (areaDataRes.totalFarmers || 0) : 0;
      const totalCrops = areaDataRes.success ? (areaDataRes.totalCrops || 0) : 0;

      setStats({
        marketplaceCount: listings.length,
        farmersCount: totalFarmers,
        cropsCount: totalCrops,
      });

      // Save top 4 recent real produce listings for preview
      setRecentListings(listings.slice(0, 4));

      if (weatherRes.success && weatherRes.weather) {
        setWeather(weatherRes.weather);
      }
    } catch (err) {
      console.error('Customer Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

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
      const res = await api.updateProfile(profileForm);
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Customer profile updated successfully!');
        setProfileModalOpen(false);

        // Refresh weather for updated district/village
        const weatherRes = await api.getWeather({
          location: res.user.village || res.user.taluka || 'Pune',
          district: res.user.district || 'Pune',
        }).catch(() => ({ success: false }));

        if (weatherRes.success && weatherRes.weather) {
          setWeather(weatherRes.weather);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  // Render matching weather icon
  const renderWeatherIcon = (condition = '') => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return <CloudRain size={28} style={{ color: '#0284c7' }} />;
    }
    if (cond.includes('cloud')) {
      return <Cloud size={28} style={{ color: '#64748b' }} />;
    }
    if (cond.includes('sun') || cond.includes('clear')) {
      return <Sun size={28} style={{ color: '#f59e0b' }} />;
    }
    return <CloudSun size={28} style={{ color: '#eab308' }} />;
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

        {/* ================= 1. WELCOME SECTION (HERO BANNER WITH AVATAR & PHOTO VIEWER TRIGGER) ================= */}
        <div
          style={{
            background: 'linear-gradient(135deg, #075985 0%, #0284c7 50%, #0ea5e9 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.25rem 2rem',
            color: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.75rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            
            {/* Customer Avatar & Photo Upload Trigger (Click to Open WhatsApp-Style Full Photo) */}
            <div
              className="farmer-avatar-upload-wrap"
              onClick={() => setPhotoViewerOpen(true)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
              }}
              title="Click to view profile photo (WhatsApp style)"
            >
              {profileForm.profileImage || user?.profileImage ? (
                <img
                  src={profileForm.profileImage || user?.profileImage}
                  alt={user?.name || 'Customer'}
                  className="farmer-avatar-img"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ffffff',
                    background: '#e0f2fe',
                    display: 'block',
                  }}
                  onError={(e) => {
                    console.error("Customer avatar image load error");
                  }}
                />
              ) : (
                <div
                  className="farmer-avatar-placeholder"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
                    color: '#ffffff',
                    border: '3px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.25rem',
                    fontWeight: 800,
                  }}
                >
                  {(user?.name || 'C').charAt(0).toUpperCase()}
                </div>
              )}

              {/* Hover Eye Overlay */}
              <div
                className="avatar-hover-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <Eye size={22} style={{ color: '#ffffff' }} />
              </div>

              {/* Camera Upload Badge Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  photoInputRef.current?.click();
                }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.2s ease',
                }}
                title="Upload or Change Profile Photo"
              >
                <Camera size={15} />
              </button>
            </div>

            {/* Customer Information & Welcome Text */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              
              {/* Customer Portal Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  <ShoppingBasket size={14} />
                  <span>Customer Produce Hub</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#a7f3d0',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={13} /> Verified Buyer
                </span>
              </div>

              {/* Greeting */}
              <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem' }}>
                Welcome, {user?.name || 'Customer'}! 👋
              </h1>
              <p style={{ fontSize: '0.92rem', color: '#e0f2fe', margin: '0 0 1.25rem', maxWidth: '650px', lineHeight: 1.55 }}>
                Directly buy fresh crops from verified Maharashtra farmers, track regional harvest availability, and get instant agricultural insights.
              </p>

              {/* Meta details pills */}
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {user?.mobile && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#ffffff',
                    }}
                  >
                    <Phone size={13} style={{ color: '#7dd3fc' }} />
                    <span>{user.mobile}</span>
                  </div>
                )}

                {user?.email && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#ffffff',
                    }}
                  >
                    <Mail size={13} style={{ color: '#7dd3fc' }} />
                    <span>{user.email}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                  }}
                >
                  <MapPin size={13} style={{ color: '#7dd3fc' }} />
                  <span>
                    {user?.village
                      ? `${user.village}${user.district ? `, ${user.district}` : ''}`
                      : user?.district || 'Maharashtra, India'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                  }}
                >
                  <Calendar size={13} style={{ color: '#7dd3fc' }} />
                  <span>Member Since: {formattedDate}</span>
                </div>
              </div>

            </div>

            {/* Quick Action Buttons on Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignSelf: 'flex-start' }}>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#0369a1',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => photoInputRef.current?.click()}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Camera size={13} />
                <span>{profileForm.profileImage || user?.profileImage ? 'Change Photo' : 'Add Photo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= 2. LIVE QUICK METRICS BAR ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBasket size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Marketplace Produce</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', fontFamily: 'Outfit, sans-serif' }}>
                {stats.marketplaceCount} Crops for Sale
              </span>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Registered Farmers</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0369a1', fontFamily: 'Outfit, sans-serif' }}>
                {stats.farmersCount} Verified Growers
              </span>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderWeatherIcon(weather?.condition)}
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                Weather in {weather?.location || user?.district || 'Pune'}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309', fontFamily: 'Outfit, sans-serif' }}>
                {weather ? `${weather.temperature}°C, ${weather.condition}` : '28°C, Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. CORE SERVICE CARDS ================= */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Sparkles size={20} style={{ color: '#0284c7' }} />
              <span>Explore KrushiSevak Customer Services</span>
            </h2>
            <button
              onClick={loadDashboardData}
              className="btn btn-sm btn-outline"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
              title="Refresh live data from MongoDB"
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh Data</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Card 1: Farmer Marketplace */}
            <Link
              to="/marketplace"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = '#16a34a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBasket size={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {stats.marketplaceCount > 0 ? `${stats.marketplaceCount} Active Listings` : 'Farm Fresh'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Farmer Marketplace
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                Buy fresh vegetables, fruits, and grains directly from verified Maharashtra farmers with transparent quality and direct farmer contact.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700, fontSize: '0.88rem' }}>
                <span>Browse Marketplace</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* Card 2: Crop & Area Data */}
            <Link
              to="/crop-area-data"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {stats.farmersCount > 0 ? `${stats.farmersCount} Farmers in DB` : 'Maharashtra Data'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Crop & Area Data
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                Explore live crops available across 36 districts and talukas in Maharashtra. Search crops and view verified farmer registrations.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.88rem' }}>
                <span>View Crop & Area Data</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* Card 3: AI Assistant */}
            <Link
              to="/agri-assistant"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#f3e8ff',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MessageSquare size={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#f3e8ff',
                    color: '#7e22ce',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  24/7 AI Guide
                </span>
              </div>

              <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                AI Agri Assistant
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                Ask instant questions regarding produce quality, seasonal crop harvest timings, and market rates in English, Marathi, or Hindi.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontWeight: 700, fontSize: '0.88rem' }}>
                <span>Ask AI Assistant</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* Card 4: Real Local Weather & Advisory */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderWeatherIcon(weather?.condition)}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <MapPin size={11} />
                  {weather?.location || user?.district || 'Pune'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
                  {weather ? `${weather.temperature}°C` : '28°C'}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#d97706' }}>
                  {weather?.condition || 'Clear Weather'}
                </span>
              </div>

              {/* Weather Sub-metrics */}
              <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Droplets size={13} style={{ color: '#0284c7' }} />
                  Humidity: {weather?.humidity || '62'}%
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Wind size={13} style={{ color: '#64748b' }} />
                  Wind: {weather?.windSpeed || '12'} km/h
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', lineHeight: 1.4, margin: 'auto 0 0', border: '1px solid #f1f5f9' }}>
                💡 <b>Advisory:</b> {weather?.advisory || 'Good weather conditions for fresh farm produce transportation and direct deliveries.'}
              </p>
            </div>
          </div>
        </div>

        {/* ================= 4. RECENT LIVE PRODUCE PREVIEW (REAL MONGODB LISTINGS) ================= */}
        {recentListings.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Tag size={20} style={{ color: '#16a34a' }} />
                  <span>Fresh Farm Produce Available Now</span>
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Live crop listings published by verified local farmers
                </p>
              </div>

              <Link
                to="/marketplace"
                className="btn btn-sm btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', borderColor: '#86efac' }}
              >
                <span>View All {stats.marketplaceCount} Listings</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {recentListings.map((item) => {
                const itemImg = (item.images && item.images.length > 0) ? item.images[0] : item.imageUrl;
                return (
                  <div
                    key={item._id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Produce Image */}
                    <div style={{ height: '140px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.cropName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <ShoppingBasket size={36} style={{ opacity: 0.5 }} />
                        </div>
                      )}

                      {/* Quality Grade Badge */}
                      {item.quality && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(22, 163, 74, 0.9)',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {item.quality}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                          {item.cropName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          {item.category || 'Produce'}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', margin: '0.25rem 0 0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                        ₹{item.pricePerUnit} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {item.unit || 'kg'}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.85rem' }}>
                        <MapPin size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.village ? `${item.village}, ${item.district || ''}` : item.district || 'Maharashtra'}
                        </span>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <Link
                          to="/marketplace"
                          className="btn btn-sm btn-primary"
                          style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem',
                            fontSize: '0.82rem',
                          }}
                        >
                          <span>Contact / Order</span>
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 5. CUSTOMER PROFILE & DELIVERY INFO CARD ================= */}
        <div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  onClick={() => setPhotoViewerOpen(true)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    border: '2px solid #0284c7',
                    flexShrink: 0,
                  }}
                  title="Click to view full photo"
                >
                  {profileForm.profileImage || user?.profileImage ? (
                    <img
                      src={profileForm.profileImage || user?.profileImage}
                      alt="Customer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                      {(user?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                    <span>Customer Profile & Delivery Address</span>
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Managed directly via your verified KrushiSevak account</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="btn btn-sm btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <Camera size={14} />
                  <span>Update Photo</span>
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="btn btn-sm btn-primary"
                  style={{ background: '#0284c7', borderColor: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <Edit2 size={14} />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Full Name</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || 'Not provided'}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Mobile Number</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.mobile || 'Not provided'}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Email Address</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.email || 'Not provided'}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Village / Town</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.village || 'Not set'}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Taluka</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.taluka || 'Not set'}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>District</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.district || 'Not set'}</span>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Delivery Address</span>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-body)', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', display: 'block', border: '1px solid #f1f5f9' }}>
                  {user?.address || 'No complete postal delivery address added yet. Click "Edit Details" to save your address for farm-fresh deliveries.'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= 6. WHATSAPP-STYLE FULL PROFILE PHOTO VIEWER MODAL ================= */}
      {photoViewerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(9, 17, 23, 0.95)',
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
              background: 'rgba(15, 23, 42, 0.92)',
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
                  {user?.name || 'Customer Profile'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={13} /> Verified KrushiSevak Customer
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
                background: '#0c4a6e',
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
                  alt={user?.name || 'Customer Profile'}
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
                    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
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
                    {(user?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#ffffff', fontSize: '1.25rem' }}>No Profile Photo Yet</h4>
                    <p style={{ margin: 0, color: '#e0f2fe', fontSize: '0.85rem' }}>
                      Add a profile photo to personalize your KrushiSevak customer account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', background: '#ffffff', color: '#0369a1' }}
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
              background: 'rgba(15, 23, 42, 0.92)',
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
                background: '#0284c7',
                borderColor: '#0284c7',
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

      {/* ================= 7. EDIT PROFILE MODAL (WITH PHOTO UPLOADER) ================= */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: '#0284c7' }} />
                <span>Edit Customer Profile</span>
              </h3>
              <button onClick={() => setProfileModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Profile Avatar Upload in Modal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <div
                style={{ position: 'relative', width: '84px', height: '84px', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => setPhotoViewerOpen(true)}
                title="Click to view full photo (WhatsApp style)"
              >
                {profileForm.profileImage || user?.profileImage ? (
                  <img
                    src={profileForm.profileImage || user?.profileImage}
                    alt="Customer Avatar"
                    style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0284c7', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                  />
                ) : (
                  <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                    {(profileForm.name || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    photoInputRef.current?.click();
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                  title="Upload Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: 'var(--text-main)' }}>Profile Photo</h4>
                <p style={{ margin: '0 0 0.65rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Personalize your account for orders and marketplace chats.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => photoInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                  >
                    <UploadCloud size={13} /> Upload Photo
                  </button>
                  {(profileForm.profileImage || user?.profileImage) && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={handleRemoveProfilePhoto}
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Village / Town</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Niphad, Rahuri, Kothrud"
                    value={profileForm.village}
                    onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Taluka</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Haveli, Nashik"
                    value={profileForm.taluka}
                    onChange={(e) => setProfileForm({ ...profileForm, taluka: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune, Nashik, Ahmednagar"
                    value={profileForm.district}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Complete Delivery Address</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Flat/House No., Street Name, Area, Pincode"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setProfileModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: '#0284c7',
                    borderColor: '#0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Save size={16} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
