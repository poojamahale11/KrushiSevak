import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sprout, Mic, MicOff, ImagePlus, X, User, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const quickRepliesByLang = {
  mr: [
    { icon: '🌿', text: 'कपाशीवरील बोंडअळी उपाय' },
    { icon: '🧪', text: 'उसासाठी योग्य खत मात्रा' },
    { icon: '🌧️', text: 'आजचे हवामान आणि फवारणी' },
    { icon: '🌾', text: 'सोयाबीन बाजारभाव आज' },
  ],
  hi: [
    { icon: '🌿', text: 'फसल कीट एवं रोग नियंत्रण' },
    { icon: '🧪', text: 'गेहूं के लिए उर्वरक मात्रा' },
    { icon: '🌧️', text: 'मौसम पूर्वानुमान और छिड़काव' },
    { icon: '🌾', text: 'आज का मंडी भाव' },
  ],
  en: [
    { icon: '🌿', text: 'Crop pest & disease treatment' },
    { icon: '🧪', text: 'Fertilizer dosage guide' },
    { icon: '🌧️', text: 'Weather & spraying advisory' },
    { icon: '🌾', text: 'Marketplace price trends' },
  ],
};

export const AgriAssistant = () => {
  const { lang } = useLanguage();
  const greeting =
    lang === 'mr'
      ? 'नमस्कार! मी Krushi AI Assistant आहे. शेती, पीक, हवामान किंवा खतांशी संबंधित कोणताही प्रश्न विचारा.'
      : lang === 'hi'
      ? 'नमस्ते! मैं Krushi AI Assistant हूँ। खेती, फसल, मौसम या उर्वरक से जुड़ा कोई भी सवाल पूछें।'
      : 'Hello! I am Krushi AI Assistant. Ask me any question about farming, crops, weather, or fertilizers.';

  const [messages, setMessages] = useState([{ from: 'bot', text: greeting }]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [image, setImage] = useState(null);

  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    let active = true;
    api
      .getChatHistory()
      .then((r) => {
        const h = (r.history || []).slice().reverse();
        if (active && h.length) {
          setMessages(
            h.flatMap((x) => [
              { from: 'user', text: x.question },
              { from: 'bot', text: x.answer },
            ])
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lang]);

  const send = async (e, customText = null) => {
    e?.preventDefault();
    const query = (customText !== null ? customText : question).trim();
    if ((!query && !image) || loading) return;

    const preview = image;
    setMessages((m) => [
      ...m,
      { from: 'user', text: query || 'Image attached', image: preview?.url },
    ]);
    setQuestion('');
    setImage(null);
    setLoading(true);

    try {
      const r = await api.chat(query, lang, preview?.data || '');
      setMessages((m) => [...m, { from: 'bot', text: r.answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: 'bot', text: err.message || 'Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const voice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    const rec = new SR();
    rec.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => setQuestion(e.results[0][0].transcript);
    rec.start();
  };

  const pickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return alert('Please select an image file.');
    if (f.size > 7 * 1024 * 1024) return alert('Image must be under 7 MB.');
    const reader = new FileReader();
    reader.onload = () =>
      setImage({ data: reader.result, url: URL.createObjectURL(f), name: f.name });
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const activeQuickReplies = quickRepliesByLang[lang] || quickRepliesByLang.en;

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '82vh', padding: '2rem 1rem 5rem' }}>
      <div className="container chat-container">
        <div className="chat-card">
          {/* Chat Header */}
          <header className="chat-header">
            <div className="chat-avatar-bot">
              <Bot size={26} />
              <div className="chat-online-badge" title="Online" />
            </div>
            <div className="chat-header-info">
              <h1 className="chat-header-title">
                <span>Krushi AI Assistant</span>
                <Sparkles size={18} style={{ color: '#fde047' }} />
              </h1>
              <p className="chat-header-desc">
                Smart Farmer Advisor • Text • Voice • Image Diagnosis
              </p>
            </div>
          </header>

          {/* Messages Container */}
          <div className="chat-messages-area">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-row ${m.from === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
              >
                <div
                  className={`chat-avatar ${
                    m.from === 'user' ? 'chat-avatar-user-ic' : 'chat-avatar-bot-ic'
                  }`}
                >
                  {m.from === 'user' ? <User size={16} /> : <Bot size={17} />}
                </div>
                <div
                  className={`chat-bubble ${
                    m.from === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                  }`}
                >
                  {m.image && (
                    <img src={m.image} alt="Attached" className="chat-bubble-image" />
                  )}
                  {m.text}
                </div>
              </div>
            ))}

            {/* Loading / Thinking indicator */}
            {loading && (
              <div className="chat-row chat-row-bot">
                <div className="chat-avatar chat-avatar-bot-ic">
                  <Bot size={17} />
                </div>
                <div className="chat-bubble chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Krushi AI is analyzing</span>
                  <div className="typing-dots">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Farmer Quick Replies Suggestions */}
          <div className="chat-quick-replies">
            <span className="chat-quick-label">
              <HelpCircle size={14} /> Quick Questions:
            </span>
            {activeQuickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-reply-btn"
                onClick={() => send(null, qr.text)}
              >
                <span>{qr.icon}</span>
                <span>{qr.text}</span>
              </button>
            ))}
          </div>

          {/* Image Preview Bar */}
          {image && (
            <div className="chat-image-preview-bar">
              <img
                src={image.url}
                alt="preview"
                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10 }}
              />
              <span style={{ fontSize: '0.84rem', fontWeight: 600, flex: 1, color: '#166534' }}>
                📷 {image.name}
              </span>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="btn btn-sm btn-outline"
                style={{ padding: '0.2rem 0.6rem' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input & Action Form */}
          <form onSubmit={(e) => send(e)} className="chat-input-form">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickImage}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => fileRef.current?.click()}
              title="Attach crop image for diagnosis"
            >
              <ImagePlus size={20} />
            </button>

            <input
              className="chat-input-field"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'शेतीबद्दल प्रश्न विचारा किंवा बोला...'
                  : lang === 'hi'
                  ? 'खेती से जुड़ा सवाल पूछें...'
                  : 'Ask any farming question...'
              }
            />

            <button
              type="button"
              className={`chat-action-btn ${listening ? 'listening' : ''}`}
              onClick={voice}
              title="Voice input"
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button className="chat-send-btn" type="submit" disabled={loading}>
              <Send size={16} />
              <span>Ask</span>
            </button>
          </form>

          {/* Disclaimer Footer */}
          <div className="chat-disclaimer">
            <Sprout size={13} style={{ color: 'var(--primary-600)' }} />
            <span>
              For pesticides/fertilizers, confirm product dosage from official approved labels or local agro-expert.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

