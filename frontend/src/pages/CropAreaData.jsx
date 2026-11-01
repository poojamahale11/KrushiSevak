import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  MapPin,
  Users,
  Sprout,
  PieChart,
  BarChart3,
  Award,
  Layers,
  Search,
  Phone,
  CloudSun,
  MapPinned,
  X,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  ShieldCheck,
  Wheat,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

// Complete official list of all 36 Districts of Maharashtra and their Talukas
export const MAHARASHTRA_DISTRICTS_AND_TALUKAS = {
  'Ahmednagar': [
    'Akole',
    'Jamkhed',
    'Karjat',
    'Kopargaon',
    'Nagar',
    'Nevasa',
    'Parner',
    'Pathardi',
    'Rahata',
    'Rahuri',
    'Sangamner',
    'Shevgaon',
    'Shrigonda',
    'Shrirampur'
  ],
  'Akola': [
    'Akola',
    'Akot',
    'Balapur',
    'Barshitakli',
    'Murtizapur',
    'Patur',
    'Telhara'
  ],
  'Amravati': [
    'Achalpur',
    'Amravati',
    'Anjangaon Surji',
    'Bhatkuli',
    'Chandurbazar',
    'Chandur Railway',
    'Chikhaldara',
    'Daryapur',
    'Dhamangaon Railway',
    'Dharni',
    'Morshi',
    'Nandgaon-Khandeshwar',
    'Teosa',
    'Warud'
  ],
  'Beed': [
    'Ambejogai',
    'Ashti',
    'Beed',
    'Dharur',
    'Georai',
    'Kaij',
    'Majalgaon',
    'Parli',
    'Patoda',
    'Shirur-Kasar',
    'Wadwani'
  ],
  'Bhandara': [
    'Bhandara',
    'Lakhandur',
    'Lakhani',
    'Mohadi',
    'Pauni',
    'Sakoli',
    'Tumsar'
  ],
  'Buldhana': [
    'Buldhana',
    'Chikhli',
    'Deolgaon Raja',
    'Jalgaon Jamod',
    'Khamgaon',
    'Lonar',
    'Malkapur',
    'Mehkar',
    'Motala',
    'Nandura',
    'Sangrampur',
    'Shegaon',
    'Sindkhed Raja'
  ],
  'Chandrapur': [
    'Ballarpur',
    'Bhadravati',
    'Brahmapuri',
    'Chandrapur',
    'Chimur',
    'Gondpipri',
    'Jiwati',
    'Korpana',
    'Mul',
    'Nagbhid',
    'Pombhurna',
    'Rajura',
    'Sawali',
    'Sindewahi',
    'Warora'
  ],
  'Chhatrapati Sambhajinagar': [
    'Chhatrapati Sambhajinagar',
    'Gangapur',
    'Kannad',
    'Khuldabad',
    'Paithan',
    'Phulambri',
    'Sillod',
    'Soegaon',
    'Vaijapur'
  ],
  'Dharashiv': [
    'Bhoom',
    'Dharashiv',
    'Kalamb',
    'Lohara',
    'Omerga',
    'Paranda',
    'Tuljapur',
    'Washi'
  ],
  'Dhule': [
    'Dhule',
    'Sakri',
    'Shirpur',
    'Sindkheda'
  ],
  'Gadchiroli': [
    'Aheri',
    'Armori',
    'Bhamragad',
    'Chamorshi',
    'Dhanora',
    'Etapalli',
    'Gadchiroli',
    'Korchi',
    'Kurkheda',
    'Mulchera',
    'Sironcha',
    'Wadsa Desaiganj'
  ],
  'Gondia': [
    'Amgaon',
    'Arjuni Morgaon',
    'Deori',
    'Gondia',
    'Goregaon',
    'Sadak Arjuni',
    'Salekasa',
    'Tirora'
  ],
  'Hingoli': [
    'Aundha Nagnath',
    'Basmath',
    'Hingoli',
    'Kalamnuri',
    'Sengaon'
  ],
  'Jalgaon': [
    'Amalner',
    'Bhadgaon',
    'Bhusawal',
    'Bodwad',
    'Chalisgaon',
    'Chopda',
    'Dharangaon',
    'Erandol',
    'Jalgaon',
    'Jamner',
    'Muktainagar',
    'Pachora',
    'Parola',
    'Raver',
    'Yawal'
  ],
  'Jalna': [
    'Ambad',
    'Badnapur',
    'Bhokardan',
    'Ghansawangi',
    'Jafrabad',
    'Jalna',
    'Mantha',
    'Partur'
  ],
  'Kolhapur': [
    'Ajra',
    'Bavda',
    'Bhudargad',
    'Chandgad',
    'Gadhinglaj',
    'Hatkanangle',
    'Kagal',
    'Karveer',
    'Panhala',
    'Radhanagari',
    'Shahuwadi',
    'Shirol'
  ],
  'Latur': [
    'Ahmadpur',
    'Ausa',
    'Chakur',
    'Deoni',
    'Jalkot',
    'Latur',
    'Nilanga',
    'Renapur',
    'Shirur-Anantpal',
    'Udgir'
  ],
  'Mumbai City': [
    'Mumbai City'
  ],
  'Mumbai Suburban': [
    'Andheri',
    'Borivali',
    'Kurla'
  ],
  'Nagpur': [
    'Hingna',
    'Kalameshwar',
    'Kamptee',
    'Katol',
    'Kuhi',
    'Mouda',
    'Nagpur Rural',
    'Nagpur Urban',
    'Narkhed',
    'Parseoni',
    'Ramtek',
    'Saoner',
    'Umred'
  ],
  'Nanded': [
    'Ardhapur',
    'Bhokar',
    'Biloli',
    'Deglur',
    'Dharmabad',
    'Hadgaon',
    'Himayatnagar',
    'Kandhar',
    'Kinwat',
    'Loha',
    'Mahur',
    'Mudkhed',
    'Mukhed',
    'Naigaon',
    'Nanded'
  ],
  'Nandurbar': [
    'Akkalkuwa',
    'Akrani',
    'Nandurbar',
    'Navapur',
    'Shahada',
    'Taloda'
  ],
  'Nashik': [
    'Baglan (Satana)',
    'Chandwad',
    'Deola',
    'Dindori',
    'Igatpuri',
    'Kalwan',
    'Malegaon',
    'Nandgaon',
    'Nashik',
    'Niphad',
    'Peint',
    'Sinnar',
    'Surgana',
    'Trimbakeshwar',
    'Yeola'
  ],
  'Palghar': [
    'Dahanu',
    'Jawhar',
    'Mokhada',
    'Palghar',
    'Talasari',
    'Vada',
    'Vasai',
    'Vikramgad'
  ],
  'Parbhani': [
    'Gangakhed',
    'Jintur',
    'Manwath',
    'Palam',
    'Parbhani',
    'Pathri',
    'Purna',
    'Sailu',
    'Sonpeth'
  ],
  'Pune': [
    'Ambegaon',
    'Baramati',
    'Bhor',
    'Daund',
    'Haveli',
    'Indapur',
    'Junnar',
    'Khed',
    'Maval',
    'Mulshi',
    'Pune City',
    'Purandar',
    'Shirur',
    'Velhe'
  ],
  'Raigad': [
    'Alibag',
    'Karjat',
    'Khalapur',
    'Mahad',
    'Mangaon',
    'Mhasla',
    'Murud',
    'Panvel',
    'Pen',
    'Poladpur',
    'Roha',
    'Shrivardhan',
    'Sudhagad',
    'Tala',
    'Uran'
  ],
  'Ratnagiri': [
    'Chiplun',
    'Dapoli',
    'Guhagar',
    'Khed',
    'Lanja',
    'Mandangad',
    'Rajapur',
    'Ratnagiri',
    'Sangameshwar'
  ],
  'Sangli': [
    'Atpadi',
    'Jat',
    'Kadegaon',
    'Kavathe Mahankal',
    'Khanapur',
    'Miraj',
    'Palus',
    'Shirala',
    'Tasgaon',
    'Walwa'
  ],
  'Satara': [
    'Jaavali',
    'Karad',
    'Khandala',
    'Khatav',
    'Koregaon',
    'Mahabaleshwar',
    'Man',
    'Patan',
    'Phaltan',
    'Satara',
    'Wai'
  ],
  'Sindhudurg': [
    'Devgad',
    'Dodamarg',
    'Kankavli',
    'Kudal',
    'Malvan',
    'Sawantwadi',
    'Vaibhavwadi',
    'Vengurla'
  ],
  'Solapur': [
    'Akkalkot',
    'Barshi',
    'Karmala',
    'Madha',
    'Malshiras',
    'Mangalwedha',
    'Mohol',
    'Pandharpur',
    'Sangole',
    'Solapur North',
    'Solapur South'
  ],
  'Thane': [
    'Ambarnath',
    'Bhiwandi',
    'Kalyan',
    'Murbad',
    'Shahapur',
    'Thane',
    'Ulhasnagar'
  ],
  'Wardha': [
    'Arvi',
    'Ashti',
    'Deoli',
    'Hinganghat',
    'Karanja',
    'Samudrapur',
    'Seloo',
    'Wardha'
  ],
  'Washim': [
    'Karanja',
    'Malegaon',
    'Mangrulpir',
    'Manora',
    'Risod',
    'Washim'
  ],
  'Yavatmal': [
    'Arni',
    'Babhulgaon',
    'Darwha',
    'Digras',
    'Ghatanji',
    'Kalamb',
    'Mahagaon',
    'Maregaon',
    'Ner',
    'Pandharkawada',
    'Pusad',
    'Ralegaon',
    'Umarkhed',
    'Wani',
    'Yavatmal',
    'Zari Jamani'
  ]
};

export const ALL_36_DISTRICTS = Object.keys(MAHARASHTRA_DISTRICTS_AND_TALUKAS).sort();

export const CropAreaData = () => {
  const { t } = useLanguage();

  // Location selection dropdown states: Maharashtra -> District -> Taluka
  const [selectedState] = useState('Maharashtra'); // State is locked to Maharashtra
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [areaData, setAreaData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state for viewing farmer's registered crops
  const [selectedFarmerDetail, setSelectedFarmerDetail] = useState(null);

  const loadAreaData = async () => {
    try {
      setLoading(true);
      setError('');

      const cropParam = selectedCrop && selectedCrop.trim() && selectedCrop !== 'All' ? selectedCrop.trim() : undefined;

      const res = await api.getAreaData({
        state: 'Maharashtra',
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        taluka: selectedTaluka !== 'All' ? selectedTaluka : undefined,
        crop: cropParam,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      });

      if (res.success && res.data) {
        setAreaData(res.data);
      }

      // Fetch regional weather for selected area
      const weatherLocation =
        selectedTaluka !== 'All'
          ? selectedTaluka
          : selectedDistrict !== 'All'
          ? selectedDistrict
          : 'Maharashtra';

      const weatherRes = await api.getWeather({
        location: weatherLocation,
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
      });

      if (weatherRes.success) {
        setWeather(weatherRes.weather);
      }
    } catch (err) {
      console.error('Failed to load crop area data:', err);
      setError(err.message || 'Failed to load area data.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic update when District, Taluka, Crop or Search Query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAreaData();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedDistrict, selectedTaluka, selectedCrop, searchQuery]);

  // Color palette for charts
  const CHART_COLORS = [
    '#2d6a4f',
    '#52a465',
    '#e76f51',
    '#2a9d8f',
    '#e9c46a',
    '#0288d1',
    '#8c6700',
    '#b45309',
    '#7c3aed',
    '#d97706',
    '#059669',
    '#ec4899',
  ];

  // District options: ALL 36 Maharashtra Districts
  const districtList = useMemo(() => {
    return ['All', ...ALL_36_DISTRICTS];
  }, []);

  // Taluka options: Strictly ONLY talukas belonging to the selected district
  const talukaList = useMemo(() => {
    if (selectedDistrict === 'All') {
      return ['All'];
    }
    const districtTalukas = MAHARASHTRA_DISTRICTS_AND_TALUKAS[selectedDistrict] || [];
    return ['All', ...districtTalukas];
  }, [selectedDistrict]);

  // Registered crops list available in the selected area
  const cropBreakdown = areaData?.cropBreakdown || [];
  const cropList = useMemo(() => {
    if (areaData?.options?.crops && Array.isArray(areaData.options.crops) && areaData.options.crops.length > 0) {
      return areaData.options.crops;
    }
    const uniqueCrops = cropBreakdown.map((c) => c.cropName);
    return ['All', ...uniqueCrops];
  }, [areaData, cropBreakdown]);

  // Real MongoDB registered farmers directory from backend API
  const filteredFarmers = useMemo(() => {
    return areaData?.farmerDirectory || [];
  }, [areaData]);

  const maxAcreage = cropBreakdown.length > 0 ? Math.max(...cropBreakdown.map((c) => c.acreage)) : 1;
  const selectedCropSpotlight = areaData?.selectedCropAvailability;

  // Clear selections helper
  const handleClearSelection = () => {
    setSelectedDistrict('All');
    setSelectedTaluka('All');
    setSelectedCrop('');
    setSearchQuery('');
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready for Harvest':
        return <span className="farmer-crop-pill-tag ready">🌾 Ready for Harvest</span>;
      case 'Harvested':
        return <span className="farmer-crop-pill-tag harvested">📦 Harvested</span>;
      case 'Planned':
        return <span className="farmer-crop-pill-tag">🗓️ Planned</span>;
      default:
        return <span className="farmer-crop-pill-tag growing">🌱 Growing</span>;
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '85vh' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#ecfdf5',
              color: '#065f46',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              border: '1px solid #a7f3d0',
            }}
          >
            <ShieldCheck size={16} />
            <span>{t('registeredCropsOnlyBadge') || 'Registered Farm Crops (Crops Available on Farm)'}</span>
          </div>

          <h1 style={{ fontSize: '2.35rem', marginBottom: '0.5rem', fontWeight: 800 }}>
            {t('areaDataTitle')}
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', maxWidth: '820px', lineHeight: 1.5 }}>
            {t('areaDataDesc')}
          </p>
        </div>

        {/* Clean Regional Selection Card: Maharashtra → District → Taluka */}
        <div className="crop-area-filter-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} style={{ color: 'var(--primary-600)' }} />
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Select Region: <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Maharashtra → District → Taluka</span>
              </strong>
            </div>

            {(selectedDistrict !== 'All' ||
              selectedTaluka !== 'All' ||
              (selectedCrop && selectedCrop !== 'All') ||
              searchQuery) && (
              <button
                onClick={handleClearSelection}
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={14} />
                <span>{t('resetSelection') || 'Clear Selection'}</span>
              </button>
            )}
          </div>

          <div className="filter-grid-4step">
            {/* Step 1: State (Fixed to Maharashtra) */}
            <div className="filter-field-group">
              <label>
                <span>1. State</span>
              </label>
              <select
                className="form-input"
                value="Maharashtra"
                disabled
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.88rem', background: '#f8fafc', fontWeight: 600, color: '#1e293b' }}
              >
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
              </select>
            </div>

            {/* Step 2: District (ALL 36 Maharashtra Districts) */}
            <div className="filter-field-group">
              <label>
                <span>2. District (All 36 Districts)</span>
              </label>
              <select
                className="form-input"
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedTaluka('All');
                  setSelectedCrop('');
                }}
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.88rem', fontWeight: selectedDistrict !== 'All' ? 700 : 400 }}
              >
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All 36 Districts (सर्व जिल्हे)' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Taluka (Strictly belonging to the selected district) */}
            <div className="filter-field-group">
              <label>
                <span>3. Taluka</span>
              </label>
              <select
                className="form-input"
                value={selectedTaluka}
                onChange={(e) => {
                  setSelectedTaluka(e.target.value);
                  setSelectedCrop('');
                }}
                disabled={selectedDistrict === 'All'}
                style={{
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.88rem',
                  fontWeight: selectedTaluka !== 'All' ? 700 : 400,
                  background: selectedDistrict === 'All' ? '#f8fafc' : '#ffffff',
                }}
              >
                {talukaList.map((tk) => (
                  <option key={tk} value={tk}>
                    {tk === 'All'
                      ? selectedDistrict === 'All'
                        ? 'Select District first (आधी जिल्हा निवडा)'
                        : `All Talukas in ${selectedDistrict} (सर्व तालुके)`
                      : tk}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Crop Search Bar (Available on Farm) */}
            <div className="filter-field-group">
              <label>
                <span>4. Crop Search (Available on Farm)</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    color: selectedCrop && selectedCrop !== 'All' ? 'var(--primary-600)' : 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={selectedCrop === 'All' ? '' : selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  placeholder={t('searchCropPlaceholder') || 'Search crop (e.g. Onion, Wheat, Sugarcane)...'}
                  list="registered-crops-suggestions"
                  style={{
                    paddingLeft: '2.2rem',
                    paddingRight: selectedCrop && selectedCrop !== 'All' ? '2.1rem' : '0.75rem',
                    paddingTop: '0.55rem',
                    paddingBottom: '0.55rem',
                    fontSize: '0.88rem',
                    fontWeight: selectedCrop && selectedCrop !== 'All' ? 700 : 500,
                    color: selectedCrop && selectedCrop !== 'All' ? 'var(--primary-700)' : 'inherit',
                    borderColor: selectedCrop && selectedCrop !== 'All' ? 'var(--primary-500)' : 'var(--border-light)',
                    background: '#ffffff',
                  }}
                />
                {selectedCrop && selectedCrop !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCrop('')}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Clear crop search"
                  >
                    <X size={15} />
                  </button>
                )}
                <datalist id="registered-crops-suggestions">
                  {cropList
                    .filter((cp) => cp !== 'All')
                    .map((cp) => (
                      <option key={cp} value={cp} />
                    ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Quick Popular Registered Crops Chips Bar */}
          {cropBreakdown.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  REGISTERED CROPS AVAILABLE IN THIS AREA:
                </span>
                {selectedCrop && selectedCrop !== 'All' && (
                  <button
                    onClick={() => setSelectedCrop('')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Show all crops
                  </button>
                )}
              </div>

              <div className="crop-chips-scroll">
                <button
                  className={`crop-chip-pill ${!selectedCrop || selectedCrop === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedCrop('')}
                >
                  <span>🌾 All Crops ({cropBreakdown.length})</span>
                </button>
                {cropBreakdown.slice(0, 10).map((cropItem) => {
                  const isChipActive =
                    selectedCrop &&
                    selectedCrop !== 'All' &&
                    selectedCrop.trim().toLowerCase() === cropItem.cropName.toLowerCase();

                  return (
                    <button
                      key={cropItem.cropName}
                      className={`crop-chip-pill ${isChipActive ? 'active' : ''}`}
                      onClick={() => setSelectedCrop(isChipActive ? '' : cropItem.cropName)}
                    >
                      <span>{cropItem.cropName}</span>
                      <span style={{ fontSize: '0.74rem', opacity: 0.85, padding: '0.1rem 0.4rem', background: 'rgba(0,0,0,0.06)', borderRadius: '999px' }}>
                        {cropItem.farmersCount} {cropItem.farmersCount === 1 ? 'farmer' : 'farmers'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CROP AVAILABILITY SPOTLIGHT CARD (When farmer searches/selects a crop) */}
        {selectedCropSpotlight && (
          <div className="crop-spotlight-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={14} />
                  <span>{t('cropSpotlightTitle') || 'Crop Availability Spotlight'}</span>
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.2rem 0 0.4rem', color: '#ffffff' }}>
                  🌾 {selectedCropSpotlight.farmersCount}{' '}
                  {selectedCropSpotlight.farmersCount === 1 ? 'Farmer has' : 'Farmers have'}{' '}
                  "{selectedCropSpotlight.searchedCrop}" Available on Farm
                </h2>
                <p style={{ margin: 0, color: '#dcfce7', fontSize: '0.95rem' }}>
                  In{' '}
                  <strong>
                    {selectedTaluka !== 'All' ? `${selectedTaluka}, ` : ''}
                    {selectedDistrict !== 'All' ? `${selectedDistrict}, ` : ''}
                    Maharashtra
                  </strong>{' '}
                  with total cultivated area of <strong>{selectedCropSpotlight.totalAcreage} Acres</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('farmers-directory-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-sm"
                style={{ background: '#ffffff', color: '#065f46', fontWeight: 700, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                View Available Farmers ({selectedCropSpotlight.farmersCount})
              </button>
            </div>

            <div className="spotlight-metric-grid">
              <div className="spotlight-metric-box">
                <div className="spotlight-metric-val">{selectedCropSpotlight.farmersCount}</div>
                <div className="spotlight-metric-lbl">Farmers With Crop</div>
              </div>
              <div className="spotlight-metric-box">
                <div className="spotlight-metric-val">{selectedCropSpotlight.totalAcreage} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Acres</span></div>
                <div className="spotlight-metric-lbl">Cultivated Land</div>
              </div>
              <div className="spotlight-metric-box">
                <div className="spotlight-metric-val" style={{ fontSize: '1.35rem' }}>
                  {selectedCropSpotlight.readyCount > 0 ? `${selectedCropSpotlight.readyCount} Ready` : `${selectedCropSpotlight.growingCount} Growing`}
                </div>
                <div className="spotlight-metric-lbl">
                  {selectedCropSpotlight.readyCount} Ready for Harvest • {selectedCropSpotlight.growingCount} Growing
                </div>
              </div>
              <div className="spotlight-metric-box">
                <div className="spotlight-metric-val" style={{ fontSize: '1.15rem' }}>
                  {selectedTaluka !== 'All' ? selectedTaluka : selectedDistrict !== 'All' ? selectedDistrict : 'Maharashtra'}
                </div>
                <div className="spotlight-metric-lbl">Selected Area</div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ fontWeight: 600 }}>Loading verified crop & area intelligence...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <Info size={18} />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* 4 Summary KPI Metric Cards */}
            <div className="area-kpi-grid">
              {/* Total Registered Farmers */}
              <div className="area-kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <Users size={28} />
                </div>
                <div>
                  <div className="kpi-val">{areaData?.totalFarmers || 0}</div>
                  <div className="kpi-lbl">{t('totalRegisteredFarmers')}</div>
                </div>
              </div>

              {/* Total Cultivated Land */}
              <div className="area-kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <Sprout size={28} />
                </div>
                <div>
                  <div className="kpi-val">
                    {areaData?.totalCultivatedAcres || 0}{' '}
                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>Acres</span>
                  </div>
                  <div className="kpi-lbl">{t('totalCultivatedAcres')}</div>
                </div>
              </div>

              {/* Most Commonly Grown Crop */}
              <div className="area-kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Award size={28} />
                </div>
                <div>
                  <div className="kpi-val" style={{ fontSize: '1.25rem' }}>
                    {areaData?.mostCommonCrop?.cropName || 'Sugarcane'}
                  </div>
                  <div className="kpi-lbl">
                    {t('mostCommonCrop')} ({areaData?.mostCommonCrop?.acreage || 0} ac •{' '}
                    {areaData?.mostCommonCrop?.farmersCount || 0} farmers)
                  </div>
                </div>
              </div>

              {/* Crop Diversity Count */}
              <div className="area-kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0288d1' }}>
                  <Layers size={28} />
                </div>
                <div>
                  <div className="kpi-val" style={{ fontSize: '1.25rem' }}>
                    {areaData?.cropsGrownCount || 0} Varieties
                  </div>
                  <div className="kpi-lbl">
                    Registered Crop Varieties Available
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section: Acreage Bar Chart + Percentage Donut Chart */}
            <div className="chart-grid">
              {/* Chart 1: SVG Responsive Bar Chart */}
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} style={{ color: 'var(--primary-500)' }} />
                    <span>{t('cropDistributionChart')} (Acreage & Farmer Count)</span>
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Click bar to select crop
                  </span>
                </div>

                {cropBreakdown.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                    No registered crop records found for {selectedTaluka !== 'All' ? selectedTaluka : selectedDistrict !== 'All' ? selectedDistrict : 'this area'}.
                  </p>
                ) : (
                  <div className="svg-bar-container">
                    {cropBreakdown.map((crop, idx) => {
                      const widthPercent = Math.max(8, Math.round((crop.acreage / maxAcreage) * 100));
                      const color = CHART_COLORS[idx % CHART_COLORS.length];
                      const isSelected =
                        selectedCrop &&
                        selectedCrop.trim() !== '' &&
                        selectedCrop.trim().toLowerCase() === crop.cropName.toLowerCase();

                      return (
                        <div
                          key={crop.cropName}
                          className="bar-row"
                          onClick={() => setSelectedCrop(isSelected ? '' : crop.cropName)}
                          style={{
                            cursor: 'pointer',
                            padding: '0.35rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? '#f0fdf4' : 'transparent',
                            border: isSelected ? '1px solid #86efac' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                          }}
                          title={`Click to select ${crop.cropName}`}
                        >
                          <span className="bar-label" title={crop.cropName} style={{ fontWeight: isSelected ? 700 : 600 }}>
                            🌾 {crop.cropName}
                          </span>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${widthPercent}%`,
                                background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                            <span className="bar-val" style={{ color }}>
                              {crop.acreage} ac
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#475569',
                                background: '#f1f5f9',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '999px',
                                fontWeight: 700,
                              }}
                            >
                              {crop.farmersCount}👨‍🌾
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chart 2: Crop Distribution Donut & Regional Climate Snippet */}
              <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4>
                    <PieChart size={20} style={{ color: '#0288d1' }} />
                    <span>{t('percentageShare')}</span>
                  </h4>

                  {cropBreakdown.length > 0 ? (
                    <div className="donut-wrap">
                      {/* SVG Multi-segment Donut Chart */}
                      <svg width="180" height="180" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        {(() => {
                          let accumulatedPercent = 0;
                          return cropBreakdown.map((crop, idx) => {
                            const strokeDasharray = `${crop.percentage} ${100 - crop.percentage}`;
                            const strokeDashoffset = -accumulatedPercent;
                            accumulatedPercent += crop.percentage;
                            const color = CHART_COLORS[idx % CHART_COLORS.length];

                            return (
                              <circle
                                key={crop.cropName}
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke={color}
                                strokeWidth="18"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="butt"
                              />
                            );
                          });
                        })()}
                      </svg>

                      {/* Legend Grid */}
                      <div className="donut-legend">
                        {cropBreakdown.slice(0, 6).map((crop, idx) => (
                          <div
                            key={crop.cropName}
                            className="legend-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedCrop(crop.cropName)}
                          >
                            <span className="legend-dot" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                            <span style={{ fontSize: '0.8rem' }}>
                              {crop.cropName.split(' ')[0]}: <strong>{crop.percentage}%</strong> ({crop.farmersCount}f)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No crop records</p>
                  )}
                </div>

                {/* Regional Weather Snippet */}
                {weather && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: '#f0f9ff',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <CloudSun size={24} style={{ color: '#0288d1' }} />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                          {weather.location} Weather
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {weather.condition} • {weather.rainfallProbability}% Rain
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#0369a1',
                          fontFamily: 'Outfit, sans-serif',
                          display: 'block',
                        }}
                      >
                        {weather.temperature}°C
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {weather.humidity}% humidity
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* REGISTERED FARMERS & CROPS AVAILABLE ON FARM DIRECTORY */}
            <div id="farmers-directory-section" className="dash-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Users size={22} style={{ color: 'var(--primary-500)' }} />
                    <span>{t('farmersDirectory')}</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                      ({filteredFarmers.length} {filteredFarmers.length === 1 ? 'Farmer' : 'Farmers'})
                    </span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    Real-time registered farm crops available in selected area (Crops Available on Farm only).
                  </p>
                </div>

                {selectedCrop && selectedCrop.trim() !== '' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.35rem 0.75rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                    <span style={{ fontSize: '0.82rem', color: '#065f46' }}>
                      Crop Search: <strong>"{selectedCrop}"</strong>
                    </span>
                    <button
                      onClick={() => setSelectedCrop('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', display: 'flex', alignItems: 'center', padding: 0 }}
                      title="Clear crop search"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {filteredFarmers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Sprout size={48} style={{ margin: '0 auto 0.75rem', color: 'var(--primary-300)' }} />
                  <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    No registered farmers found{selectedCrop && selectedCrop.trim() ? ` for "${selectedCrop}"` : ''} in {selectedTaluka !== 'All' ? selectedTaluka : selectedDistrict !== 'All' ? selectedDistrict : 'Maharashtra'}.
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>
                    Try searching another crop (e.g. Onion, Sugarcane, Tomato, Grapes) or clear selection.
                  </p>
                  <button onClick={handleClearSelection} className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }}>
                    View All Maharashtra
                  </button>
                </div>
              ) : (
                <div className="products-table-container" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>{t('farmerName')}</th>
                        <th>{t('villageCol') || 'Village'}</th>
                        <th>{t('talukaCol') || 'Taluka'}</th>
                        <th>{t('districtCol') || 'District'}</th>
                        <th>{t('landAcresCol') || 'Land (Acres)'}</th>
                        <th>{t('cropCol') || 'Crop'}</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.map((farmer) => (
                        <tr key={farmer.id}>
                          {/* 1. Farmer Name */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              {farmer.profileImage ? (
                                <img
                                  src={farmer.profileImage}
                                  alt={farmer.name}
                                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  {farmer.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.92rem' }}>
                                  {farmer.name}
                                </strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                                  <span className="badge badge-farmer" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                    Verified Farmer
                                  </span>
                                  {farmer.location?.available && (
                                    <span style={{ fontSize: '0.65rem', color: '#059669' }}>
                                      <MapPinned size={10} style={{ display: 'inline', marginRight: '2px' }} />
                                      GPS
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Village */}
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                              {farmer.village}
                            </span>
                          </td>

                          {/* 3. Taluka */}
                          <td>
                            <span style={{ color: 'var(--text-body)', fontSize: '0.88rem' }}>
                              {farmer.taluka}
                            </span>
                          </td>

                          {/* 4. District */}
                          <td>
                            <span style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.88rem' }}>
                              {farmer.district}
                            </span>
                          </td>

                          {/* 5. Land (acres) */}
                          <td>
                            <strong style={{ color: 'var(--primary-600)', fontSize: '0.92rem' }}>
                              {farmer.totalAcreage}
                            </strong>
                          </td>

                          {/* 6. Crop (Available on Farm) */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {Array.isArray(farmer.registeredCrops) && farmer.registeredCrops.length > 0 ? (
                                farmer.registeredCrops.map((c) => (
                                  <div
                                    key={c.id || c.cropName}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}
                                  >
                                    <strong style={{ color: 'var(--primary-700)', fontSize: '0.88rem' }}>
                                      🌾 {c.cropName}
                                    </strong>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      ({c.acreage} ac)
                                    </span>
                                    {getStatusBadge(c.status)}
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                                  🌾 {farmer.cropSummary}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Action */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedFarmerDetail(farmer)}
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                title="View crop schedule & farm notes"
                              >
                                <span>Details</span>
                              </button>
                              <a
                                href={`tel:${farmer.mobile}`}
                                className="btn btn-sm btn-primary"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  padding: '0.3rem 0.65rem',
                                }}
                              >
                                <Phone size={12} />
                                <span>{farmer.mobile}</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* DETAILED MODAL: Farmer's Registered Crops on Farm */}
        {selectedFarmerDetail && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedFarmerDetail(null)}
          >
            <div
              className="dash-card"
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 0,
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
                    <ShieldCheck size={14} /> Verified Registered Farm Record
                  </div>
                  <h3 style={{ fontSize: '1.35rem', margin: '0.2rem 0 0' }}>{selectedFarmerDetail.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📍 {selectedFarmerDetail.village}, {selectedFarmerDetail.taluka}, {selectedFarmerDetail.district}, Maharashtra
                  </p>
                </div>

                <button
                  onClick={() => setSelectedFarmerDetail(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Farmer quick contact strip */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Farm Land Size: </span>
                  <strong style={{ color: 'var(--primary-700)' }}>{selectedFarmerDetail.totalAcreage}</strong>
                </div>

                <a
                  href={`tel:${selectedFarmerDetail.mobile}`}
                  className="btn btn-sm btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <Phone size={14} />
                  <span>Call {selectedFarmerDetail.mobile}</span>
                </a>
              </div>

              {/* Crops Registered on this Farm */}
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sprout size={18} style={{ color: 'var(--primary-600)' }} />
                <span>Crops Registered & Available on Farm ({selectedFarmerDetail.registeredCrops?.length || 0})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {Array.isArray(selectedFarmerDetail.registeredCrops) && selectedFarmerDetail.registeredCrops.length > 0 ? (
                  selectedFarmerDetail.registeredCrops.map((crop, idx) => (
                    <div
                      key={crop.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            🌾 {crop.cropName}
                          </strong>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                            {crop.category}
                          </span>
                        </div>
                        {getStatusBadge(crop.status)}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', fontSize: '0.84rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Acreage:</span>
                          <strong>{crop.acreage} Acres</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Season:</span>
                          <strong>{crop.season}</strong>
                        </div>
                        {crop.sowingDate && (
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Sowing Date:</span>
                            <span>{crop.sowingDate}</span>
                          </div>
                        )}
                        {crop.expectedHarvestDate && (
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Expected Harvest:</span>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{crop.expectedHarvestDate}</span>
                          </div>
                        )}
                        {crop.expectedYield && (
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Expected Yield:</span>
                            <span>{crop.expectedYield}</span>
                          </div>
                        )}
                      </div>

                      {crop.notes && (
                        <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <strong>Notes:</strong> {crop.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    🌾 {selectedFarmerDetail.cropSummary}
                  </p>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button onClick={() => setSelectedFarmerDetail(null)} className="btn btn-outline btn-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
