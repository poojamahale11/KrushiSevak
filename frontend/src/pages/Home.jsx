import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShoppingBasket,
  Store,
  ArrowRight,
  ShieldCheck,
  Activity,
  CloudSun,
  MapPin,
  TrendingUp,
  Award,
  CheckCircle2,
  Sparkles,
  Users,
  Quote,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';

export const Home = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      {/* 1. Full Background Photo Hero Section with Bright Natural Lighting */}
      <section className="hero-bg-section">
        <div className="hero-bg-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content-wrapper">
            <div className="hero-glass-panel">
              <div className="hero-tag-light">
                <Sprout size={16} />
                <span>{t('heroBadge')}</span>
              </div>
              
              <h1 className="hero-title-light">
                {t('heroTitle1')}
                <span className="hero-gold-span">{t('heroTitle2')}</span>
              </h1>

              <p className="hero-desc-light">
                {t('heroDesc')}
              </p>

              {/* Hero Action Buttons */}
              <div className="hero-cta-group">
                {isAuthenticated ? (
                  <Link to={getRoleDashboardPath(user?.role)} className="btn btn-primary btn-lg">
                    <span>{t('dashboard')} ({t(user?.role)})</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      <span>{t('heroCtaPrimary')}</span>
                      <ArrowRight size={18} />
                    </Link>
                    <Link to="/login" className="btn btn-hero-glass btn-lg">
                      {t('heroCtaLogin')}
                    </Link>
                  </>
                )}
                <Link to="/disease-detection" className="btn btn-hero-emerald btn-lg">
                  <Sparkles size={18} />
                  <span>{t('heroCtaDisease')}</span>
                </Link>
                <Link to="/crop-area-data" className="btn btn-hero-glass btn-lg">
                  <TrendingUp size={18} />
                  <span>{t('heroCtaCropData')}</span>
                </Link>
              </div>

              {/* Hero Platform Metrics */}
              <div className="hero-stats-light">
                <div className="stat-item-light">
                  <h4>500+ 🌾</h4>
                  <p>{t('statFarmers')}</p>
                </div>
                <div className="stat-item-light">
                  <h4>120+ 🏪</h4>
                  <p>{t('statStores')}</p>
                </div>
                <div className="stat-item-light">
                  <h4>3,500+ 📍</h4>
                  <p>{t('statAcreage')}</p>
                </div>
                <div className="stat-item-light">
                  <h4>99.4% ✨</h4>
                  <p>Fair Trade Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Agricultural Alert & Advisory Ticker */}
      <div className="agri-ticker-bar">
        <div className="container">
          <div className="agri-ticker-inner">
            <div className="agri-ticker-item">
              <Sparkles size={16} style={{ color: '#ebd37d' }} />
              <strong>Daily Mandi Update:</strong> Soyabean ₹4,850/qtl • Onion ₹2,400/qtl • Wheat ₹2,250/qtl
            </div>
            <div className="agri-ticker-item">
              <CloudSun size={16} style={{ color: '#38bdf8' }} />
              <strong>Weather Alert:</strong> Ideal soil humidity window active for Nashik & Ahmednagar districts.
            </div>
            <div className="agri-ticker-item">
              <ShieldCheck size={16} style={{ color: '#4ade80' }} />
              <strong>Agri Doctor Tip:</strong> Scan leaf photos on AI Disease Doctor for free treatment prescriptions.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Benefits & Free Diagnosis Concept */}
      <section className="section-py" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <p className="section-subtitle" style={{ color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {t('benefitsSubtitle')}
            </p>
            <h2 className="section-title" style={{ fontSize: '2.2rem' }}>{t('benefitsTitle')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'var(--bg-app)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <HeartHandshake size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('benefit1Title')}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.6 }}>{t('benefit1Desc')}</p>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('benefit2Title')}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.6 }}>{t('benefit2Desc')}</p>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#e0f2fe', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CloudSun size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('benefit3Title')}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.6 }}>{t('benefit3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Cards Section */}
      <section className="section-py" style={{ background: 'var(--bg-app)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <p className="section-subtitle" style={{ color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {t('featuresSubtitle')}
            </p>
            <h2 className="section-title" style={{ fontSize: '2.2rem' }}>{t('featuresTitle')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {/* Feature 1: Crop & Area Data */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <TrendingUp size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>{t('feat1Title')}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('feat1Desc')}
                </p>
              </div>
              <Link to="/crop-area-data" className="btn btn-sm btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('cropAreaData')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 2: AI Crop Disease Detection */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Activity size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>{t('feat2Title')}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('feat2Desc')}
                </p>
              </div>
              <Link to="/disease-detection" className="btn btn-sm btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('diseaseDetection')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 3: Krushi Seva Kendra */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Store size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>{t('feat3Title')}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('feat3Desc')}
                </p>
              </div>
              <Link to="/krushi-seva-kendra" className="btn btn-sm btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('krushiSevaKendra')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 4: Marketplace */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <ShoppingBasket size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>{t('feat4Title')}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('feat4Desc')}
                </p>
              </div>
              <Link to="/marketplace" className="btn btn-sm btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('marketplace')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Agricultural Quotes Banner - Separate Cards */}
      <section className="container" style={{ margin: '3rem auto' }}>
        <div className="quote-banner-grid">
          {/* Separate Box 1: Text Quotes */}
          <div className="quote-card-text">
            <Quote size={36} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
            <div className="quote-item">
              <h3>{t('agriQuote1')}</h3>
              <p>— {t('agriQuote1Author')}</p>
            </div>
            <div className="quote-divider"></div>
            <div className="quote-item">
              <h4>{t('agriQuote2')}</h4>
              <p>— {t('agriQuote2Author')}</p>
            </div>
          </div>

          {/* Separate Box 2: Farmer Image */}
          <div className="quote-card-image">
            <img 
              src="/farmer-tech.jpg" 
              alt="Farmer using smartphone in crop field" 
              className="quote-banner-image"
            />
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="section-py" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <p className="section-subtitle" style={{ color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {t('testimonialsSubtitle')}
            </p>
            <h2 className="section-title" style={{ fontSize: '2.2rem' }}>{t('testimonialsTitle')}</h2>
          </div>

          <div className="testimonials-grid">
            {/* Farmer Testimonial 1 */}
            <div className="testimonial-card">
              <p className="testimonial-text">{t('farmerTestimonial1')}</p>
              <div className="testimonial-author">
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  RP
                </div>
                <div>
                  <div style={{ color: 'var(--text-main)' }}>{t('farmerTestimonial1Author')}</div>
                  <span className="badge badge-farmer" style={{ fontSize: '0.7rem' }}>Verified Grower</span>
                </div>
              </div>
            </div>

            {/* Farmer Testimonial 2 */}
            <div className="testimonial-card">
              <p className="testimonial-text">{t('farmerTestimonial2')}</p>
              <div className="testimonial-author">
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  BS
                </div>
                <div>
                  <div style={{ color: 'var(--text-main)' }}>{t('farmerTestimonial2Author')}</div>
                  <span className="badge badge-farmer" style={{ fontSize: '0.7rem' }}>Grape Exporter</span>
                </div>
              </div>
            </div>

            {/* Customer Testimonial 1 */}
            <div className="testimonial-card">
              <p className="testimonial-text">{t('customerTestimonial1')}</p>
              <div className="testimonial-author">
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: '#e0f2fe', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  SD
                </div>
                <div>
                  <div style={{ color: 'var(--text-main)' }}>{t('customerTestimonial1Author')}</div>
                  <span className="badge badge-customer" style={{ fontSize: '0.7rem' }}>Consumer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Impact Section */}
      <section className="section-py" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem', border: '1px solid #bbf7d0' }}>
              <TrendingUp size={16} />
              <span>Agrarian Transformation Metrics</span>
            </div>
            <h2 className="section-title" style={{ fontSize: '2.2rem' }}>Our Agricultural Impact</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-body)', lineHeight: 1.6, marginTop: '0.75rem' }}>
              KrushiSevak is committed to empowering smallholder farmers, reviving soil ecosystems, eliminating predatory middleman commissions, and digitizing rural agricultural commerce.
            </p>
          </div>

          <div className="area-kpi-grid" style={{ textAlign: 'left' }}>
            <div className="area-kpi-card">
              <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Users size={28} />
              </div>
              <div>
                <div className="kpi-val">12,500+</div>
                <div className="kpi-lbl">Farmers Supported</div>
              </div>
            </div>

            <div className="area-kpi-card">
              <div className="kpi-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Sprout size={28} />
              </div>
              <div>
                <div className="kpi-val">28,000+</div>
                <div className="kpi-lbl">Acres Monitored</div>
              </div>
            </div>

            <div className="area-kpi-card">
              <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Award size={28} />
              </div>
              <div>
                <div className="kpi-val">+32%</div>
                <div className="kpi-lbl">Average Income Surge</div>
              </div>
            </div>

            <div className="area-kpi-card">
              <div className="kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0288d1' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="kpi-val">99.4%</div>
                <div className="kpi-lbl">Verified Fair Trade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Roles Ecosystem Section */}
      <section id="roles" className="section-py" style={{ background: 'var(--bg-app)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <p className="section-subtitle">{t('ecosystemSubtitle')}</p>
            <h2 className="section-title">{t('ecosystemTitle')}</h2>
          </div>

          <div className="roles-grid">
            {/* Farmer Card */}
            <div className="role-card farmer">
              <div className="role-icon-box">
                <Sprout size={28} />
              </div>
              <span className="badge badge-farmer" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
                {t('farmer')}
              </span>
              <h3>{t('farmer')}</h3>
              <p>{t('farmerDesc')}</p>

              <ul className="role-card-features">
                {[t('feat1Title'), t('feat2Title'), t('feat3Title')].map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register?role=farmer" className="btn btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('register')} - {t('farmer')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Customer Card */}
            <div className="role-card customer">
              <div className="role-icon-box">
                <ShoppingBasket size={28} />
              </div>
              <span className="badge badge-customer" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
                {t('customer')}
              </span>
              <h3>{t('customer')}</h3>
              <p>{t('customerDesc')}</p>

              <ul className="role-card-features">
                {[t('feat4Title'), t('benefit1Title'), t('feat1Title')].map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register?role=customer" className="btn btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('register')} - {t('customer')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Store Owner Card */}
            <div className="role-card storeOwner">
              <div className="role-icon-box">
                <Store size={28} />
              </div>
              <span className="badge badge-storeOwner" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
                {t('storeOwner')}
              </span>
              <h3>{t('storeOwner')}</h3>
              <p>{t('storeOwnerDesc')}</p>

              <ul className="role-card-features">
                {[t('feat3Title'), t('benefit3Title'), t('benefit1Title')].map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register?role=storeOwner" className="btn btn-outline" style={{ marginTop: 'auto' }}>
                <span>{t('register')} - {t('storeOwner')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
