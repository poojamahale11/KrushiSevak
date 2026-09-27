import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
      setError('');
    } catch (err) { setError(err.message || 'Could not load notifications.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await api.markNotificationRead(id); await load(); }
    catch (err) { setError(err.message || 'Could not update notification.'); }
  };

  const markAll = async () => {
    try { await api.markAllNotificationsRead(); await load(); }
    catch (err) { setError(err.message || 'Could not update notifications.'); }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', borderRadius: '999px', background: '#edf7f0', color: '#1b4332', fontWeight: 700, fontSize: '0.8rem' }}>
              <Bell size={15} /> Final
            </div>
            <h1 style={{ marginTop: '0.6rem' }}>Notifications</h1>
            <p style={{ color: 'var(--text-muted)' }}>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
          </div>
          {unreadCount > 0 && <button className="btn btn-outline" onClick={markAll}><CheckCheck size={16} /> Mark all as read</button>}
        </div>

        {error && <div style={{ padding: '0.8rem 1rem', background: '#fff1f2', color: '#be123c', borderRadius: '10px', marginBottom: '1rem' }}>{error}</div>}
        {loading ? <p>Loading notifications...</p> : notifications.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <Bell size={40} style={{ color: 'var(--primary-500)' }} />
            <h3 style={{ marginTop: '0.7rem' }}>No notifications yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>New orders and order status updates will appear here.</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n._id} style={{ background: n.read ? '#fff' : '#f0fdf4', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '1rem 1.1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShoppingBag size={18} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <strong>{n.title}</strong>
                <small style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              <p style={{ marginTop: '0.2rem', color: 'var(--text-muted)' }}>{n.message}</p>
              {!n.read && <button onClick={() => markRead(n._id)} className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }}>Mark as read</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
