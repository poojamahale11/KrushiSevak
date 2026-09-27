import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sprout, Globe, LogOut, LayoutDashboard, Menu, X, Store, ShoppingBag, TrendingUp, Info, Sparkles, Bell } from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const role = user?.role;

  const navItems = useMemo(() => {
    // Not authenticated - show public pages
    if (!isAuthenticated) return [
      { to: '/', label: t('home') },
      { to: '/crop-area-data', label: t('cropAreaData') },
      { to: '/disease-detection', label: t('diseaseDetection') },
      { to: '/krushi-seva-kendra', label: t('krushiSevaKendra') },
      { to: '/marketplace', label: t('marketplace') },
      { to: '/agri-assistant', label: 'AI Assistant', icon: Sparkles },
      { to: '/about', label: t('about') },
    ];
    
    // Customer - Home | Crop & Area | Marketplace | AI Assistant only
    if (role === 'customer') return [
      { to: '/', label: t('home') },
      { to: '/crop-area-data', label: t('cropAreaData'), icon: TrendingUp },
      { to: '/marketplace', label: t('marketplace'), icon: ShoppingBag },
      { to: '/agri-assistant', label: 'AI Assistant', icon: Sparkles },
    ];
    
    // Store Owner - limited navigation
    if (role === 'storeOwner') return [
      { to: '/', label: t('home') },
      { to: '/krushi-seva-kendra', label: t('krushiSevaKendra') },
      { to: '/agri-assistant', label: 'AI Assistant', icon: Sparkles },
      { to: '/about', label: t('about') },
    ];
    
    // Farmer - full navigation
    return [
      { to: '/', label: t('home') },
      { to: '/crop-area-data', label: t('cropAreaData'), icon: TrendingUp },
      { to: '/disease-detection', label: t('diseaseDetection') },
      { to: '/krushi-seva-kendra', label: t('krushiSevaKendra'), icon: Store },
      { to: '/marketplace', label: t('marketplace'), icon: ShoppingBag },
      { to: '/agri-assistant', label: 'AI Assistant', icon: Sparkles },
      { to: '/about', label: t('about') },
    ];
  }, [isAuthenticated, role, t]);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return undefined; }
    let active = true;
    const load = async () => { try { const r = await api.getNotifications(); if (active) setUnreadCount(r.unreadCount || 0); } catch (_) {} };
    load(); const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [isAuthenticated]);

  const close = () => setMobileMenuOpen(false);
  const handleLogout = () => { logout(); close(); navigate('/login'); };

  const renderLink = (item, mobile = false) => {
    const Icon = item.icon;
    return <NavLink key={item.to} to={item.to} onClick={close} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={mobile ? { fontWeight: 650, padding: '0.65rem 0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' } : { padding: '0.5rem 0.6rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
      {Icon && <Icon size={14} />}{item.label}
    </NavLink>;
  };

  return <nav className="navbar professional-navbar">
    <div className="container navbar-inner">
      <Link to="/" className="brand-logo" onClick={close}>
        <div className="brand-icon-wrap"><Sprout size={22} /></div>
        <div className="brand-text"><span className="brand-name">{t('brandName')}</span><span className="brand-subtitle">AGRI-INTELLIGENCE</span></div>
      </Link>
      <div className="nav-links">{navItems.map(item => renderLink(item))}</div>
      <div className="nav-actions">
        <div className="lang-selector"><Globe size={15} /><select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language"><option value="en">EN</option><option value="hi">हि</option><option value="mr">मर</option></select></div>
        {isAuthenticated ? <>
          <Link to="/notifications" className="nav-icon-button" title="Notifications"><Bell size={18} />{unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}</Link>
          <Link to={getRoleDashboardPath(role)} className="btn btn-sm btn-primary nav-dashboard"><LayoutDashboard size={15} /><span>{t('dashboard')}</span></Link>
          <button onClick={handleLogout} className="btn btn-sm btn-danger-outline nav-logout"><LogOut size={15} /><span>{t('logout')}</span></button>
        </> : <><Link to="/login" className="btn btn-sm btn-outline">{t('login')}</Link><Link to="/register" className="btn btn-sm btn-primary">{t('register')}</Link></>}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">{mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
    {mobileMenuOpen && <div className="mobile-drawer"><div className="mobile-nav-list">{navItems.map(item => renderLink(item, true))}</div><div className="mobile-divider" />{isAuthenticated ? <><Link to="/notifications" onClick={close} className="btn btn-outline mobile-action"><Bell size={16}/> Notifications {unreadCount ? `(${unreadCount})` : ''}</Link><Link to={getRoleDashboardPath(role)} onClick={close} className="btn btn-primary mobile-action"><LayoutDashboard size={16}/> {t('dashboard')}</Link><button onClick={handleLogout} className="btn btn-danger-outline mobile-action"><LogOut size={16}/> {t('logout')}</button></> : <div className="mobile-auth"><Link to="/login" onClick={close} className="btn btn-outline">{t('login')}</Link><Link to="/register" onClick={close} className="btn btn-primary">{t('register')}</Link></div>}</div>}
  </nav>;
};
