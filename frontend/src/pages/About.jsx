import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Globe, ArrowRight, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const About = () => {
  const { t } = useLanguage();

  return (
    <div className="about-page-container">
      <div className="container">
        <div className="about-hero-card">
          <div style={{ textAlign: 'center' }}>
            <div className="about-hero-badge">
              <Sprout size={18} />
              <span>Mission & Vision</span>
            </div>

            <h1 className="about-hero-title">About {t('brandName')}</h1>
            <p className="about-hero-subtitle">
              KrushiSevak was founded with a singular conviction: to empower Indian farmers through modern technology, transparent pricing, scientific crop diagnostics, and frictionless marketplace connectivity.
            </p>
          </div>

          <div className="about-stats-grid">
            <div className="about-stat-box">
              <div className="about-stat-number">10,000+</div>
              <div className="about-stat-label">Farmers Empowered</div>
            </div>
            <div className="about-stat-box">
              <div className="about-stat-number">500+</div>
              <div className="about-stat-label">Verified Kendras</div>
            </div>
            <div className="about-stat-box">
              <div className="about-stat-number">3</div>
              <div className="about-stat-label">Languages (EN, HI, MR)</div>
            </div>
            <div className="about-stat-box">
              <div className="about-stat-number">100%</div>
              <div className="about-stat-label">Direct Connection</div>
            </div>
          </div>

          <div className="about-cards-grid">
            <div className="about-card">
              <div className="about-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Sprout size={26} />
              </div>
              <h3 className="about-card-title">Our Mission</h3>
              <p className="about-card-desc">
                To create a unified digital ecosystem that guarantees farmers get maximum value for their harvest, access to genuine agricultural inputs, and actionable meteorological intelligence.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper" style={{ background: '#e0f2fe', color: '#0288d1' }}>
                <Globe size={26} />
              </div>
              <h3 className="about-card-title">Trilingual Accessibility</h3>
              <p className="about-card-desc">
                Engineered natively in English, हिन्दी (Hindi), and मराठी (Marathi) to ensure zero linguistic barriers for rural agrarian communities across Maharashtra and India.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 className="about-card-title">Trust & Verification</h3>
              <p className="about-card-desc">
                Every farmer profile, Krushi Seva Kendra license, and harvest batch is authenticated to foster complete trust between producers, vendors, and consumers.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <Cpu size={26} />
              </div>
              <h3 className="about-card-title">AI & Smart Agronomy</h3>
              <p className="about-card-desc">
                Powered by state-of-the-art computer vision and machine learning for rapid crop disease identification, automated treatment recommendations, and localized yield analysis.
              </p>
            </div>
          </div>

          <div className="about-cta-section">
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Join the KrushiSevak Network</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/marketplace" className="btn btn-outline btn-lg">
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


