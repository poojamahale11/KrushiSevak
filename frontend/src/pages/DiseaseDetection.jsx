import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, Upload, Camera, CheckCircle2, RotateCcw, History } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DiseaseDetection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    if (user?.role !== 'farmer') return;
    try {
      const data = await api.getDiseaseHistory();
      setHistory(data.detections || []);
    } catch (_) {}
  };

  useEffect(() => { loadHistory(); }, [user?.role]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(''); setResult(null);
    if (!file.type.startsWith('image/')) return setError('Please select a valid image file.');
    if (file.size > 8 * 1024 * 1024) return setError('Image must be smaller than 8 MB.');
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const analyzeImage = async () => {
    if (!selectedImage) return setError('First select a crop/leaf image from your gallery.');
    if (user?.role !== 'farmer') return setError('Please sign in as a Farmer to use disease detection.');
    setAnalyzing(true); setError(''); setResult(null);
    try {
      const data = await api.analyzeDisease(selectedImage);
      setResult(data.detection);
      await loadHistory();
    } catch (err) {
      setError(err.message || 'Unable to analyze image. Please try again.');
    } finally { setAnalyzing(false); }
  };

  const reset = () => { setSelectedImage(null); setPreview(''); setResult(null); setError(''); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <div style={{ padding: '3rem 0 5rem', background: 'var(--bg-app)', minHeight: '80vh' }}>
      <div className="container">
        <div className="placeholder-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem', background: '#fee2e2', color: '#b91c1c', padding: '.3rem .8rem', borderRadius: '999px', fontSize: '.82rem', fontWeight: 700, marginBottom: '1rem' }}><Sparkles size={16} /> AI Crop Doctor</div>
          <h1>{t('diseaseDetection')} & Treatment Advisory</h1>
          <p>Farmer can select a crop/leaf photo directly from the phone gallery or computer. The image is uploaded securely and sent to the disease-analysis API.</p>

          {user?.role !== 'farmer' && <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '1rem', borderRadius: 12, maxWidth: 600, margin: '0 auto 1rem' }}>🔐 Please <Link to="/login/farmer">Sign in as Farmer</Link> to analyze crop images.</div>}

          <div style={{ background: '#fff', border: '2px dashed #93c5fd', borderRadius: 16, padding: '2rem 1.5rem', maxWidth: 560, margin: '0 auto 2rem', textAlign: 'center' }}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
            {preview ? <img src={preview} alt="Selected crop" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12, marginBottom: 16, background: '#f8fafc' }} /> : <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><Camera size={34} /></div>}
            <h3>{preview ? 'Crop image selected' : 'Upload Crop / Leaf Photo'}</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>JPG, PNG or WEBP • Maximum 8 MB</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => inputRef.current?.click()}><Upload size={18} /> Choose from Gallery</button>
              {preview && <button className="btn btn-primary" onClick={analyzeImage} disabled={analyzing}>{analyzing ? <><Activity className="animate-spin" size={18} /> Analyzing...</> : <><Sparkles size={18} /> Analyze Image</>}</button>}
              {preview && <button className="btn btn-sm btn-outline" onClick={reset}><RotateCcw size={16} /> Reset</button>}
            </div>
            {error && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '.75rem', borderRadius: 8, marginTop: 14, fontSize: '.9rem' }}>{error}</div>}
          </div>

          {result && <div style={{ background: '#fff', border: '1px solid #86efac', borderRadius: 16, padding: '2rem', maxWidth: 650, margin: '0 auto 2rem', textAlign: 'left', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 15, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
              <div><span style={{ fontSize: '.8rem', color: '#15803d', fontWeight: 700 }}><CheckCircle2 size={15} style={{ verticalAlign: 'middle' }} /> ANALYSIS COMPLETE • {result.confidence}%</span><h3 style={{ color: '#b91c1c', margin: '.3rem 0' }}>{result.disease}</h3><span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Crop: <strong>{result.crop}</strong></span></div>
              <span className="stock-badge low-stock">{result.severity}</span>
            </div>
            {result.annotatedImageUrl && <img src={result.annotatedImageUrl} alt="Model detections outlined on the uploaded crop image" style={{ width: '100%', maxHeight: 360, objectFit: 'contain', marginTop: 16, borderRadius: 8, background: '#f8fafc' }} />}
            {result.detections?.length > 0 && <div style={{ marginTop: 12 }}><h4>Detected Objects</h4><ul>{result.detections.map((item, index) => <li key={`${item.className}-${index}`} style={{ marginBottom: 6 }}>{item.className} • {(item.confidence * 100).toFixed(1)}% confidence</li>)}</ul></div>}
            <h4 style={{ marginTop: 18 }}>Recommended Treatment</h4><ul>{result.treatment?.map((item, i) => <li key={i} style={{ marginBottom: 7 }}>{item}</li>)}</ul>
            <h4>Prevention</h4><ul>{result.prevention?.map((item, i) => <li key={i} style={{ marginBottom: 7 }}>{item}</li>)}</ul>
            <Link to="/krushi-seva-kendra" className="btn btn-sm btn-outline">Find Products in Kendra →</Link>
          </div>}

          {history.length > 0 && <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}><h3><History size={20} style={{ verticalAlign: 'middle' }} /> My Detection History</h3>{history.slice(0, 5).map((item) => <div key={item._id} style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 12, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', gap: 10 }}><span><strong>{item.disease}</strong><br /><small>{item.originalFileName}</small></span><span>{item.confidence}%</span></div>)}</div>}

          <div className="feature-preview-grid" style={{ marginTop: 35 }}><div className="feature-preview-card"><h4>📷 Gallery Upload</h4><p>Select an existing crop photo from mobile gallery or computer.</p></div><div className="feature-preview-card"><h4>🤖 116-Class Plant Model</h4><p>YOLOv11 detects plant classes and marks detected objects in the uploaded image.</p></div><div className="feature-preview-card"><h4>📝 Detection History</h4><p>Every farmer's analysis is saved separately in MongoDB.</p></div></div>
        </div>
      </div>
    </div>
  );
};
