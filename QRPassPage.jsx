import React from 'react';

export default function QRPassPage({ farmerData, onNavigate }) {
  return (
    <div className="page-body">
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div className="brand-logo" onClick={() => onNavigate('farmer-dashboard')}>
            <span>🌾</span> <span>KISAN BANDHU</span>
          </div>
          <button onClick={() => onNavigate('farmer-dashboard')} style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            ✕ Close
          </button>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Your QR Entry Pass</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Official Gate Verification Pass
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="qr-box" style={{ width: '180px', height: '180px' }}>
            <svg width="160" height="160" viewBox="0 0 100 100">
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
              <rect x="10" y="42" width="8" height="8" fill="#0f3e1b" />
              <rect x="25" y="42" width="8" height="8" fill="#0f3e1b" />
              <rect x="42" y="42" width="16" height="16" fill="#0f3e1b" />
              <rect x="65" y="42" width="8" height="8" fill="#0f3e1b" />
              <rect x="80" y="42" width="8" height="8" fill="#0f3e1b" />
              <rect x="42" y="65" width="8" height="8" fill="#0f3e1b" />
              <rect x="55" y="75" width="15" height="15" fill="#0f3e1b" />
              <rect x="75" y="75" width="15" height="15" fill="#0f3e1b" />
            </svg>
          </div>
        </div>

        <div className="procurement-details-list" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div className="detail-row">
            <span className="detail-label">Token Number</span>
            <span className="detail-val" style={{ color: 'var(--primary)', fontSize: '16px' }}>{farmerData.token}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Crop</span>
            <span className="detail-val">{farmerData.crop}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Center</span>
            <span className="detail-val">{farmerData.center}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-val">{farmerData.date}</span>
          </div>
          <div className="detail-row" style={{ border: 'none' }}>
            <span className="detail-label">Slot Time</span>
            <span className="detail-val">{farmerData.slotTime}</span>
          </div>
        </div>

        <div className="tip-banner" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <span>🛡️ Show this QR code at the center for quick entry</span>
        </div>

        <button className="btn-secondary" style={{ width: '100%' }} onClick={() => window.print()}>
          🖨️ Download / Print Pass
        </button>
      </div>
    </div>
  );
}
