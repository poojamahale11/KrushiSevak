import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Sprout, Heart, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Impact = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '3rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="container">
        <div className="placeholder-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
            <TrendingUp size={16} />
            <span>Agrarian Transformation Metrics</span>
          </div>

          <h1>Our Agricultural Impact</h1>
          <p>
            KrushiSevak is committed to empowering smallholder farmers, reviving soil ecosystems, eliminating predatory middleman commissions, and digitizing rural agricultural commerce.
          </p>

          <div className="area-kpi-grid" style={{ marginTop: '2.5rem', textAlign: 'left' }}>
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

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/register?role=farmer" className="btn btn-primary btn-lg">
              <span>Join as a Farmer Member</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
