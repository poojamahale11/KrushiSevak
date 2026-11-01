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
    if (!files.length) return;
    setError('');
    setListingImages(prev => {
      const combined = [...prev, ...files];
      if (combined.length > 5) {
        setError('Maximum 5 images allowed per listing. Keeping the first 5.');
        return combined.slice(0, 5);
      }
      return combined;
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setListingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!listingForm.cropName || !listingForm.quantity || !listingForm.pricePerUnit) {
      setError('Please fill in all required fields: Crop name, Quantity, and Price');
      return;
    }

    if (listingImages.length < 1) {
      setError('Please upload at least 1 crop photo (maximum 5 allowed).');
      return;
    }

    if (listingImages.length > 5) {
      setError('Maximum 5 crop images allowed per listing.');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                Crop Quality Photos (1 to 5 Photos, min 1 required) *
              </label>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                background: (listingImages.length >= 1 && listingImages.length <= 5) ? '#dcfce7' : '#fef3c7',
                color: (listingImages.length >= 1 && listingImages.length <= 5) ? '#166534' : '#92400e',
                border: `1px solid ${(listingImages.length >= 1 && listingImages.length <= 5) ? '#86efac' : '#fde68a'}`
              }}>
                {listingImages.length === 0
                  ? '⚠️ Photo required (0/5)'
                  : listingImages.length <= 5
                    ? `✓ ${listingImages.length}/5 photos selected`
                    : `⚠️ Max 5 allowed (${listingImages.length}/5)`}
              </span>
            </div>
            <input
              className="form-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
              Select 1 to 5 clear photos of your harvest (close-ups, batch volume, quality grade, packaging). Minimum 1 photo required.
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

        {/* Image Preview Grid */}
        {listingImages.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <p style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Selected Crop Photos ({listingImages.length}):
              </p>
              {listingImages.length < 5 && (
                <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                  Please add {5 - listingImages.length} more photo{5 - listingImages.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '.6rem'
            }}>
              {listingImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '.5rem',
                    background: '#fff',
                    borderRadius: '8px',
                    border: idx === 0 ? '2px solid #16a34a' : '1px solid #e5e7eb'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: idx === 0 ? '#16a34a' : '#475569',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '0.1rem 0.35rem'
                  }}>
                    {idx === 0 ? 'Primary' : `#${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 800
                    }}
                    title="Remove photo"
                  >
                    ×
                  </button>
                  <div style={{ margin: '1.2rem 0 0.3rem', color: 'var(--primary-600)' }}>
                    <ImageIcon size={22} />
                  </div>
                  <span style={{
                    fontSize: '.68rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxWidth: '100px',
                    color: 'var(--text-main)',
                    fontWeight: 500
                  }}>
                    {img.name.length > 12 ? img.name.substring(0, 12) + '...' : img.name}
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
