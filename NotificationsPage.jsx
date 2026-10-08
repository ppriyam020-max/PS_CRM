import React, { useState } from 'react';
import { notificationsData } from '../data/mockData';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(notificationsData);

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <div className="page-body">
      <div className="card" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f3e1b' }}>Notifications</h2>
          <button 
            style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}
            onClick={() => alert('All notifications marked as read.')}
          >
            Mark all as read
          </button>
        </div>

        <div className="filter-pills">
          <button className={`pill-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          <button className={`pill-btn ${filter === 'sms' ? 'active' : ''}`} onClick={() => setFilter('sms')}>
            SMS
          </button>
          <button className={`pill-btn ${filter === 'whatsapp' ? 'active' : ''}`} onClick={() => setFilter('whatsapp')}>
            WhatsApp
          </button>
          <button className={`pill-btn ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>
            System
          </button>
        </div>

        <div>
          {filtered.map((n) => (
            <div key={n.id} className="notification-item">
              <div className="notif-icon">{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-dark)', marginBottom: '2px' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                  {n.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
