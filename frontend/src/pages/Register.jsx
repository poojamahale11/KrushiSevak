import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, ShoppingBasket, Store, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const initialRole = ['farmer', 'customer', 'storeOwner'].includes(requestedRole)
    ? requestedRole
    : 'farmer';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    address: '',
    village: '',
    taluka: '',
    district: '',
    landSize: '',
    crops: '',
    shopName: '',
    shopAddress: '',
    shopContact: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['farmer', 'customer', 'storeOwner'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic frontend validation
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Mobile, Password).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const normalizedMobile = formData.mobile.replace(/[\s-]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(normalizedMobile)) {
      setError('Please provide a valid mobile number.');
      return;
    }

    if (role === 'storeOwner' && !formData.shopName.trim()) {
      setError('Please provide your Krushi Seva Kendra name.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        role,
      };

      const user = await register(payload);
      navigate(getRoleDashboardPath(user.role), { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000';
      } else if (err.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please login or use a different email.';
      } else if (err.message.includes('Invalid')) {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h2>{t('registerTitle')}</h2>
          <p>{t('registerSubtitle')}</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => { setRole('farmer'); setError(''); }}
          >
            <Sprout size={20} />
            <span>{t('farmer')}</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => { setRole('customer'); setError(''); }}
          >
            <ShoppingBasket size={20} />
            <span>{t('customer')}</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'storeOwner' ? 'active' : ''}`}
            onClick={() => { setRole('storeOwner'); setError(''); }}
          >
            <Store size={20} />
            <span>{t('storeOwner')}</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Core Credentials */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">{t('name')} *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Patil"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email')} *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobile">{t('mobile')} *</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                className="form-input"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')} *</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />
            </div>
          </div>

          {/* Conditional Role-Specific Fields */}
          {role === 'farmer' && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary-600)' }}>
                🌱 {t('farmDetails')}
              </h4>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="village">{t('village')}</label>
                  <input
                    id="village"
                    name="village"
                    type="text"
                    className="form-input"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Rahuri"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="taluka">{t('taluka')}</label>
                  <input
                    id="taluka"
                    name="taluka"
                    type="text"
                    className="form-input"
                    value={formData.taluka}
                    onChange={handleChange}
                    placeholder="e.g. Rahuri"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="district">{t('district')}</label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    className="form-input"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Ahmednagar"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="landSize">{t('landSize')}</label>
                  <input
                    id="landSize"
                    name="landSize"
                    type="text"
                    className="form-input"
                    value={formData.landSize}
                    onChange={handleChange}
                    placeholder="e.g. 5.5 Acres"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="crops">{t('crops')}</label>
                  <input
                    id="crops"
                    name="crops"
                    type="text"
                    className="form-input"
                    value={formData.crops}
                    onChange={handleChange}
                    placeholder="e.g. Sugarcane, Onion, Wheat, Soyabean"
                  />
                  <span className="form-helper">Separate multiple crops with commas</span>
                </div>
              </div>
            </div>
          )}

          {role === 'storeOwner' && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#b45309' }}>
                🏪 {t('storeDetails')}
              </h4>

              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label htmlFor="shopName">{t('shopName')} *</label>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    className="form-input"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="e.g. Kisan Agri Seva Kendra"
                    required={role === 'storeOwner'}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="shopAddress">{t('shopAddress')}</label>
                  <input
                    id="shopAddress"
                    name="shopAddress"
                    type="text"
                    className="form-input"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    placeholder="e.g. APMC Market Yard, Station Road, Nashik"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="shopContact">{t('shopContact')}</label>
                  <input
                    id="shopContact"
                    name="shopContact"
                    type="tel"
                    className="form-input"
                    value={formData.shopContact}
                    onChange={handleChange}
                    placeholder="Store phone / helpline"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'customer' && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#2563eb' }}>
                🛒 {t('customer')}
              </h4>

              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label htmlFor="address">{t('address')}</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Main Road, Kothrud, Pune"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-village">{t('village')}</label>
                  <input
                    id="customer-village"
                    name="village"
                    type="text"
                    className="form-input"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Village / Town"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-taluka">{t('taluka')}</label>
                  <input
                    id="customer-taluka"
                    name="taluka"
                    type="text"
                    className="form-input"
                    value={formData.taluka}
                    onChange={handleChange}
                    placeholder="Taluka / Block"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="customer-district">{t('district')}</label>
                  <input
                    id="customer-district"
                    name="district"
                    type="text"
                    className="form-input"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? t('loading') : `${t('registerBtn')} (${t(role)})`}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          <span>{t('haveAccount')} </span>
          <Link to="/login" style={{ fontWeight: 600 }}>
            {t('loginHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};
