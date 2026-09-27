import React, { useState, useEffect } from 'react';
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
  Filter,
  Phone,
  CloudSun,
  ShoppingBag,
  MapPinned,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const CropAreaData = () => {
  const { t } = useLanguage();

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [selectedVillage, setSelectedVillage] = useState('All');
  const [searchFarmer, setSearchFarmer] = useState('');

  // Data states
  const [areaData, setAreaData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAreaData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.getAreaData({
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        taluka: selectedTaluka !== 'All' ? selectedTaluka : undefined,
        village: selectedVillage !== 'All' ? selectedVillage : undefined,
      });

      if (res.success && res.data) {
        setAreaData(res.data);
      }

      // Fetch regional weather for the selected filter
      const weatherLocation = selectedVillage !== 'All' ? selectedVillage : 
                             selectedTaluka !== 'All' ? selectedTaluka : 
                             selectedDistrict !== 'All' ? selectedDistrict : 'Maharashtra';
      
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

  useEffect(() => {
    loadAreaData();
  }, [selectedDistrict, selectedTaluka, selectedVillage]);

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
  ];

  // Filter farmer directory
  const farmerDirectory = areaData?.farmerDirectory || [];
  const filteredFarmers = farmerDirectory.filter((f) => {
    if (!searchFarmer) return true;
    const q = searchFarmer.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q) ||
      f.taluka.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.cropSummary.toLowerCase().includes(q)
    );
  });

  const cropBreakdown = areaData?.cropBreakdown || [];
  const maxAcreage = cropBreakdown.length > 0 ? Math.max(...cropBreakdown.map((c) => c.acreage)) : 1;

  // Options - use real data from backend
  const districtOptions = areaData?.options?.districts || ['All'];
  
  // Dynamic talukas based on selected district
  const talukaOptions = React.useMemo(() => {
    if (!areaData?.options?.talukasByDistrict) {
      return areaData?.options?.talukas || ['All'];
    }
    
    if (selectedDistrict === 'All') {
      return areaData.options.talukas || ['All'];
    }
    
    const districtTalukas = areaData.options.talukasByDistrict[selectedDistrict] || [];
    return ['All', ...districtTalukas];
  }, [areaData, selectedDistrict]);

  const villageOptions = areaData?.options?.villages || ['All'];

  return (
    <div style={{ padding: '2.5rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem', border: '1px solid #bbf7d0' }}>
            <TrendingUp size={16} />
            <span>Database Intelligence Engine</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{t('areaDataTitle')}</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '780px' }}>
            {t('areaDataDesc')}
          </p>
        </div>

        {/* Regional Filter Strip */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
            <Filter size={18} style={{ color: 'var(--primary-500)' }} />
            <span>{t('filter')}:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('district')}:</label>
            <select
              className="form-input"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedTaluka('All');
                setSelectedVillage('All');
              }}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            >
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Districts (सर्व जिल्हे)' : d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('taluka')}:</label>
            <select
              className="form-input"
              value={selectedTaluka}
              onChange={(e) => {
                setSelectedTaluka(e.target.value);
                setSelectedVillage('All');
              }}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
              disabled={selectedDistrict === 'All'}
            >
              {talukaOptions.map((tk) => (
                <option key={tk} value={tk}>
                  {tk === 'All' ? 'All Talukas (सर्व तालुके)' : tk}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('village')}:</label>
            <select
              className="form-input"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            >
              {villageOptions.map((v) => (
                <option key={v} value={v}>
                  {v === 'All' ? 'All Villages (सर्व गावे)' : v}
                </option>
              ))}
            </select>
          </div>

          {(selectedDistrict !== 'All' || selectedTaluka !== 'All' || selectedVillage !== 'All') && (
            <button
              onClick={() => {
                setSelectedDistrict('All');
                setSelectedTaluka('All');
                setSelectedVillage('All');
              }}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading area data...</p>
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
                  <div className="kpi-val">{areaData?.totalCultivatedAcres || 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Acres</span></div>
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
                    {t('mostCommonCrop')} ({areaData?.mostCommonCrop?.acreage || 0} ac • {areaData?.mostCommonCrop?.percentage || 0}%)
                  </div>
                </div>
              </div>

              {/* Least Commonly Grown Crop */}
              <div className="area-kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0288d1' }}>
                  <Layers size={28} />
                </div>
                <div>
                  <div className="kpi-val" style={{ fontSize: '1.25rem' }}>
                    {areaData?.leastCommonCrop?.cropName || 'Soyabean'}
                  </div>
                  <div className="kpi-lbl">
                    {t('leastCommonCrop')} ({areaData?.leastCommonCrop?.acreage || 0} ac • {areaData?.leastCommonCrop?.percentage || 0}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section: Acreage Bar Chart + Percentage Donut Chart */}
            <div className="chart-grid">
              {/* Chart 1: SVG Responsive Bar Chart */}
              <div className="chart-card">
                <h4>
                  <BarChart3 size={20} style={{ color: 'var(--primary-500)' }} />
                  <span>{t('cropDistributionChart')} (Acreage in Acres)</span>
                </h4>

                {cropBreakdown.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                    No crop data found for the selected area filter.
                  </p>
                ) : (
                  <div className="svg-bar-container">
                    {cropBreakdown.map((crop, idx) => {
                      const widthPercent = Math.max(8, Math.round((crop.acreage / maxAcreage) * 100));
                      const color = CHART_COLORS[idx % CHART_COLORS.length];

                      return (
                        <div key={crop.cropName} className="bar-row">
                          <span className="bar-label" title={crop.cropName}>
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
                          <span className="bar-val" style={{ color }}>
                            {crop.acreage} ac
                          </span>
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
                          <div key={crop.cropName} className="legend-item">
                            <span className="legend-dot" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                            <span style={{ fontSize: '0.8rem' }}>
                              {crop.cropName.split(' ')[0]}: <strong>{crop.percentage}%</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No data</p>
                  )}
                </div>

                {/* Regional Weather Snippet */}
                {weather && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0369a1', fontFamily: 'Outfit, sans-serif', display: 'block' }}>
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

            {/* Which Farmers Grow Which Crops Directory Table */}
            <div className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={22} style={{ color: 'var(--primary-500)' }} />
                    <span>{t('farmersDirectory')}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({filteredFarmers.length})</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Real-time farmer data registered in MongoDB for this region.
                  </p>
                </div>

                <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder={t('searchFarmers')}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    value={searchFarmer}
                    onChange={(e) => setSearchFarmer(e.target.value)}
                  />
                </div>
              </div>

              {filteredFarmers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  No farmers matching criteria in this region.
                </p>
              ) : (
                <div className="products-table-container" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>{t('farmerName')}</th>
                        <th>{t('location')}</th>
                        <th>Crops Cultivated</th>
                        <th>Total Land</th>
                        <th>Listings</th>
                        <th style={{ textAlign: 'right' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.map((farmer) => (
                        <tr key={farmer.id}>
                          <td>
                            <strong style={{ color: 'var(--text-main)', display: 'block' }}>{farmer.name}</strong>
                            <span className="badge badge-farmer" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                              Farmer
                            </span>
                            {farmer.location?.available && (
                              <span style={{ fontSize: '0.68rem', color: '#059669', marginLeft: '0.3rem' }}>
                                <MapPinned size={10} style={{ display: 'inline', marginRight: '2px' }} />
                                GPS
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                              <MapPin size={14} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
                              <span>
                                {farmer.village}, {farmer.taluka}, {farmer.district}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.88rem', color: 'var(--text-body)', fontWeight: 600 }}>
                              🌾 {farmer.cropSummary}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--primary-600)' }}>{farmer.totalAcreage}</strong>
                          </td>
                          <td>
                            {farmer.activeListingsCount > 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#059669' }}>
                                <ShoppingBag size={14} />
                                <strong>{farmer.activeListingsCount}</strong> active
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <a
                              href={`tel:${farmer.mobile}`}
                              className="btn btn-sm btn-outline"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                            >
                              <Phone size={12} />
                              <span>{farmer.mobile}</span>
                            </a>
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
      </div>
    </div>
  );
};
