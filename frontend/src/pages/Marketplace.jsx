import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingBasket, Search, MapPin, Phone, Navigation, Image as ImageIcon, Filter, AlertCircle, User, Package, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { getAllDistricts, getTalukasForDistrict, MAHARASHTRA_CROPS } from '../utils/maharashtraData';

const locationText = (l) => [l.village, l.taluka, l.district].filter(Boolean).join(', ') || 'Location not provided';

export const Marketplace = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Data state
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [cropSearch, setCropSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Maharashtra');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  
  // Modal state
  const [selectedListing, setSelectedListing] = useState(null);

  // Get all Maharashtra districts
  const allDistricts = useMemo(() => ['All Maharashtra', ...getAllDistricts()], []);
  
  // Get talukas for selected district
  const districtTalukas = useMemo(() => {
    if (selectedDistrict === 'All Maharashtra') {
      return [];
    }
    return getTalukasForDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // Extract available crops from current listings
  const availableCrops = useMemo(() => {
    const crops = new Set();
    allListings.forEach(listing => {
      if (listing.cropName && listing.cropName.trim()) {
        crops.add(listing.cropName.trim());
      }
    });
    return Array.from(crops).sort();
  }, [allListings]);

  // Load all crop listings from MongoDB
  const loadListings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all available listings
      const res = await api.getCropListings({ status: 'Available' });
      setAllListings(res.listings || []);
      
    } catch (e) {
      console.error('Error loading listings:', e);
      setError(e.message || 'Unable to load farmer listings');
      setAllListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Load listings on component mount
  useEffect(() => {
    loadListings();
  }, []);

  // Filter listings based on location hierarchy and crop search
  const filteredListings = useMemo(() => {
    let filtered = [...allListings];
    
    // Filter by District
    if (selectedDistrict !== 'All Maharashtra') {
      filtered = filtered.filter(listing => 
        listing.district && 
        listing.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    
    // Filter by Taluka (only if district is selected)
    if (selectedDistrict !== 'All Maharashtra' && selectedTaluka !== 'All') {
      filtered = filtered.filter(listing => 
        listing.taluka && 
        listing.taluka.toLowerCase() === selectedTaluka.toLowerCase()
      );
    }
    
    // Filter by Crop Search
    if (cropSearch.trim()) {
      const searchLower = cropSearch.trim().toLowerCase();
      filtered = filtered.filter(listing => 
        (listing.cropName && listing.cropName.toLowerCase().includes(searchLower)) ||
        (listing.category && listing.category.toLowerCase().includes(searchLower)) ||
        (listing.farmerName && listing.farmerName.toLowerCase().includes(searchLower)) ||
        (listing.village && listing.village.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [allListings, selectedDistrict, selectedTaluka, cropSearch]);

  // Reset taluka when district changes
  useEffect(() => {
    setSelectedTaluka('All');
  }, [selectedDistrict]);

  // Handle district change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedTaluka('All');
  };

  // Google Maps directions URL
  const getDirectionsUrl = (listing) => {
    const target = listing.location || listing.farmer?.location;
    if (!target?.lat || !target?.lng) return '';
    return `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving`;
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Get distance text for listing
  const getDistanceText = (listing) => {
    if (!user?.location?.lat || !user?.location?.lng) return null;
    const farmerLocation = listing.location || listing.farmer?.location;
    if (!farmerLocation?.lat || !farmerLocation?.lng) return null;
    
    const distance = calculateDistance(
      user.location.lat,
      user.location.lng,
      farmerLocation.lat,
      farmerLocation.lng
    );
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} meters away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km away`;
    } else {
      return `${Math.round(distance)} km away`;
    }
  };

  // View farmer details modal
  const openFarmerModal = (listing) => {
    setSelectedListing(listing);
  };

  const closeFarmerModal = () => {
    setSelectedListing(null);
  };

  return (
    <div className="marketplace-page">
      <div className="container">
        {/* Hero Section */}
        <div className="marketplace-hero">
          <div className="marketplace-kicker">
            <ShoppingBasket size={16} />
            <span>Farmer Marketplace</span>
          </div>
          <h1>Browse Farm-Fresh Crops</h1>
          <p style={{ maxWidth: '680px', margin: '0 auto' }}>
            View real crop listings from verified farmers across Maharashtra. Search by crop, district, and taluka to find fresh produce in your area.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Location Hierarchy Info */}
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#0369a1' }}>
            <Info size={16} />
            <span>
              <strong>Location Hierarchy:</strong> Maharashtra → District → Taluka → Farmers
            </span>
          </div>

          {/* Filter Row */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedDistrict !== 'All Maharashtra' && districtTalukas.length > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
            {/* Crop Search */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <Search size={14} />
                <span>Search Crop</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Methi, Onion, Tomato, Wheat..."
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
              />
              {availableCrops.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {availableCrops.length} different crops available
                </span>
              )}
            </div>

            {/* District Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <MapPin size={14} />
                <span>District</span>
              </label>
              <select
                className="form-input"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                {allDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                {allDistricts.length - 1} districts
              </span>
            </div>

            {/* Taluka Dropdown - Only show if district is selected */}
            {selectedDistrict !== 'All Maharashtra' && districtTalukas.length > 0 && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Package size={14} />
                  <span>Taluka in {selectedDistrict}</span>
                </label>
                <select
                  className="form-input"
                  value={selectedTaluka}
                  onChange={(e) => setSelectedTaluka(e.target.value)}
                >
                  <option value="All">All Talukas</option>
                  {districtTalukas.map((taluka) => (
                    <option key={taluka} value={taluka}>
                      {taluka}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {districtTalukas.length} talukas
                </span>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {(selectedDistrict !== 'All Maharashtra' || selectedTaluka !== 'All' || cropSearch.trim()) && (
            <div style={{ padding: '0.85rem 1.15rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', fontSize: '0.88rem', color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <strong>Active Filters:</strong>
                {cropSearch.trim() && <span style={{ marginLeft: '0.5rem' }}>Crop: <b>"{cropSearch}"</b></span>}
                {selectedDistrict !== 'All Maharashtra' && <span style={{ marginLeft: '0.5rem' }}>• District: <b>{selectedDistrict}</b></span>}
                {selectedTaluka !== 'All' && selectedTaluka && <span style={{ marginLeft: '0.5rem' }}>• Taluka: <b>{selectedTaluka}</b></span>}
              </div>
              <button
                onClick={() => {
                  setSelectedDistrict('All Maharashtra');
                  setSelectedTaluka('All');
                  setCropSearch('');
                }}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Results Summary */}
        {!loading && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.15rem' }}>
                  {filteredListings.length}
                </strong>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                  {filteredListings.length === 1 ? 'farmer listing' : 'farmer listings'} found
                </span>
                {selectedDistrict !== 'All Maharashtra' && (
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    in <strong>{selectedDistrict}</strong>
                    {selectedTaluka !== 'All' && selectedTaluka && (
                      <>, <strong>{selectedTaluka}</strong></>
                    )}
                  </span>
                )}
              </div>
              {allListings.length > 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total: {allListings.length} listings across Maharashtra
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading farmer listings from MongoDB...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <ShoppingBasket size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              No crops available in this region
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {selectedDistrict !== 'All Maharashtra' ? (
                <>No farmers in <strong>{selectedDistrict}</strong>{selectedTaluka !== 'All' && selectedTaluka ? <> → <strong>{selectedTaluka}</strong></> : null} have listed {cropSearch ? `"${cropSearch}"` : 'crops'} yet.</>
              ) : (
                <>No farmers match your search criteria. Try adjusting your filters.</>
              )}
            </p>
            <button
              onClick={() => {
                setSelectedDistrict('All Maharashtra');
                setSelectedTaluka('All');
                setCropSearch('');
              }}
              className="btn btn-outline"
              style={{ marginTop: '0.5rem' }}
            >
              View All Listings
            </button>
          </div>
        ) : (
          <div className="marketplace-grid">
            {filteredListings.map((listing) => {
              const hasImage = listing.imageUrl && listing.imageUrl.trim();
              const directionsLink = getDirectionsUrl(listing);

              return (
                <div className="marketplace-card" key={listing._id}>
                  {/* Crop Image */}
                  <div className="market-image-wrap">
                    {hasImage ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.cropName}
                        className="market-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="market-image-placeholder" style={{ display: hasImage ? 'none' : 'flex' }}>
                      <ImageIcon size={38} />
                      <span>No image</span>
                    </div>
                    <span className="crop-category-badge" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#16a34a', color: '#fff', border: 'none' }}>
                      {listing.category || 'Crops'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="market-card-body">
                    {/* Top Row: Crop Name and Price */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                        {listing.cropName}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
                          ₹{listing.pricePerUnit}
                          <small style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>/{listing.unit}</small>
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {listing.quantity} {listing.unit} available
                        </span>
                      </div>
                    </div>

                    {/* Farmer Info */}
                    <div className="market-farmer" style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                      <div className="farmer-avatar">
                        {(listing.farmerName || 'F').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <b style={{ fontSize: '0.92rem' }}>{listing.farmerName || 'Farmer'}</b>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <MapPin size={13} />
                          {locationText(listing)}
                        </span>
                      </div>
                    </div>

                    {/* Crop Details */}
                    <div className="market-info-grid" style={{ marginBottom: '0.75rem' }}>
                      {listing.quality && (
                        <div>
                          <span>Quality</span>
                          <b>{listing.quality}</b>
                        </div>
                      )}
                      {listing.harvestDate && (
                        <div>
                          <span>Harvest</span>
                          <b>{listing.harvestDate}</b>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <p className="market-description" style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '1rem' }}>
                        {listing.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="market-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openFarmerModal(listing)}
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <User size={14} />
                        <span>Details</span>
                      </button>
                      
                      {directionsLink ? (
                        <a
                          className="btn btn-sm btn-outline"
                          href={directionsLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <Navigation size={14} />
                          <span>Directions</span>
                        </a>
                      ) : null}

                      <a
                        className="btn btn-sm btn-primary"
                        href={`tel:${listing.contact || listing.farmer?.mobile || ''}`}
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: '#16a34a', borderColor: '#16a34a' }}
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Farmer Details Modal - Comprehensive View */}
      {selectedListing && (
        <div className="modal-overlay" onClick={closeFarmerModal}>
          <div className="modal-box" style={{ maxWidth: '680px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <ShoppingBasket size={20} style={{ color: '#16a34a' }} />
                <span>Crop & Farmer Details</span>
              </h3>
              <button onClick={closeFarmerModal} className="modal-close-btn">
                ×
              </button>
            </div>

            {/* All Crop Images */}
            {selectedListing.imageUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <img
                    src={selectedListing.imageUrl}
                    alt={selectedListing.cropName}
                    style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  📸 Image uploaded by farmer
                </p>
              </div>
            )}

            {/* Crop Name & Category */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedListing.cropName}</h2>
                <span className="crop-category-badge" style={{ background: '#16a34a', color: '#fff', border: 'none' }}>
                  {selectedListing.category || 'Crops'}
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                Available for sale by <strong>{selectedListing.farmerName || 'Verified Farmer'}</strong>
              </p>
            </div>

            {/* Crop Details Section */}
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} />
                <span>Crop Information</span>
              </h4>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Price</span>
                  <span className="info-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#16a34a' }}>
                    ₹{selectedListing.pricePerUnit} / {selectedListing.unit}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Available Quantity</span>
                  <span className="info-value">
                    {selectedListing.quantity} {selectedListing.unit}
                  </span>
                </div>
                {selectedListing.quality && (
                  <div className="info-row">
                    <span className="info-label">Quality</span>
                    <span className="info-value">{selectedListing.quality}</span>
                  </div>
                )}
                {selectedListing.harvestDate && (
                  <div className="info-row">
                    <span className="info-label">Harvest Date</span>
                    <span className="info-value">{selectedListing.harvestDate}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Availability Status</span>
                  <span className="info-value" style={{ color: '#16a34a', fontWeight: 600 }}>
                    ✓ Available
                  </span>
                </div>
              </div>

              {selectedListing.description && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #bbf7d0' }}>
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem', color: '#166534' }}>
                    Crop Details:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                    {selectedListing.description}
                  </p>
                </div>
              )}
            </div>

            {/* Farmer Details Section */}
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} />
                <span>Farmer Information</span>
              </h4>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Farmer Name</span>
                  <span className="info-value" style={{ fontWeight: 600 }}>
                    {selectedListing.farmerName || 'Not provided'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Village</span>
                  <span className="info-value">{selectedListing.village || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Taluka</span>
                  <span className="info-value">{selectedListing.taluka || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">District</span>
                  <span className="info-value">{selectedListing.district || 'Not provided'}</span>
                </div>
                {selectedListing.address && (
                  <div className="info-row">
                    <span className="info-label">Address</span>
                    <span className="info-value" style={{ maxWidth: '350px' }}>
                      {selectedListing.address}
                    </span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Contact</span>
                  <span className="info-value" style={{ fontWeight: 600, color: '#0369a1' }}>
                    {selectedListing.contact || selectedListing.farmer?.mobile || 'Not provided'}
                  </span>
                </div>
                
                {/* Additional farmer information from user profile */}
                {selectedListing.farmer?.landSize && (
                  <div className="info-row">
                    <span className="info-label">Land Size</span>
                    <span className="info-value">{selectedListing.farmer.landSize}</span>
                  </div>
                )}
                {selectedListing.farmer?.crops && (
                  <div className="info-row">
                    <span className="info-label">Current Crops</span>
                    <span className="info-value" style={{ maxWidth: '350px' }}>
                      {selectedListing.farmer.crops}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Location Section */}
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} />
                <span>Location & Distance</span>
              </h4>
              
              {(() => {
                const farmerLocation = selectedListing.location || selectedListing.farmer?.location;
                const hasGPS = farmerLocation?.lat && farmerLocation?.lng;
                const distanceText = getDistanceText(selectedListing);
                
                return (
                  <>
                    {hasGPS ? (
                      <>
                        <div className="info-list">
                          <div className="info-row">
                            <span className="info-label">Farmer Location</span>
                            <span className="info-value">
                              {locationText(selectedListing)}
                            </span>
                          </div>
                          {distanceText && (
                            <div className="info-row">
                              <span className="info-label">Distance from You</span>
                              <span className="info-value" style={{ color: '#d97706', fontWeight: 600 }}>
                                📍 {distanceText}
                              </span>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="info-label">GPS Coordinates</span>
                            <span className="info-value" style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                              {farmerLocation.lat.toFixed(6)}, {farmerLocation.lng.toFixed(6)}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#92400e' }}>
                          ✓ Real GPS location saved by farmer
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <MapPin size={32} style={{ color: '#d97706', margin: '0 auto 0.75rem' }} />
                        <p style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '0.5rem' }}>
                          <strong>Location not available</strong>
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#78350f' }}>
                          This farmer hasn't shared GPS coordinates yet. Contact them for exact location.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              {getDirectionsUrl(selectedListing) && (
                <a
                  className="btn btn-primary"
                  href={getDirectionsUrl(selectedListing)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#16a34a', borderColor: '#16a34a' }}
                >
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </a>
              )}
              <a
                className="btn btn-outline"
                href={`tel:${selectedListing.contact || selectedListing.farmer?.mobile || ''}`}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Phone size={16} />
                <span>Call Farmer</span>
              </a>
            </div>

            {/* View Only Notice */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#e0f2fe', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#0369a1', textAlign: 'center' }}>
              ℹ️ You are viewing this listing. Contact the farmer directly to purchase.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
