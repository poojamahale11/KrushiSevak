import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBasket,
  Search,
  MapPin,
  Phone,
  Navigation,
  Image as ImageIcon,
  Filter,
  AlertCircle,
  User,
  Package,
  Info,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ArrowUpDown,
  Tag,
  Calendar,
  Layers,
  Award,
  ExternalLink,
  ChevronRight,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { getAllDistricts, getTalukasForDistrict, MAHARASHTRA_CROPS } from '../utils/maharashtraData';

const locationText = (l) => [l.village, l.taluka, l.district].filter(Boolean).join(', ') || 'Location not provided';

const DISTRICT_COORDINATES = {
  'ahmednagar': { lat: 19.0948, lng: 74.7480 },
  'akola': { lat: 20.7002, lng: 77.0082 },
  'amravati': { lat: 20.9374, lng: 77.7796 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'beed': { lat: 18.9891, lng: 75.7601 },
  'bhandara': { lat: 21.1705, lng: 79.6549 },
  'buldhana': { lat: 20.5293, lng: 76.1843 },
  'chandrapur': { lat: 19.9615, lng: 79.2961 },
  'dhule': { lat: 20.9042, lng: 74.7749 },
  'gadchiroli': { lat: 20.1849, lng: 80.0028 },
  'gondia': { lat: 21.4624, lng: 80.1961 },
  'hingoli': { lat: 19.7183, lng: 77.1479 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'jalna': { lat: 19.8347, lng: 75.8816 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'latur': { lat: 18.4088, lng: 76.5604 },
  'mumbai': { lat: 18.9388, lng: 72.8353 },
  'mumbai suburban': { lat: 19.1176, lng: 72.8631 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'nanded': { lat: 19.1383, lng: 77.3210 },
  'nandurbar': { lat: 21.3712, lng: 74.2400 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'dharashiv': { lat: 18.1861, lng: 76.0419 },
  'osmanabad': { lat: 18.1861, lng: 76.0419 },
  'palghar': { lat: 19.6936, lng: 72.7655 },
  'parbhani': { lat: 19.2686, lng: 76.7712 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'raigad': { lat: 18.5158, lng: 73.1822 },
  'ratnagiri': { lat: 16.9902, lng: 73.3120 },
  'sangli': { lat: 16.8524, lng: 74.5815 },
  'satara': { lat: 17.6805, lng: 74.0183 },
  'sindhudurg': { lat: 16.1246, lng: 73.6913 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'wardha': { lat: 20.7453, lng: 78.6022 },
  'washim': { lat: 20.1107, lng: 77.1342 },
  'yavatmal': { lat: 20.3888, lng: 78.1204 },
  'rahuri': { lat: 19.3951, lng: 74.6534 }
};

const getListingCoordinates = (listing) => {
  if (listing?.location && typeof listing.location.lat === 'number' && typeof listing.location.lng === 'number' && !isNaN(listing.location.lat) && !isNaN(listing.location.lng)) {
    return { lat: Number(listing.location.lat), lng: Number(listing.location.lng) };
  }
  if (listing?.farmer?.location && typeof listing.farmer.location.lat === 'number' && typeof listing.farmer.location.lng === 'number' && !isNaN(listing.farmer.location.lat) && !isNaN(listing.farmer.location.lng)) {
    return { lat: Number(listing.farmer.location.lat), lng: Number(listing.farmer.location.lng) };
  }
  const districtKey = (listing?.district || listing?.farmer?.district || '').toLowerCase().trim();
  if (DISTRICT_COORDINATES[districtKey]) {
    return DISTRICT_COORDINATES[districtKey];
  }
  return { lat: 19.3951, lng: 74.6534 };
};

// Common Multilingual Crop Synonyms for Hindi/Marathi/English smart search
const CROP_SYNONYMS = {
  'tomato': ['tamatar', 'टोमॅटो', 'टमाटर', 'tomatoes'],
  'tomatoes': ['tomato', 'tamatar', 'टोमॅटो', 'टमाटर'],
  'टोमॅटो': ['tomato', 'tomatoes', 'tamatar', 'टमाटर'],
  'टमाटर': ['tomato', 'tomatoes', 'tamatar', 'टोमॅटो'],
  'tamatar': ['tomato', 'tomatoes', 'टोमॅटो', 'टमाटर'],
  'onion': ['kanda', 'कांदा', 'प्याज', 'gavran', 'pyaj', 'onions'],
  'onions': ['onion', 'kanda', 'कांदा', 'प्याज'],
  'kanda': ['onion', 'onions', 'कांदा', 'प्याज'],
  'कांदा': ['onion', 'onions', 'kanda', 'प्याज'],
  'प्याज': ['onion', 'onions', 'kanda', 'कांदा'],
  'wheat': ['gehu', 'गहू', 'गेहूं', 'sharbati'],
  'गहू': ['wheat', 'gehu', 'गेहूं', 'sharbati'],
  'गेहूं': ['wheat', 'gehu', 'गहू', 'sharbati'],
  'sugarcane': ['us', 'ऊस', 'गन्ना', 'co 86032'],
  'ऊस': ['sugarcane', 'us', 'गन्ना'],
  'गन्ना': ['sugarcane', 'us', 'ऊस'],
  'rice': ['tandul', 'तांदूळ', 'चावल', 'indrayani', 'dhan'],
  'तांदूळ': ['rice', 'tandul', 'चावल', 'indrayani'],
  'चावल': ['rice', 'tandul', 'तांदूळ', 'indrayani'],
  'grapes': ['draksha', 'द्राक्षे', 'अंगूर', 'thompson', 'grape'],
  'द्राक्षे': ['grapes', 'draksha', 'अंगूर', 'thompson'],
  'अंगूर': ['grapes', 'draksha', 'द्राक्षे', 'thompson'],
  'cotton': ['kapus', 'कापूस', 'कपास'],
  'कापूस': ['cotton', 'kapus', 'कपास'],
  'कपास': ['cotton', 'kapus', 'कापूस'],
  'soyabean': ['soybean', 'सोयाबीन'],
  'सोयाबीन': ['soyabean', 'soybean'],
  'sweet lime': ['mosambi', 'मोसंबी', 'मौसंबी'],
  'मोसंबी': ['sweet lime', 'mosambi', 'मौसंबी'],
  'मौसंबी': ['sweet lime', 'mosambi', 'मोसंबी'],
  'methi': ['fenugreek', 'मेथी'],
  'मेथी': ['methi', 'fenugreek'],
  'pomegranate': ['dalimb', 'डाळिंब', 'अनार'],
  'डाळिंब': ['pomegranate', 'dalimb', 'अनार'],
  'अनार': ['pomegranate', 'dalimb', 'डाळिंब'],
  'bajra': ['millet', 'बाजरी', 'बाजरा'],
  'बाजरी': ['bajra', 'millet', 'बाजरा'],
  'बाजरा': ['bajra', 'millet', 'बाजरी'],
  'jowar': ['sorghum', 'ज्वारी', 'ज्वार'],
  'ज्वारी': ['jowar', 'sorghum', 'ज्वार'],
  'ज्वार': ['jowar', 'sorghum', 'ज्वारी'],
};

export const Marketplace = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Data state
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Customer Location state
  const [customerCoords, setCustomerCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Detecting your location...');

  // Filter state
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All Maharashtra');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'price-asc' | 'price-desc' | 'qty-desc' | 'newest'
  
  // Modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeModalImageIdx, setActiveModalImageIdx] = useState(0);

  // Categories list
  const categories = ['All', 'Vegetable', 'Fruit', 'Grain', 'Pulse', 'Cash Crop', 'Oilseed', 'Other'];

  // Get all Maharashtra districts
  const allDistricts = useMemo(() => ['All Maharashtra', ...getAllDistricts()], []);
  
  // Get talukas for selected district
  const districtTalukas = useMemo(() => {
    if (selectedDistrict === 'All Maharashtra') {
      return [];
    }
    return getTalukasForDistrict(selectedDistrict);
  }, [selectedDistrict]);

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
    return R * c;
  };

  // Get customer registered location coordinates from user profile
  const getCustomerRegisteredLocation = (currentUser) => {
    if (!currentUser) return null;
    
    // 1. Direct GPS stored in user profile
    if (currentUser.location && Number.isFinite(Number(currentUser.location.lat)) && Number.isFinite(Number(currentUser.location.lng))) {
      const locParts = [currentUser.village, currentUser.taluka, currentUser.district].filter(Boolean);
      return {
        coords: { lat: Number(currentUser.location.lat), lng: Number(currentUser.location.lng) },
        label: locParts.length > 0 ? `Registered Location (${locParts.join(', ')})` : `Saved User Location (${currentUser.name})`,
        isRegistered: true
      };
    }
    
    // 2. District & Taluka fallback from registration data
    const distKey = (currentUser.district || '').toLowerCase().trim();
    if (distKey && DISTRICT_COORDINATES[distKey]) {
      const locParts = [currentUser.village, currentUser.taluka, currentUser.district].filter(Boolean);
      return {
        coords: DISTRICT_COORDINATES[distKey],
        label: `Registered Location (${locParts.join(', ') || currentUser.district})`,
        isRegistered: true
      };
    }
    
    return null;
  };

  // Load all crop listings from MongoDB
  const loadListings = async (coords = customerCoords) => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = { status: 'Available' };
      if (coords?.lat && coords?.lng) {
        queryParams.lat = coords.lat;
        queryParams.lng = coords.lng;
      }
      
      const res = await api.getCropListings(queryParams);
      setAllListings(res.listings || []);
      
    } catch (e) {
      console.error('Error loading listings:', e);
      setError(e.message || 'Unable to load farmer crop listings');
      setAllListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Detect Customer Registered Location on Mount or Auth Change
  useEffect(() => {
    // 1. Prioritize customer's saved registration location
    const registered = getCustomerRegisteredLocation(user);
    if (registered) {
      setCustomerCoords(registered.coords);
      setLocationLabel(registered.label);
      loadListings(registered.coords);
      return;
    }

    // 2. Fallback to live browser GPS for guests or users without registered location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCustomerCoords(coords);
          setLocationLabel(`Live GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`);
          loadListings(coords);
        },
        () => {
          const coords = { lat: 19.3951, lng: 74.6534 }; // Rahuri / Ahmednagar center
          setCustomerCoords(coords);
          setLocationLabel('Maharashtra Center (Rahuri / Ahmednagar)');
          loadListings(coords);
        },
        { timeout: 8000 }
      );
    } else {
      const coords = { lat: 19.3951, lng: 74.6534 };
      setCustomerCoords(coords);
      setLocationLabel('Maharashtra Center (Rahuri / Ahmednagar)');
      loadListings(coords);
    }
  }, [user]);

  // Extract distinct available crops from current listings with counts
  const availableCropCounts = useMemo(() => {
    const counts = {};
    allListings.forEach(listing => {
      if (listing.cropName && listing.cropName.trim()) {
        const name = listing.cropName.trim();
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allListings]);

  // Filter listings & sort matching results
  const filteredListings = useMemo(() => {
    let filtered = [...allListings];
    
    // Filter by Crop Search (with synonym expansion)
    if (cropSearch.trim()) {
      const searchTerms = [cropSearch.trim().toLowerCase()];
      const searchKey = cropSearch.trim().toLowerCase();
      
      // Check for synonyms
      Object.entries(CROP_SYNONYMS).forEach(([key, synonyms]) => {
        if (key.includes(searchKey) || searchKey.includes(key) || synonyms.some(s => s.toLowerCase().includes(searchKey))) {
          searchTerms.push(key);
          synonyms.forEach(s => searchTerms.push(s.toLowerCase()));
        }
      });

      const uniqueTerms = [...new Set(searchTerms)];

      filtered = filtered.filter(listing => {
        const cropName = (listing.cropName || '').toLowerCase();
        const category = (listing.category || '').toLowerCase();
        const farmerName = (listing.farmerName || '').toLowerCase();
        const village = (listing.village || '').toLowerCase();
        const taluka = (listing.taluka || '').toLowerCase();
        const district = (listing.district || '').toLowerCase();
        const desc = (listing.description || '').toLowerCase();
        const quality = (listing.quality || '').toLowerCase();

        return uniqueTerms.some(term =>
          cropName.includes(term) ||
          category.includes(term) ||
          farmerName.includes(term) ||
          village.includes(term) ||
          taluka.includes(term) ||
          district.includes(term) ||
          desc.includes(term) ||
          quality.includes(term)
        );
      });
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(listing => 
        listing.category && 
        listing.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

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

    // Calculate distance for all listings based on customer's registered location
    const cLat = customerCoords?.lat || 19.3951;
    const cLng = customerCoords?.lng || 74.6534;

    filtered = filtered.map(listing => {
      const fLoc = getListingCoordinates(listing);
      const calculated = calculateDistance(cLat, cLng, fLoc.lat, fLoc.lng);
      const d = Number.isFinite(calculated) ? Number(calculated.toFixed(1)) : 0;
      return { ...listing, location: fLoc, calculatedDistanceKm: d };
    });

    // Apply Sorting: display nearest farmers first when sorting by distance
    if (sortBy === 'distance') {
      filtered.sort((a, b) => (Number(a.calculatedDistanceKm) || 0) - (Number(b.calculatedDistanceKm) || 0));
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (Number(a.pricePerUnit) || 0) - (Number(b.pricePerUnit) || 0));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (Number(b.pricePerUnit) || 0) - (Number(a.pricePerUnit) || 0));
    } else if (sortBy === 'qty-desc') {
      filtered.sort((a, b) => (Number(b.quantity) || 0) - (Number(a.quantity) || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      // Default: Nearest to customer registered location
      filtered.sort((a, b) => (Number(a.calculatedDistanceKm) || 0) - (Number(b.calculatedDistanceKm) || 0));
    }
    
    return filtered;
  }, [allListings, selectedDistrict, selectedTaluka, selectedCategory, cropSearch, customerCoords, sortBy]);

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
    const target = getListingCoordinates(listing);
    return `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving`;
  };

  // WhatsApp chat URL
  const getWhatsAppUrl = (listing) => {
    const mobile = (listing.contact || listing.farmer?.mobile || '').replace(/[^0-9]/g, '');
    if (!mobile) return null;
    const cleanMobile = mobile.length === 10 ? `91${mobile}` : mobile;
    const msg = `Hello ${listing.farmerName || 'Farmer'}, I am interested in your ${listing.cropName} listed on KrushiSevak (₹${listing.pricePerUnit}/${listing.unit}). Is it available for purchase?`;
    return `https://wa.me/${cleanMobile}?text=${encodeURIComponent(msg)}`;
  };

  // Get distance text for listing
  const getDistanceText = (listing) => {
    const dist = listing.calculatedDistanceKm ?? listing.distanceKm;
    if (dist === undefined || dist === null) return 'Nearby';
    if (dist < 1) return `${(dist * 1000).toFixed(0)} m away`;
    return `${dist} km away`;
  };

  // View farmer details modal
  const openFarmerModal = (listing) => {
    setSelectedListing(listing);
    setActiveModalImageIdx(0);
  };

  const closeFarmerModal = () => {
    setSelectedListing(null);
    setActiveModalImageIdx(0);
  };

  return (
    <div className="marketplace-page">
      <div className="container">
        {/* Interactive Glassmorphism Hero Section */}
        <div className="marketplace-hero-glass">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 1.1rem',
            borderRadius: '999px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '1.2rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
          }}>
            <ShoppingBasket size={18} style={{ color: '#86efac' }} />
            <span>Direct Farmer-to-Customer Fresh Marketplace</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 850,
            margin: '0.2rem 0 0.85rem',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em'
          }}>
            Farm-Fresh Crops & Direct Harvest
          </h1>

          <p style={{
            maxWidth: '740px',
            margin: '0 auto 1.5rem',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            color: '#e2e8f0',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)'
          }}>
            Discover and purchase fresh crops directly from verified local farmers across Maharashtra.
            Inspect multi-angle produce photos, calculate exact GPS road distance, and contact growers directly with 100% zero middlemen!
          </p>

          {/* Interactive Hero Highlights / Stats Bar */}
          <div className="marketplace-stats-grid">
            <div className="marketplace-stat-pill">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(34, 197, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#86efac',
                flexShrink: 0
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <b style={{ display: 'block', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  {allListings.length} Active Listings
                </b>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>100% Real Farmers</span>
              </div>
            </div>

            <div className="marketplace-stat-pill">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7dd3fc',
                flexShrink: 0
              }}>
                <Camera size={22} />
              </div>
              <div>
                <b style={{ display: 'block', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  1 to 5 Photos
                </b>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Quality Inspection</span>
              </div>
            </div>

            <div className="marketplace-stat-pill">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(250, 204, 21, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fde047',
                flexShrink: 0
              }}>
                <Navigation size={22} />
              </div>
              <div>
                <b style={{ display: 'block', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  GPS Distance
                </b>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Sorted Nearest First</span>
              </div>
            </div>

            <div className="marketplace-stat-pill">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(37, 211, 102, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ade80',
                flexShrink: 0
              }}>
                <MessageCircle size={22} />
              </div>
              <div>
                <b style={{ display: 'block', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  Instant WhatsApp
                </b>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Direct Farmer Chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filters & Controls */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Customer Location Status Banner */}
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.9rem 1.25rem',
            background: '#f0fdf4',
            borderRadius: '14px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
            color: '#166534'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', fontWeight: 650 }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                display: 'inline-block'
              }} />
              <Navigation size={18} style={{ color: '#15803d' }} />
              <span>
                <strong style={{ color: '#14532d' }}>Your Location:</strong> {locationLabel} &nbsp;•&nbsp;{' '}
                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                  {sortBy === 'distance' ? '📍 Crops Sorted Nearest to You First' : `Sorted by: ${sortBy}`}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  setLocationLabel('Refreshing GPS location...');
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                      setCustomerCoords(coords);
                      setLocationLabel(`Live GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`);
                      loadListings(coords);
                    },
                    () => {
                      setLocationLabel('Location permission denied; using regional center.');
                    }
                  );
                }
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '0.4rem 0.95rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}
            >
              <Navigation size={14} />
              Refresh Location
            </button>
          </div>

          {/* Main Search and Region Filters Box */}
          <div className="marketplace-filter-glass">
            {/* Primary Search Bar */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <Search
                size={22}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search crops by name (e.g. Onion / कांदा, Tomato / टोमॅटो, Sugarcane / ऊस, Wheat / गहू), farmer name, or village..."
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                style={{
                  paddingLeft: '3.1rem',
                  paddingRight: cropSearch ? '2.8rem' : '1.1rem',
                  fontSize: '1.02rem',
                  height: '52px',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
                }}
              />
              {cropSearch && (
                <button
                  type="button"
                  onClick={() => setCropSearch('')}
                  style={{
                    position: 'absolute',
                    right: '1.1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={15} style={{ color: '#16a34a' }} /> Filter Category:
              </span>
              {categories.map((cat) => {
                const count = cat === 'All'
                  ? allListings.length
                  : allListings.filter(l => l.category && l.category.toLowerCase().includes(cat.toLowerCase())).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.4rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.84rem',
                      fontWeight: selectedCategory === cat ? 750 : 600,
                      background: selectedCategory === cat ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f1f5f9',
                      color: selectedCategory === cat ? '#ffffff' : '#334155',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? '#15803d' : '#e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedCategory === cat ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{cat === 'All' ? '🌱 All Categories' : cat}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      background: selectedCategory === cat ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: selectedCategory === cat ? '#ffffff' : '#64748b',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Region & Sorting Dropdowns Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: selectedDistrict !== 'All Maharashtra' && districtTalukas.length > 0 ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              {/* District Dropdown */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                  <MapPin size={15} style={{ color: '#16a34a' }} />
                  <span>District ({allDistricts.length - 1} Districts)</span>
                </label>
                <select
                  className="form-input"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  style={{ height: '44px', borderRadius: '10px' }}
                >
                  {allDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taluka Dropdown - Only if district is selected */}
              {selectedDistrict !== 'All Maharashtra' && districtTalukas.length > 0 && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                    <Package size={15} style={{ color: '#16a34a' }} />
                    <span>Taluka in {selectedDistrict}</span>
                  </label>
                  <select
                    className="form-input"
                    value={selectedTaluka}
                    onChange={(e) => setSelectedTaluka(e.target.value)}
                    style={{ height: '44px', borderRadius: '10px' }}
                  >
                    <option value="All">All Talukas ({districtTalukas.length})</option>
                    {districtTalukas.map((taluka) => (
                      <option key={taluka} value={taluka}>
                        {taluka}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort By Dropdown */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                  <ArrowUpDown size={15} style={{ color: '#16a34a' }} />
                  <span>Sort By</span>
                </label>
                <select
                  className="form-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ height: '44px', borderRadius: '10px', fontWeight: 650 }}
                >
                  <option value="distance">📍 Nearest to Me (GPS Distance)</option>
                  <option value="price-asc">💰 Price: Low to High</option>
                  <option value="price-desc">💎 Price: High to Low</option>
                  <option value="qty-desc">📦 Quantity: High to Low</option>
                  <option value="newest">🕒 Newest Listings First</option>
                </select>
              </div>
            </div>

            {/* Quick Available Crop Tags */}
            {availableCropCounts.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 750, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Tag size={14} style={{ color: '#0284c7' }} /> Popular Crops in Market:
                  </span>
                  {availableCropCounts.slice(0, 10).map(([cropName, count]) => {
                    const isSelected = cropSearch.toLowerCase() === cropName.toLowerCase();
                    return (
                      <button
                        key={cropName}
                        type="button"
                        onClick={() => setCropSearch(isSelected ? '' : cropName)}
                        style={{
                          background: isSelected ? '#dcfce7' : '#f8fafc',
                          color: isSelected ? '#15803d' : '#334155',
                          border: `1px solid ${isSelected ? '#86efac' : '#cbd5e1'}`,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 650,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cropName} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {(selectedDistrict !== 'All Maharashtra' || selectedTaluka !== 'All' || selectedCategory !== 'All' || cropSearch.trim()) && (
            <div style={{
              padding: '0.85rem 1.25rem',
              background: '#ecfdf5',
              borderRadius: '14px',
              border: '1px solid #a7f3d0',
              fontSize: '0.88rem',
              color: '#065f46',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>Active Filters:</strong>
                {cropSearch.trim() && <span>Crop: <b>"{cropSearch}"</b></span>}
                {selectedCategory !== 'All' && <span>• Category: <b>{selectedCategory}</b></span>}
                {selectedDistrict !== 'All Maharashtra' && <span>• District: <b>{selectedDistrict}</b></span>}
                {selectedTaluka !== 'All' && selectedTaluka && <span>• Taluka: <b>{selectedTaluka}</b></span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict('All Maharashtra');
                  setSelectedTaluka('All');
                  setSelectedCategory('All');
                  setCropSearch('');
                }}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', background: '#ffffff' }}
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

        {/* Results Count Header */}
        {!loading && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.9rem 1.35rem',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <strong style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 850 }}>
                {filteredListings.length}
              </strong>
              <span style={{ fontSize: '0.94rem', color: '#475569', marginLeft: '0.45rem', fontWeight: 600 }}>
                {filteredListings.length === 1 ? 'farmer crop listing found' : 'farmer crop listings found'}
              </span>
              {selectedDistrict !== 'All Maharashtra' && (
                <span style={{ fontSize: '0.9rem', color: '#475569', marginLeft: '0.5rem' }}>
                  in <strong>{selectedDistrict}</strong>
                  {selectedTaluka !== 'All' && selectedTaluka && <>, <strong>{selectedTaluka}</strong></>}
                </span>
              )}
            </div>
            {allListings.length > 0 && (
              <div style={{ fontSize: '0.88rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} />
                <span>Total: <b>{allListings.length}</b> verified direct farmer listings</span>
              </div>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="marketplace-filter-glass" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div style={{
              display: 'inline-block',
              width: '42px',
              height: '42px',
              border: '3.5px solid #e2e8f0',
              borderTopColor: '#16a34a',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ marginTop: '1.2rem', color: '#475569', fontSize: '1.02rem', fontWeight: 600 }}>
              Fetching live produce listings from verified Maharashtra farmers...
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="marketplace-filter-glass" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <ShoppingBasket size={58} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 800, color: '#0f172a' }}>
              No crop listings match your search
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              {selectedDistrict !== 'All Maharashtra' ? (
                <>No farmer listings found in <strong>{selectedDistrict}</strong>{selectedTaluka !== 'All' && selectedTaluka ? <> ({selectedTaluka})</> : ''} for {cropSearch ? `"${cropSearch}"` : 'the selected filters'}.</>
              ) : (
                <>No farmer listings match your search keywords. Try searching for popular crops (e.g. Tomato, Onion, Wheat) or clear your filters.</>
              )}
            </p>
            <button
              onClick={() => {
                setSelectedDistrict('All Maharashtra');
                setSelectedTaluka('All');
                setSelectedCategory('All');
                setCropSearch('');
              }}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}
            >
              Browse All Available Crops
            </button>
          </div>
        ) : (
          <div className="marketplace-grid">
            {filteredListings.map((listing) => {
              const allImgs = (listing.images && listing.images.length > 0)
                ? listing.images
                : (listing.imageUrl ? [listing.imageUrl] : []);
              const mainImage = allImgs[0] || listing.imageUrl;
              const hasImage = Boolean(mainImage && mainImage.trim());
              const directionsLink = getDirectionsUrl(listing);
              const whatsAppUrl = getWhatsAppUrl(listing);
              const farmerPhone = listing.contact || listing.farmer?.mobile || '';

              return (
                <div
                  className="marketplace-card"
                  key={listing._id}
                >
                  {/* Crop Image Banner with Zoom Interaction */}
                  <div
                    className="crop-card-img-wrap"
                    onClick={() => openFarmerModal(listing)}
                    title="Click to inspect all crop photos & details"
                  >
                    {hasImage ? (
                      <img
                        src={mainImage}
                        alt={listing.cropName}
                        className="crop-card-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: hasImage ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #14532d 0%, #064e3b 100%)',
                        color: '#86efac'
                      }}
                    >
                      <ShoppingBasket size={48} style={{ opacity: 0.8 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.4rem', color: '#bbf7d0' }}>
                        Farm Direct Produce
                      </span>
                    </div>

                    {/* Category Badge */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        background: 'rgba(22, 163, 74, 0.95)',
                        color: '#ffffff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
                      }}
                    >
                      {listing.category || 'Produce'}
                    </span>

                    {/* Multi-Photo Count Interactive Badge */}
                    {allImgs.length > 0 && (
                      <span
                        className="crop-photo-count-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFarmerModal(listing);
                        }}
                      >
                        <Camera size={13} />
                        <span>{allImgs.length} {allImgs.length === 1 ? 'Photo' : 'Photos'}</span>
                      </span>
                    )}

                    {/* Distance Pill */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(15, 23, 42, 0.88)',
                        color: '#38bdf8',
                        backdropFilter: 'blur(6px)',
                        padding: '0.25rem 0.7rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
                      }}
                    >
                      <Navigation size={12} />
                      {getDistanceText(listing)}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Crop Name & Quality */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <h3
                        style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, cursor: 'pointer' }}
                        onClick={() => openFarmerModal(listing)}
                      >
                        {listing.cropName}
                      </h3>
                      {listing.quality && (
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 750,
                          padding: '0.22rem 0.55rem',
                          borderRadius: '8px',
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          whiteSpace: 'nowrap'
                        }}>
                          {listing.quality}
                        </span>
                      )}
                    </div>

                    {/* Pricing & Quantity Box */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #dcfce7',
                      marginBottom: '0.9rem'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.04em' }}>
                          Farmer Price
                        </span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 850, color: '#15803d' }}>
                          ₹{listing.pricePerUnit}
                          <small style={{ fontSize: '0.82rem', fontWeight: 650, color: '#64748b', marginLeft: '0.15rem' }}>
                            /{listing.unit || 'kg'}
                          </small>
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.04em' }}>
                          Stock Ready
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {listing.quantity} {listing.unit || 'kg'}
                        </span>
                      </div>
                    </div>

                    {/* Farmer Profile Snippet */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      marginBottom: '0.9rem',
                      padding: '0.65rem 0.8rem',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #15803d, #166534)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)'
                      }}>
                        {(listing.farmerName || 'F').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <b style={{ fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {listing.farmerName || 'Verified Farmer'}
                          </b>
                          <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <MapPin size={12} style={{ color: '#0284c7' }} />
                          {locationText(listing)}
                        </span>
                      </div>
                    </div>

                    {/* Harvest Date or Short Description if present */}
                    {listing.harvestDate && (
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} style={{ color: '#0284c7' }} />
                        <span>Harvest / Freshness: <b>{listing.harvestDate}</b></span>
                      </div>
                    )}

                    {listing.description && (
                      <p style={{
                        fontSize: '0.83rem',
                        color: '#64748b',
                        lineHeight: 1.45,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {listing.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => openFarmerModal(listing)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.84rem', fontWeight: 650 }}
                      >
                        <Camera size={14} style={{ color: '#16a34a' }} />
                        <span>Photos & Info</span>
                      </button>

                      {farmerPhone ? (
                        <a
                          className="btn btn-sm btn-primary"
                          href={`tel:${farmerPhone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            background: '#16a34a',
                            borderColor: '#16a34a',
                            fontSize: '0.84rem',
                            fontWeight: 700
                          }}
                        >
                          <Phone size={14} />
                          <span>Call Farmer</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => openFarmerModal(listing)}
                          style={{ fontSize: '0.84rem' }}
                        >
                          Contact
                        </button>
                      )}

                      {whatsAppUrl && (
                        <a
                          className="btn btn-sm"
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            gridColumn: '1 / -1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            background: 'linear-gradient(135deg, #25D366, #128C7E)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 750,
                            fontSize: '0.85rem',
                            padding: '0.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)'
                          }}
                        >
                          <MessageCircle size={16} />
                          <span>Chat on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= FARMER & CROP DETAILS MODAL ================= */}
      {selectedListing && (
        <div className="modal-overlay" onClick={closeFarmerModal}>
          <div
            className="modal-box"
            style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <ShoppingBasket size={22} style={{ color: '#16a34a' }} />
                <span>Crop & Farmer Information</span>
              </h3>
              <button onClick={closeFarmerModal} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Crop Photo Inspection Gallery */}
            {(() => {
              const modalImgs = (selectedListing.images && selectedListing.images.length > 0)
                ? selectedListing.images
                : (selectedListing.imageUrl ? [selectedListing.imageUrl] : []);

              if (!modalImgs.length) return null;

              const activeImg = modalImgs[activeModalImageIdx] || modalImgs[0];

              return (
                <div style={{ marginBottom: '1.25rem' }}>
                  {/* Main Active Image Box */}
                  <div style={{
                    position: 'relative',
                    height: '280px',
                    background: '#0f172a',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={activeImg}
                      alt={`${selectedListing.cropName} photo ${activeModalImageIdx + 1}`}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />

                    {/* Top Quality Badge */}
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(22, 163, 74, 0.95)',
                      color: '#ffffff',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                    }}>
                      <CheckCircle2 size={13} />
                      Verified Quality Photos ({modalImgs.length})
                    </span>

                    {/* Left/Right Navigation Controls */}
                    {modalImgs.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveModalImageIdx(prev => (prev > 0 ? prev - 1 : modalImgs.length - 1))}
                          style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '20px',
                            transition: 'background 0.2s'
                          }}
                          title="Previous crop photo"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModalImageIdx(prev => (prev < modalImgs.length - 1 ? prev + 1 : 0))}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '20px',
                            transition: 'background 0.2s'
                          }}
                          title="Next crop photo"
                        >
                          ›
                        </button>

                        {/* Photo Counter Pill */}
                        <span style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#ffffff',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          Photo {activeModalImageIdx + 1} of {modalImgs.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row to inspect different angles */}
                  {modalImgs.length > 1 && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.65rem',
                      overflowX: 'auto',
                      paddingBottom: '0.35rem'
                    }}>
                      {modalImgs.map((imgUrl, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveModalImageIdx(i)}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: activeModalImageIdx === i ? '2.5px solid #16a34a' : '1px solid #cbd5e1',
                            flexShrink: 0,
                            position: 'relative',
                            background: '#f1f5f9',
                            boxShadow: activeModalImageIdx === i ? '0 0 0 2px rgba(22,163,74,0.3)' : 'none'
                          }}
                          title={`View photo #${i + 1}`}
                        >
                          <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            fontSize: '0.6rem',
                            padding: '0.05rem 0.25rem',
                            borderRadius: '3px',
                            fontWeight: 700
                          }}>
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={13} style={{ color: '#16a34a' }} />
                    <span>Click on any thumbnail above to inspect crop freshness, color, and quality from multiple angles.</span>
                  </p>
                </div>
              );
            })()}

            {/* Crop Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 800 }}>{selectedListing.cropName}</h2>
                <span style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  {selectedListing.category || 'Crop'}
                </span>
                {selectedListing.quality && (
                  <span style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {selectedListing.quality}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                Direct producer: <strong>{selectedListing.farmerName || 'Verified Producer'}</strong>
              </p>
            </div>

            {/* Crop Specifications Section */}
            <div style={{
              marginBottom: '1.25rem',
              padding: '1.25rem',
              background: '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bbf7d0'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.85rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={18} />
                <span>Crop Pricing & Availability</span>
              </h4>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Selling Price</span>
                  <span className="info-value" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                    ₹{selectedListing.pricePerUnit} / {selectedListing.unit || 'kg'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Available Quantity</span>
                  <span className="info-value" style={{ fontWeight: 700 }}>
                    {selectedListing.quantity} {selectedListing.unit || 'kg'}
                  </span>
                </div>
                {selectedListing.quality && (
                  <div className="info-row">
                    <span className="info-label">Grade / Quality</span>
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
                  <span className="info-label">Availability</span>
                  <span className="info-value" style={{ color: '#16a34a', fontWeight: 700 }}>
                    ✓ In Stock & Ready for Sale
                  </span>
                </div>
              </div>

              {selectedListing.description && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #bbf7d0' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem', color: '#166534' }}>
                    Farmer Notes & Description:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.5, margin: 0 }}>
                    {selectedListing.description}
                  </p>
                </div>
              )}
            </div>

            {/* Farmer Profile & Contact Section */}
            <div style={{
              marginBottom: '1.25rem',
              padding: '1.25rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={18} />
                <span>Farmer Contact & Farm Information</span>
              </h4>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Farmer Name</span>
                  <span className="info-value" style={{ fontWeight: 700 }}>
                    {selectedListing.farmerName || 'Verified Farmer'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact Number</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#0369a1' }}>
                    {selectedListing.contact || selectedListing.farmer?.mobile || 'Not provided'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Village</span>
                  <span className="info-value">{selectedListing.village || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Taluka</span>
                  <span className="info-value">{selectedListing.taluka || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">District</span>
                  <span className="info-value">{selectedListing.district || 'Maharashtra'}</span>
                </div>
                {selectedListing.farmer?.landSize && (
                  <div className="info-row">
                    <span className="info-label">Farm Land Size</span>
                    <span className="info-value">{selectedListing.farmer.landSize}</span>
                  </div>
                )}
                {selectedListing.farmer?.crops && selectedListing.farmer.crops.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Other Crops Grown</span>
                    <span className="info-value">
                      {Array.isArray(selectedListing.farmer.crops) ? selectedListing.farmer.crops.join(', ') : selectedListing.farmer.crops}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Location & Distance Section */}
            <div style={{
              marginBottom: '1.5rem',
              padding: '1.25rem',
              background: '#fef3c7',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fde68a'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.85rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={18} />
                <span>Farm Location & Directions</span>
              </h4>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Location</span>
                  <span className="info-value">{locationText(selectedListing)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Distance from You</span>
                  <span className="info-value" style={{ color: '#d97706', fontWeight: 700 }}>
                    📍 {getDistanceText(selectedListing)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              {getDirectionsUrl(selectedListing) && (
                <a
                  className="btn btn-outline"
                  href={getDirectionsUrl(selectedListing)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </a>
              )}

              {getWhatsAppUrl(selectedListing) && (
                <a
                  className="btn"
                  href={getWhatsAppUrl(selectedListing)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </a>
              )}

              <a
                className="btn btn-primary"
                href={`tel:${selectedListing.contact || selectedListing.farmer?.mobile || ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  background: '#16a34a',
                  borderColor: '#16a34a'
                }}
              >
                <Phone size={16} />
                <span>Call Farmer</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
