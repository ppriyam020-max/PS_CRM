import React from 'react';

export default function FarmerDashboard({ farmerData, onNavigate }) {
  return (
    <div className="page-body">
      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Token Number</span>
            <span>🎫</span>
          </div>
          <div className="metric-value">{farmerData.token}</div>
          <div className="metric-sub">Today</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Queue Position</span>
            <span>👥</span>
          </div>
          <div className="metric-value">{farmerData.queuePosition}</div>
          <div className="metric-sub">{farmerData.queuePosition - 1} before you</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Estimated Waiting Time</span>
            <span>⏱️</span>
          </div>
          <div className="metric-value">{farmerData.estimatedWait} mins</div>
          <div className="metric-sub">At your center</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Booking Status</span>
            <span>✅</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-confirmed)', fontSize: '22px' }}>
            {farmerData.status}
          </div>
          <div className="metric-sub">Verified for Entry</div>
        </div>
      </div>

      {/* 2 Column Details */}
      <div className="dashboard-grid-2">
        {/* Today's Procurement */}
        <div className="card">
          <div className="card-title">
            <span>Today's Procurement</span>
            <span className="badge-status badge-confirmed">● Active Slot</span>
          </div>
          <div className="procurement-details-list">
            <div className="detail-row">
              <span className="detail-label">Crop</span>
              <span className="detail-val">{farmerData.crop}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Procurement Center</span>
              <span className="detail-val">{farmerData.center}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-val">{farmerData.date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Slot Time</span>
              <span className="detail-val">{farmerData.slotTime}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estimated Quantity</span>
              <span className="detail-val">{farmerData.quantity}</span>
            </div>
            <div className="detail-row" style={{ border: 'none' }}>
              <span className="detail-label">Status</span>
              <span className="detail-val" style={{ color: 'var(--primary)' }}>{farmerData.status}</span>
            </div>
          </div>
        </div>

        {/* QR Entry Pass Widget */}
        <div className="card">
          <div className="card-title">
            <span>Your QR Entry Pass</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Token: {farmerData.token}</span>
          </div>
          <div className="qr-card-center">
            <div className="qr-box">
              <svg width="120" height="120" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                <rect x="5" y="5" width="30" height="30" fill="#0f3e1b" />
                <rect x="10" y="10" width="20" height="20" fill="white" />
                <rect x="15" y="15" width="10" height="10" fill="#0f3e1b" />
                <rect x="65" y="5" width="30" height="30" fill="#0f3e1b" />
                <rect x="70" y="10" width="20" height="20" fill="white" />
                <rect x="75" y="15" width="10" height="10" fill="#0f3e1b" />
                <rect x="5" y="65" width="30" height="30" fill="#0f3e1b" />
                <rect x="10" y="70" width="20" height="20" fill="white" />
                <rect x="15" y="75" width="10" height="10" fill="#0f3e1b" />
                <rect x="42" y="10" width="8" height="8" fill="#0f3e1b" />
                <rect x="42" y="25" width="8" height="8" fill="#0f3e1b" />
                <rect x="10" y="42" width="8" height="8" fill="#134620" />
                <rect x="25" y="42" width="8" height="8" fill="#0f3e1b" />
                <rect x="42" y="42" width="16" height="16" fill="#0f3e1b" />
                <rect x="65" y="42" width="8" height="8" fill="#0f3e1b" />
                <rect x="80" y="42" width="8" height="8" fill="#0f3e1b" />
                <rect x="42" y="65" width="8" height="8" fill="#0f3e1b" />
                <rect x="55" y="75" width="15" height="15" fill="#0f3e1b" />
                <rect x="75" y="75" width="15" height="15" fill="#0f3e1b" />
              </svg>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Show this QR pass at the entrance gate for instant gate pass generation.
            </p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('qr-pass')}>
              View Full Screen Pass
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-dark)' }}>
        Quick Actions
      </h3>
      <div className="quick-actions-grid">
        <div className="action-tile" onClick={() => onNavigate('book-slot')}>
          <div className="action-tile-icon">➕</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Book New Slot</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose Mandi & Date</div>
          </div>
        </div>
        <div className="action-tile" onClick={() => onNavigate('live-queue')}>
          <div className="action-tile-icon">⏱️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Live Queue</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time status</div>
          </div>
        </div>
        <div className="action-tile" onClick={() => onNavigate('notifications')}>
          <div className="action-tile-icon">💳</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Payment Status</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct Bank Transfer</div>
          </div>
        </div>
        <div className="action-tile" onClick={() => onNavigate('qr-pass')}>
          <div className="action-tile-icon">👤</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Farmer Pass</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Digital ID & Token</div>
          </div>
        </div>
      </div>
    </div>
  );
}
