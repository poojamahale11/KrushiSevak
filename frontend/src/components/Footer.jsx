import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, Instagram, MessageCircle, Facebook, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Brand & About */}
          <div>
            <div className="footer-brand">
              <div className="brand-icon-wrap" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2d6a4f, #1b4332)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={20} style={{ color: '#fff' }} />
              </div>
              <span>{t('brandName')}</span>
            </div>
            <p className="footer-desc">
              {t('heroDesc')}
            </p>
            <div className="social-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                title="WhatsApp Agri Helpdesk"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                title="Facebook"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="footer-heading">Platform Links</h4>
            <ul className="footer-links">
              <li><Link to="/">{t('home')}</Link></li>
              <li><Link to="/crop-area-data">{t('cropAreaData')}</Link></li>
              <li><Link to="/disease-detection">{t('diseaseDetection')}</Link></li>
              <li><Link to="/krushi-seva-kendra">{t('krushiSevaKendra')}</Link></li>
              <li><Link to="/marketplace">{t('marketplace')}</Link></li>
            </ul>
          </div>

          {/* Community & Info */}
          <div>
            <h4 className="footer-heading">Ecosystem</h4>
            <ul className="footer-links">
              <li><Link to="/impact">{t('impact')}</Link></li>
              <li><Link to="/about">{t('about')}</Link></li>
              <li><Link to="/register?role=farmer">{t('farmer')} Registration</Link></li>
              <li><Link to="/register?role=storeOwner">{t('storeOwner')} Onboarding</Link></li>
              <li><Link to="/login">{t('login')}</Link></li>
            </ul>
          </div>

          {/* Agri Support */}
          <div>
            <h4 className="footer-heading">Krushi Helpline</h4>
            <ul className="footer-links" style={{ color: '#a3c2b1', fontSize: '0.88rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                <span>Kisan Toll-Free: 1800-180-1551</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                <span>support@krushisevak.in</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                <span>Maharashtra Agri-Hub, Pune - 411005</span>
              </li>
              <li style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86efac', fontSize: '0.82rem' }}>
                <ShieldCheck size={16} />
                <span>100% Verified Farmer Network</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {t('brandName')} Agro-Met Intelligence. {t('allRightsReserved')}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
            <span>{t('phase2Badge')}</span>
            <span>•</span>
            <span>English / हिन्दी / मराठी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
