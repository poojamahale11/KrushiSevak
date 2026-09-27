import React, { useEffect, useMemo, useState } from 'react';
import { Store, MapPin, Phone, Search, PackageCheck, ShieldCheck, CalendarDays, Tag, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const categoryImages = {
  Seeds: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=900',
  Fertilizers: 'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=900',
  Pesticides: 'https://images.pexels.com/photos/4022090/pexels-photo-4022090.jpeg?auto=compress&cs=tinysrgb&w=900',
  Urea: 'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Equipment & Tools': 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Other agricultural products': 'https://images.pexels.com/photos/5503272/pexels-photo-5503272.jpeg?auto=compress&cs=tinysrgb&w=900',
};
const imageFor = p => p.imageUrl || categoryImages[p.category] || categoryImages.Seeds;
const dateText = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not provided';

export const KrushiSevaKendra = () => {
  const { t } = useLanguage();
  const [kendras, setKendras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [district, setDistrict] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const load = async () => {
    try { setLoading(true); const res = await api.getKendras({ search: searchTerm, district }); if (res.success) setKendras(res.kendras || []); }
    catch (e) { console.error('Kendra directory error:', e); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [searchTerm, district]);

  const districts = useMemo(() => ['All', ...Array.from(new Set(kendras.map(k => k.district).filter(Boolean))).sort()], [kendras]);
  const products = useMemo(() => kendras.flatMap(k => (k.products || []).map(p => ({ ...p, kendra: k }))).filter(p => category === 'All' || p.category === category), [kendras, category]);

  return <div style={{ background:'var(--bg-app)', minHeight:'80vh', padding:'2rem 0 5rem' }}>
    <div className="container">
      <section className="placeholder-hero" style={{ paddingBottom:'2rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'.35rem .8rem', borderRadius:999, background:'#fff7ed', color:'#b45309', border:'1px solid #fed7aa', fontWeight:750, fontSize:'.82rem' }}><Store size={16}/> Registered Krushi Seva Kendras</div>
        <h1 style={{ marginTop:'.8rem' }}>Find Agricultural Products Near You</h1>
        <p>Check product availability, price, stock, expiry date and registered Kendra details. <strong>No online purchasing is required here.</strong></p>
        <div style={{ maxWidth:760, margin:'1.4rem auto 0', display:'grid', gridTemplateColumns:'1fr auto auto', gap:8 }}>
          <div style={{ position:'relative' }}><Search size={18} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/><input className="form-input" style={{ paddingLeft:'2.6rem' }} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search Kendra, product, brand or district..." /></div>
          <select className="form-input" value={category} onChange={e=>setCategory(e.target.value)}><option>All</option><option>Seeds</option><option>Fertilizers</option><option>Pesticides</option><option>Urea</option><option>Equipment & Tools</option><option>Other agricultural products</option></select>
          <select className="form-input" value={district} onChange={e=>setDistrict(e.target.value)}>{districts.map(d=><option key={d}>{d}</option>)}</select>
        </div>
      </section>

      <section style={{ marginBottom:'3rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'end', gap:1, marginBottom:'1.1rem', flexWrap:'wrap' }}><div><h2 style={{ marginBottom:'.25rem' }}>Available Products</h2><p style={{ color:'var(--text-muted)', fontSize:'.88rem' }}>Live inventory published by registered Kendra owners.</p></div><span className="badge badge-storeOwner">{products.length} products</span></div>
        {loading ? <div className="dash-card" style={{ textAlign:'center', padding:'3rem' }}>Loading Kendra inventory...</div> : products.length === 0 ? <div className="dash-card" style={{ textAlign:'center', padding:'3rem' }}><PackageCheck size={44} style={{ margin:'0 auto .8rem', color:'#d97706' }}/><h3>No matching products</h3><p style={{ color:'var(--text-muted)' }}>Registered Kendras will appear here when they publish inventory.</p></div> :
          <div className="kendra-product-grid">{products.map(p => {
            const available = !p.isOutOfStock && Number(p.stockQuantity) > 0;
            return <article className="kendra-product-card" key={`${p.kendra._id}-${p._id}`}>
              <img className="kendra-product-image" src={imageFor(p)} alt={p.name} onError={e=>{e.currentTarget.src=categoryImages.Seeds;}} />
              <div className="kendra-product-body">
                <div style={{ display:'flex', justifyContent:'space-between', gap:8, alignItems:'center' }}><span className="crop-category-badge" style={{ background:'#fff7ed', color:'#9a3412', borderColor:'#fed7aa' }}>{p.category}</span><span className={`stock-badge ${available?'in-stock':'out-of-stock'}`}>{available ? 'Available' : 'Out of Stock'}</span></div>
                <h3 style={{ margin:'.75rem 0 .2rem' }}>{p.name}</h3>
                {p.brand && <div style={{ color:'var(--text-muted)', fontSize:'.78rem' }}>Brand: {p.brand}</div>}
                <div className="kendra-price" style={{ marginTop:'.75rem' }}>₹{Number(p.price || 0).toLocaleString('en-IN')} <span style={{ fontSize:'.78rem', fontWeight:600, color:'var(--text-muted)' }}>/ {p.unit}</span></div>
                <div className="kendra-meta"><span>{available ? `${p.stockQuantity} ${p.unit} in stock` : 'Currently unavailable'}</span><span><CalendarDays size={13}/> {dateText(p.expiryDate)}</span></div>
                <div className="kendra-availability"><div style={{ minWidth:0 }}><strong style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.kendra.shopName || p.kendra.name}</strong><span style={{ fontSize:'.75rem', color:'var(--text-muted)' }}><MapPin size={12}/> {p.kendra.district || 'Maharashtra'}</span></div><button className="btn btn-sm btn-outline" onClick={()=>setSelectedProduct(p)}>Check Availability</button></div>
              </div>
            </article>;
          })}</div>}
      </section>

      <section>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}><div><h2>Registered Kendra Directory</h2><p style={{ color:'var(--text-muted)', fontSize:'.88rem' }}>See which registered Kendras are active and what products they currently list.</p></div></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:'1rem' }}>{kendras.map(k=><div className="kendra-store-card" key={k._id}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}><div style={{ width:44,height:44,borderRadius:13,background:'#fff7ed',color:'#c2410c',display:'grid',placeItems:'center' }}><Store size={22}/></div><span className="stock-badge in-stock"><ShieldCheck size={13}/> Registered</span></div>
          <h3 style={{ marginTop:'.8rem' }}>{k.shopName || `${k.name}'s Kendra`}</h3><p style={{ fontSize:'.84rem', color:'var(--text-muted)' }}>Proprietor: <strong>{k.name}</strong></p>
          <p style={{ fontSize:'.84rem', margin:'.5rem 0' }}><MapPin size={14} style={{ verticalAlign:'middle' }}/> {k.shopAddress || 'Address not provided'}{k.district ? `, ${k.district}` : ''}</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginTop:'.8rem' }}><span style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>{(k.products || []).length} listed products</span>{(k.shopContact || k.mobile) && <a href={`tel:${k.shopContact || k.mobile}`} className="btn btn-sm btn-outline"><Phone size={14}/> Call</a>}</div>
        </div>)}</div>
      </section>
    </div>

    {selectedProduct && <div className="modal-overlay" onClick={()=>setSelectedProduct(null)}><div className="modal-box" onClick={e=>e.stopPropagation()} style={{ maxWidth:520 }}>
      <div className="modal-header"><h3>Availability Check</h3><button className="modal-close-btn" onClick={()=>setSelectedProduct(null)}><X size={20}/></button></div>
      <img src={imageFor(selectedProduct)} alt={selectedProduct.name} style={{ width:'100%', height:180, objectFit:'cover', borderRadius:12, marginBottom:16 }}/>
      <h2 style={{ marginBottom:4 }}>{selectedProduct.name}</h2><p style={{ color:'var(--text-muted)' }}>{selectedProduct.brand || selectedProduct.category}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'1rem 0' }}><div className="dash-card"><small>Price</small><strong>₹{selectedProduct.price} / {selectedProduct.unit}</strong></div><div className="dash-card"><small>Stock</small><strong>{selectedProduct.stockQuantity} {selectedProduct.unit}</strong></div><div className="dash-card"><small>Expiry</small><strong>{dateText(selectedProduct.expiryDate)}</strong></div><div className="dash-card"><small>Status</small><strong style={{ color:selectedProduct.isOutOfStock ? '#dc2626':'#15803d' }}>{selectedProduct.isOutOfStock ? 'Out of Stock':'Available'}</strong></div></div>
      <div style={{ padding:'1rem', background:'#f8faf8', borderRadius:12 }}><strong>{selectedProduct.kendra.shopName || selectedProduct.kendra.name}</strong><p style={{ fontSize:'.85rem', color:'var(--text-muted)', margin:'.3rem 0' }}><MapPin size={14}/> {selectedProduct.kendra.shopAddress || 'Address not provided'}</p><p style={{ fontSize:'.85rem', color:'var(--text-muted)' }}><Phone size={14}/> {selectedProduct.kendra.shopContact || selectedProduct.kendra.mobile || 'Contact not provided'}</p></div>
      <div style={{ marginTop:14, display:'flex', justifyContent:'flex-end', gap:8 }}>{(selectedProduct.kendra.shopContact || selectedProduct.kendra.mobile) && <a href={`tel:${selectedProduct.kendra.shopContact || selectedProduct.kendra.mobile}`} className="btn btn-primary"><Phone size={16}/> Call Kendra</a>}<button className="btn btn-outline" onClick={()=>setSelectedProduct(null)}>Close</button></div>
    </div></div>}
  </div>;
};
