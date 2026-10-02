import React, { useState } from 'react';
import { Sprout, MapPin, ImageIcon, X } from 'lucide-react';

export const CreateListingModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [listingForm, setListingForm] = useState({
    cropName: '',
    category: 'Vegetable',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    quality: '',
    harvestDate: '',
    expiryDate: '',
    description: ''
  });

  const [listingImages, setListingImages] = useState([]);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length < 5) {
      setError('Please select at least 5 images');
      return;
    }
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setError('');
    setListingImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!listingForm.cropName || !listingForm.quantity || !listingForm.pricePerUnit) {
      setError('Please fill in all required fields: Crop name, Quantity, and Price');
      return;
    }

    // Optional image check (upload at least 1 if available)
    if (listingImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    try {
      await onSubmit(listingForm, listingImages);
      // Reset form
      setListingForm({
        cropName: '',
        category: 'Vegetable',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        quality: '',
        harvestDate: '',
        expiryDate: '',
        description: ''
      });
      setListingImages([]);
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    }
  };

  if (!isOpen) return null;

  // Calculate minimum expiry date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minExpiryDate = tomorrow.toISOString().split('T')[0];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.5)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <form 
        onSubmit={handleSubmit}
        className="dash-card"
        style={{
          width: 'min(720px,100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#fff'
        }}
      >
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>🌾 Sell Your Crop</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => {
              onClose();
              setListingImages([]);
              setError('');
            }}
            style={{ fontSize: '1.5rem', padding: '0.25rem 0.75rem' }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c00',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Fill in all details and upload minimum 5 images. Your GPS location will be attached automatically.
        </p>

        <div className="form-grid" style={{ gap: '1rem' }}>
          {/* Crop Name */}
          <div className="form-group">
            <label className="form-label">Crop Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Tomatoes"
              required
              value={listingForm.cropName}
              onChange={e => setListingForm({ ...listingForm, cropName: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-input"
              value={listingForm.category}
              onChange={e => setListingForm({ ...listingForm, category: e.target.value })}
            >
              <option>Vegetable</option>
              <option>Fruit</option>
              <option>Grain</option>
              <option>Pulses</option>
              <option>Cash Crop</option>
              <option>Other</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              className="form-input"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 500"
              required
              value={listingForm.quantity}
              onChange={e => setListingForm({ ...listingForm, quantity: e.target.value })}
            />
          </div>

          {/* Unit */}
          <div className="form-group">
            <label className="form-label">Unit *</label>
            <select
              className="form-input"
              value={listingForm.unit}
              onChange={e => setListingForm({ ...listingForm, unit: e.target.value })}
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
              <option value="bag">bag</option>
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">Price per unit (₹) *</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 50"
              required
              value={listingForm.pricePerUnit}
              onChange={e => setListingForm({ ...listingForm, pricePerUnit: e.target.value })}
            />
          </div>

          {/* Quality */}
          <div className="form-group">
            <label className="form-label">Quality / Grade</label>
            <input
              className="form-input"
              placeholder="e.g. A Grade"
              value={listingForm.quality}
              onChange={e => setListingForm({ ...listingForm, quality: e.target.value })}
            />
          </div>

          {/* Harvest Date */}
          <div className="form-group">
            <label className="form-label">Harvest Date</label>
            <input
              className="form-input"
              type="date"
              value={listingForm.harvestDate}
              onChange={e => setListingForm({ ...listingForm, harvestDate: e.target.value })}
            />
          </div>

          {/* Expiry Date */}
          <div className="form-group">
            <label className="form-label">Listing Expiry Date *</label>
            <input
              className="form-input"
              type="date"
              required
              min={minExpiryDate}
              value={listingForm.expiryDate}
              onChange={e => setListingForm({ ...listingForm, expiryDate: e.target.value })}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              When should this listing expire?
            </small>
          </div>

          {/* Images Upload */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Crop Images (5 required) *</label>
            <input
              className="form-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              required
              onChange={handleImageChange}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Select exactly 5 images (JPG/PNG/WEBP, max 7 MB each)
              {listingImages.length > 0 && ` - ${listingImages.length} image(s) selected ✓`}
            </small>
          </div>

          {/* Description */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Mention size, quality, freshness, packaging, pickup details..."
              value={listingForm.description}
              onChange={e => setListingForm({ ...listingForm, description: e.target.value })}
            />
          </div>
        </div>

        {/* Image Preview */}
        {listingImages.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
            <p style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: '.5rem' }}>
              Selected Images ({listingImages.length}/5):
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '.5rem'
            }}>
              {listingImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '.3rem',
                    padding: '.5rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <ImageIcon size={16} style={{ color: 'var(--primary-500)' }} />
                  <span style={{
                    fontSize: '.7rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxWidth: '100px'
                  }}>
                    {img.name.length > 15 ? img.name.substring(0, 15) + '...' : img.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '.75rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '.78rem',
            color: user?.location ? '#166534' : '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '.3rem'
          }}>
            <MapPin size={14} />
            {user?.location ? '✓ GPS location ready' : '⚠ Save GPS location first'}
          </span>
          <button
            className="btn btn-primary"
            type="submit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
          >
            <Sprout size={16} />
            Publish for Customers
          </button>
        </div>
      </form>
    </div>
  );
};
