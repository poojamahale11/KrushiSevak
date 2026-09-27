import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  PackageCheck,
  PackageX,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Save,
  X,
  AlertCircle,
  TrendingUp,
  Tag,
  DollarSign,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const StoreOwnerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  // Inventory state
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    inStockCount: 0,
    totalInventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [storeOrders, setStoreOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');

  // Forms
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobile: '',
    shopName: '',
    shopAddress: '',
    shopContact: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Seeds',
    price: '',
    stockQuantity: '',
    unit: 'bag',
    isOutOfStock: false,
    brand: '',
    description: '',
    imageUrl: '',
    expiryDate: '',
    batchNumber: '',
  });

  const loadStoreOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.getStoreOrders();
      if (res.success) setStoreOrders(res.orders || []);
    } catch (err) { console.error('Store orders load error:', err); }
    finally { setOrdersLoading(false); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      const res = await api.updateStoreOrderStatus(orderId, status);
      if (res.success) { setSuccessMsg('Order status updated successfully.'); loadStoreOrders(); }
    } catch (err) { setError(err.message || 'Failed to update order status.'); }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getMyInventory();
      if (res.success) {
        setProducts(res.products || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Inventory load error:', err);
      setError(err.message || 'Failed to load store inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile: user.mobile || '',
        shopName: user.shopName || '',
        shopAddress: user.shopAddress || '',
        shopContact: user.shopContact || '',
      });
      loadInventory();
      loadStoreOrders();
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
        setSuccessMsg('Shop details updated in MongoDB!');
        setProfileModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to update shop profile.');
    }
  };

  // Handle Add/Edit Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (editingProduct) {
        // Edit product
        const res = await api.updateProduct(editingProduct._id, productForm);
        if (res.success && res.product) {
          if (productImageFile) await api.uploadProductImage(editingProduct._id, productImageFile);
          setSuccessMsg('Product updated successfully!');
          loadInventory();
        }
      } else {
        // Add new product
        const res = await api.addProduct(productForm);
        if (res.success && res.product) {
          if (productImageFile) await api.uploadProductImage(res.product._id, productImageFile);
          setSuccessMsg('New product added to inventory!');
          loadInventory();
        }
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      setProductImageFile(null);
      setProductImagePreview('');
      resetProductForm();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    }
  };

  // Quick Stock Adjustment
  const handleQuickStockUpdate = async (productId, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      const res = await api.updateStock(productId, {
        stockQuantity: newQty,
        isOutOfStock: newQty === 0,
      });
      if (res.success) {
        loadInventory();
      }
    } catch (err) {
      setError(err.message || 'Failed to update stock.');
    }
  };

  // Toggle Out-of-Stock Status
  const handleToggleOutOfStock = async (product) => {
    try {
      const nextStatus = !product.isOutOfStock;
      const res = await api.updateStock(product._id, {
        isOutOfStock: nextStatus,
        stockQuantity: nextStatus ? 0 : product.stockQuantity || 10,
      });
      if (res.success) {
        loadInventory();
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product from inventory?')) return;
    try {
      const res = await api.deleteProduct(productId);
      if (res.success) {
        setSuccessMsg('Product removed from inventory.');
        loadInventory();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductImageFile(null);
    setProductImagePreview('');
    resetProductForm();
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductImageFile(null);
    setProductImagePreview(product.imageUrl || '');
    setProductForm({
      name: product.name || '',
      category: product.category || 'Seeds',
      price: product.price || '',
      stockQuantity: product.stockQuantity || '',
      unit: product.unit || 'bag',
      isOutOfStock: product.isOutOfStock || false,
      brand: product.brand || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      expiryDate: product.expiryDate ? String(product.expiryDate).slice(0, 10) : '',
      batchNumber: product.batchNumber || '',
    });
    setProductModalOpen(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: 'Seeds',
      price: '',
      stockQuantity: '',
      unit: 'bag',
      isOutOfStock: false,
      brand: '',
      description: '',
      imageUrl: '',
      expiryDate: '',
      batchNumber: '',
    });
  };

  const categories = [
    'Seeds',
    'Fertilizers',
    'Pesticides',
    'Urea',
    'Other agricultural products',
    'Equipment & Tools',
  ];

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

        {/* Store Owner Header */}
        <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #d97706, #92400e)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.18)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', marginBottom: '0.85rem' }}>
            <Store size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t('storeOwnerDashboardTitle')}</span>
          </div>
          <h1>{t('welcome')}, {user?.name}! 🏪</h1>
          <p>{t('storeOwnerDashboardDesc')}</p>

          <div className="dashboard-meta">
            <div className="meta-item">
              <Store size={16} />
              <span>{user?.shopName || 'Agri Seva Kendra'}</span>
            </div>
            <div className="meta-item">
              <Phone size={16} />
              <span>{user?.shopContact || user?.mobile || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <Calendar size={16} />
              <span>{t('memberSince')}: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="inventory-stats-grid">
          <div className="inv-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Boxes size={24} style={{ color: '#d97706' }} />
              <span className="stock-badge in-stock">Active</span>
            </div>
            <div className="stat-num">{summary.totalProducts}</div>
            <div className="stat-desc">{t('totalProducts')}</div>
          </div>

          <div className="inv-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <PackageCheck size={24} style={{ color: '#16a34a' }} />
              <span className="stock-badge in-stock">Available</span>
            </div>
            <div className="stat-num">{summary.inStockCount}</div>
            <div className="stat-desc">In-Stock Catalog Items</div>
          </div>

          <div className="inv-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <AlertTriangle size={24} style={{ color: '#ea580c' }} />
              <span className="stock-badge low-stock">≤ 10 Units</span>
            </div>
            <div className="stat-num">{summary.lowStockCount}</div>
            <div className="stat-desc">{t('lowStock')}</div>
          </div>

          <div className="inv-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <PackageX size={24} style={{ color: '#dc2626' }} />
              <span className="stock-badge out-of-stock">Zero Stock</span>
            </div>
            <div className="stat-num">{summary.outOfStockCount}</div>
            <div className="stat-desc">{t('outOfStock')}</div>
          </div>

          <div className="inv-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <DollarSign size={24} style={{ color: '#2d6a4f' }} />
              <span className="stock-badge in-stock">Valuation</span>
            </div>
            <div className="stat-num">₹{summary.totalInventoryValue.toLocaleString('en-IN')}</div>
            <div className="stat-desc">{t('inventoryValue')}</div>
          </div>
        </div>

        {/* Store Profile Card */}
        <div className="dash-card" style={{ marginBottom: '2rem' }}>
          <div className="dash-card-header">
            <h3>
              <Store size={20} style={{ color: '#d97706' }} />
              <span>{t('storeDetails')}</span>
            </h3>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="btn btn-sm btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Edit2 size={14} />
              <span>{t('editProfile')}</span>
            </button>
          </div>

          <div className="info-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span className="info-label">{t('shopName')}</span>
              <span className="info-value" style={{ display: 'block', textAlign: 'left', marginTop: '0.2rem', fontSize: '1rem', color: '#b45309' }}>
                {user?.shopName || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="info-label">{t('shopContact')}</span>
              <span className="info-value" style={{ display: 'block', textAlign: 'left', marginTop: '0.2rem' }}>
                {user?.shopContact || user?.mobile || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="info-label">{t('shopAddress')}</span>
              <span className="info-value" style={{ display: 'block', textAlign: 'left', marginTop: '0.2rem' }}>
                {user?.shopAddress || user?.address || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="info-label">Verification Status</span>
              <span className="info-value" style={{ display: 'block', textAlign: 'left', marginTop: '0.2rem', color: '#16a34a' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Licensed Krushi Kendra
              </span>
            </div>
          </div>
        </div>

        {/* Product Inventory Management Table */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Boxes size={24} style={{ color: '#d97706' }} />
                <span>{t('myInventory')}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>({products.length})</span>
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Manage Seeds, Fertilizers, Pesticides, Urea, and Equipment with live stock toggles.
              </p>
            </div>

            <button onClick={openAddProductModal} className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} />
              <span>{t('addProduct')}</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="dash-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Boxes size={48} style={{ color: '#fde68a', margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Products in Inventory</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('noProductsYet')}</p>
              <button onClick={openAddProductModal} className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                <Plus size={16} />
                <span>{t('addProduct')}</span>
              </button>
            </div>
          ) : (
            <div className="products-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>{t('productName')}</th>
                    <th>{t('productCategory')}</th>
                    <th>{t('price')}</th>
                    <th>Expiry</th>
                    <th>{t('stockQuantity')}</th>
                    <th>Status</th>
                    <th>Quick Stock Adjustment</th>
                    <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id}>
                      <td>
                        <strong style={{ display: 'block', color: 'var(--text-main)' }}>{prod.name}</strong>
                        {prod.brand && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Brand: {prod.brand}</span>}
                      </td>
                      <td>
                        <span className="crop-category-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                          {prod.category}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>₹{prod.price}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}> / {prod.unit}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{prod.expiryDate ? new Date(prod.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{prod.stockQuantity}</span> {prod.unit}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleOutOfStock(prod)}
                          className={`stock-badge ${
                            prod.isOutOfStock || prod.stockQuantity === 0 ? 'out-of-stock' : prod.stockQuantity <= 10 ? 'low-stock' : 'in-stock'
                          }`}
                          style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                          title="Click to toggle In-Stock / Out-of-Stock"
                        >
                          {prod.isOutOfStock || prod.stockQuantity === 0 ? t('outOfStock') : t('inStock')}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleQuickStockUpdate(prod._id, prod.stockQuantity, -5)}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            title="Decrease 5 units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(prod._id, prod.stockQuantity, 5)}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            title="Add 5 units"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(prod._id, prod.stockQuantity, 25)}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            title="Add 25 units"
                          >
                            +25
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title={t('edit')}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="btn btn-sm btn-danger-outline"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title={t('delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Store Owner Quick Links - only relevant Kendra tools */}
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Kendra Tools</h3>
          <div className="quick-cards-grid">
            <Link to="/krushi-seva-kendra" className="quick-action-card">
              <div className="card-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Store size={24} /></div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '.35rem' }}>Public Kendra Profile</h4>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Preview your registered Kendra and see how your live product availability appears to farmers.</p>
              <span style={{ marginTop:'auto', paddingTop:'.75rem', fontSize:'.82rem', color:'#d97706', fontWeight:700 }}>View Kendra Directory →</span>
            </Link>
            <Link to="/agri-assistant" className="quick-action-card">
              <div className="card-icon" style={{ background: '#f0fdf4', color: '#2d6a4f' }}><Sparkles size={24} /></div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '.35rem' }}>Krushi AI Assistant</h4>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Ask agriculture questions using text, voice or an image and get guidance in your selected language.</p>
              <span style={{ marginTop:'auto', paddingTop:'.75rem', fontSize:'.82rem', color:'#2d6a4f', fontWeight:700 }}>Open AI Assistant →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Edit Shop Profile Modal */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Store size={20} style={{ color: '#d97706' }} />
                <span>{t('storeDetails')}</span>
              </h3>
              <button onClick={() => setProfileModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">{t('shopName')} *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.shopName}
                    onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proprietor Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('shopContact')} *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={profileForm.shopContact}
                    onChange={(e) => setProfileForm({ ...profileForm, shopContact: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">{t('shopAddress')} *</label>
                  <textarea
                    rows={2}
                    required
                    className="form-input"
                    value={profileForm.shopAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, shopAddress: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setProfileModalOpen(false)} className="btn btn-outline">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Save size={16} />
                  <span>{t('save')} Shop Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="modal-overlay" onClick={() => setProductModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Boxes size={20} style={{ color: '#d97706' }} />
                <span>{editingProduct ? t('editProduct') : t('addProduct')}</span>
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label">{t('productName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahyco Hybrid Cotton Seeds, Neem Coated Urea"
                    className="form-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('productCategory')} *</label>
                  <select
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('brand')}</label>
                  <input
                    type="text"
                    placeholder="e.g. IFFCO, Mahyco, Bayer"
                    className="form-input"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('price')} (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 850"
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('stockQuantity')} *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 50"
                    className="form-input"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('unit')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bag, kg, packet, bottle, unit"
                    className="form-input"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.75rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={productForm.isOutOfStock}
                      onChange={(e) => setProductForm({ ...productForm, isOutOfStock: e.target.checked })}
                    />
                    <span>Mark as Out of Stock</span>
                  </label>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Product Photo</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="form-input" onChange={(e) => { const f=e.target.files?.[0]; if(!f)return; if(f.size>7*1024*1024){alert('Image must be under 7 MB.');return;} setProductImageFile(f); setProductImagePreview(URL.createObjectURL(f)); }} />
                  {productImagePreview && <img src={productImagePreview} alt="Product preview" style={{ width:110, height:80, objectFit:'cover', borderRadius:10, marginTop:8 }} />}
                  <small style={{ color:'var(--text-muted)' }}>Upload JPG, PNG or WEBP. If no photo is uploaded, the Kendra directory uses a category image.</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-input" value={productForm.expiryDate} onChange={(e) => setProductForm({ ...productForm, expiryDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch / Lot Number</label>
                  <input type="text" className="form-input" placeholder="e.g. BTH-2026-04" value={productForm.batchNumber} onChange={(e) => setProductForm({ ...productForm, batchNumber: e.target.value })} />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">{t('description')}</label>
                  <textarea
                    rows={2}
                    placeholder="Product specifications, usage dosage, govt subsidy details"
                    className="form-input"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setProductModalOpen(false)} className="btn btn-outline">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Save size={16} />
                  <span>{editingProduct ? t('save') : t('add')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
