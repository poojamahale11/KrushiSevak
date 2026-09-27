import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Globe, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const About = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '3rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="container">
        <div className="placeholder-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
            <Sprout size={16} />
            <span>Mission & Vision</span>
          </div>

          <h1>About {t('brandName')}</h1>
          <p>
            KrushiSevak was founded with a singular conviction: to empower Indian farmers through modern technology, transparent pricing, scientific crop diagnostics, and frictionless marketplace connectivity.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2.5rem', textAlign: 'left' }}>
            <div className="dash-card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Sprout size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Our Mission</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                To create a unified digital ecosystem that guarantees farmers get maximum value for their harvest, access to genuine agricultural inputs, and actionable meteorological intelligence.
              </p>
            </div>

            <div className="dash-card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#e0f2fe', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Trilingual Accessibility</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Engineered natively in English, हिन्दी (Hindi), and मराठी (Marathi) to ensure zero linguistic barriers for rural agrarian communities across Maharashtra and India.
              </p>
            </div>

            <div className="dash-card">
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Trust & Verification</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Every farmer profile, Krushi Seva Kendra license, and harvest batch is authenticated to foster complete trust between producers, vendors, and consumers.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Join the KrushiSevak Network</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
