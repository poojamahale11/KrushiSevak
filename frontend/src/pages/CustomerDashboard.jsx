import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBasket,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  User,
  Store,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const CustomerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobile: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        address: user.address || '',
        village: user.village || '',
        taluka: user.taluka || '',
        district: user.district || '',
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.updateProfile(profileForm);
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile updated successfully!');
        setProfileModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
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
        {/* Notifications */}
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

        {/* Customer Header */}
        <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #0277bd, #01579b)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.18)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', marginBottom: '0.85rem' }}>
            <ShoppingBasket size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Customer Dashboard</span>
          </div>
          <h1>Welcome, {user?.name}! 🛒</h1>
          <p>Browse farm-fresh produce, explore regional crop data, and connect with verified farmers across Maharashtra.</p>

          <div className="dashboard-meta">
            <div className="meta-item">
              <Phone size={16} />
              <span>{user?.mobile || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
            <div className="meta-item">
              <Calendar size={16} />
              <span>Member Since: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>
                <User size={20} style={{ color: '#0288d1' }} />
                <span>Profile Overview</span>
              </h3>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="btn btn-sm btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Mobile</span>
                <span className="info-value">{user?.mobile}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-value" style={{ maxWidth: '400px', fontSize: '0.85rem' }}>
                  {user?.address || 'Not provided'}
                </span>
              </div>
              {user?.village && (
                <div className="info-row">
                  <span className="info-label">Location</span>
                  <span className="info-value">
                    {user.village}
                    {user.taluka && `, ${user.taluka}`}
                    {user.district && `, ${user.district}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Portal Entry Cards */}
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} style={{ color: '#0288d1' }} />
            <span>Explore Customer Portal</span>
          </h3>
          <div className="quick-cards-grid">
            <Link to="/marketplace" className="quick-action-card">
              <div className="card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <ShoppingBasket size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Farmer Marketplace</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Browse and search fresh crops directly from verified farmers. Filter by district, taluka, and crop type.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Browse Marketplace →
              </span>
            </Link>

            <Link to="/crop-area-data" className="quick-action-card">
              <div className="card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <TrendingUp size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Crop & Area Data</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Explore regional farming data, view farmer statistics by district and taluka, and see what crops are grown in your area.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View Area Data →
              </span>
            </Link>

            <Link to="/agri-assistant" className="quick-action-card">
              <div className="card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <MessageSquare size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>AI Assistant</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Get instant answers about farming, crops, weather, and agriculture practices. Supports English, Hindi, and Marathi.
              </p>
              <span style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Ask AI Assistant →
              </span>
            </Link>
          </div>
        </div>

        {/* Information Section */}
        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', borderRadius: 'var(--radius-lg)', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <MapPin size={32} style={{ color: '#0288d1', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Connect with Local Farmers
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                KrushiSevak Marketplace connects you directly with farmers across Maharashtra. 
                Browse crop listings with real farmer information, photos, prices, and locations. 
                Use the Marketplace to find fresh produce from your region, and Crop & Area Data to 
                discover farming patterns and statistics in your district.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Edit Profile Modal */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: '#0288d1' }} />
                <span>Edit Profile</span>
              </h3>
              <button onClick={() => setProfileModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Complete address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Village</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.village}
                    onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Taluka</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.taluka}
                    onChange={(e) => setProfileForm({ ...profileForm, taluka: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.district}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setProfileModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0288d1', borderColor: '#0288d1', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
