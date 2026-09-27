import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '3rem 1rem' }}>
      <div className="brand-icon-wrap" style={{ width: '64px', height: '64px', marginBottom: '1.5rem' }}>
        <Sprout size={36} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-600)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '450px', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        <Home size={18} />
        <span>Return to {t('home')}</span>
      </Link>
    </div>
  );
};
