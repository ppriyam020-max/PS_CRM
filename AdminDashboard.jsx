import React from 'react';
import { adminBookingsData } from '../data/mockData';

export default function AdminDashboard() {
  const getBadgeClass = (status) => {
    if (status === 'Confirmed') return 'badge-confirmed';
    if (status === 'Waiting') return 'badge-waiting';
    if (status === 'Pending') return 'badge-pending';
    return 'badge-confirmed';
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f3e1b' }}>Admin Dashboard</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overview & Mandi Center Operations</p>
        </div>
        <button className="btn-primary" onClick={() => alert('Exporting procurement report...')}>
          📥 Export Report
        </button>
      </div>

      {/* Stats row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Farmers</span>
            <span>👨‍🌾</span>
          </div>
          <div className="metric-value">1,250</div>
          <div className="metric-sub" style={{ color: 'var(--primary)' }}>+120 today</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Today's Bookings</span>
            <span>📅</span>
          </div>
          <div className="metric-value">340</div>
          <div className="metric-sub" style={{ color: 'var(--primary)' }}>+30 today</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Current Queue</span>
            <span>⏱️</span>
          </div>
          <div className="metric-value">45</div>
          <div className="metric-sub" style={{ color: 'var(--accent-gold)' }}>Live</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Completed Today</span>
            <span>✅</span>
          </div>
          <div className="metric-value">295</div>
          <div className="metric-sub" style={{ color: 'var(--primary)' }}>86.7% rate</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-title">
          <span>Recent Bookings & Gate Entries</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Real-time Mandi Flow</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Farmer Name</th>
                <th>Crop</th>
                <th>Slot Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminBookingsData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.token}</td>
                  <td>{row.farmer}</td>
                  <td>{row.crop}</td>
                  <td>{row.slot}</td>
                  <td>
                    <span className={`badge-status ${getBadgeClass(row.status)}`}>
                      ● {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
