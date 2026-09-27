import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { api } from '../services/api';

export const Feedback = () => {
  const [rating,setRating]=useState(5); const [message,setMessage]=useState(''); const [category,setCategory]=useState('General'); const [history,setHistory]=useState([]); const [msg,setMsg]=useState('');
  const load=async()=>{ try{const r=await api.getMyFeedback(); if(r.success)setHistory(r.feedback||[]);}catch(e){} };
  useEffect(()=>{load();},[]);
  const submit=async(e)=>{e.preventDefault();setMsg('');try{const r=await api.sendFeedback({rating,message,category});setMsg(r.message);setMessage('');await load();}catch(e){setMsg(e.message);}};
  return <div className="container" style={{maxWidth:850,padding:'2rem 1rem'}}><div className="card" style={{padding:'1.5rem'}}><h1>Feedback & Rating</h1><p style={{color:'var(--text-muted)'}}>Help us improve KrushiSevak.</p><form onSubmit={submit} style={{display:'grid',gap:14}}><div><label>Rating</label><div style={{display:'flex',gap:5,marginTop:6}}>{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)} style={{border:0,background:'transparent',cursor:'pointer',padding:3}}><Star size={28} fill={n<=rating?'currentColor':'none'} /></button>)}</div></div><div><label>Category</label><select value={category} onChange={e=>setCategory(e.target.value)}><option>General</option><option>Marketplace</option><option>Disease Detection</option><option>Krushi Seva Kendra</option><option>Weather</option></select></div><div><label>Message</label><textarea required maxLength={500} rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us what you liked or what can be improved..." /></div><button className="btn btn-primary" type="submit">Submit Feedback</button>{msg&&<div>{msg}</div>}</form>{history.length>0&&<div style={{marginTop:25}}><h3>Your previous feedback</h3>{history.slice(0,5).map(f=><div key={f._id} style={{padding:'10px 0',borderTop:'1px solid var(--border-light)'}}><b>{'★'.repeat(f.rating)}</b> · {f.category}<div>{f.message}</div></div>)}</div>}</div></div>;
};
