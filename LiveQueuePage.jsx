import React, { useState, useEffect } from 'react';

export default function LiveQueuePage({ farmerData, onNavigate }) {
  const [currentPos, setCurrentPos] = useState(farmerData.queuePosition);
  const [estWait, setEstWait] = useState(farmerData.estimatedWait);

  // Real-time simulated queue progression
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPos((prev) => {
        if (prev > 1) {
          const next = prev - 1;
          setEstWait(next * 2);
          return next;
        }
        return prev;
      });
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.min(100, Math.round(((45 - currentPos) / 45) * 100));

  return (
    <div className="page-body">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => onNavigate('farmer-dashboard')} style={{ fontSize: '18px' }}>←</button>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f3e1b' }}>Live Queue Tracking</h2>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>🔄 Auto-updating live</span>
        </div>

        <div className="dashboard-grid-2">
          {/* Queue Status Box */}
          <div className="card">
            <h3 className="card-title">Your Queue Status</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Token Number</div>
              <div style={{ fontSize: '32px', font_weight: 800, color: 'var(--primary)' }}>{farmerData.token}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Position</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{currentPos}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total in Queue</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{farmerData.totalQueue}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Waiting Time</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-gold)' }}>{estWait} mins</div>
            </div>
          </div>

          {/* Queue Progress Visualizer */}
          <div className="card">
            <h3 className="card-title">Queue Progress</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>You are in the queue. Please wait for your turn.</p>

            <div className="queue-stepper">
              <div className="queue-track">
                <div className="queue-track-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="queue-node">
                <div className="queue-dot">1</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Queue Start</div>
              </div>
              <div className="queue-node active">
                <div className="queue-dot">{currentPos}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>Your Position</div>
              </div>
              <div className="queue-node">
                <div className="queue-dot" style={{ background: '#e2e8f0', color: '#64748b' }}>45</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>End</div>
              </div>
            </div>

            <div className="tip-banner">
              <span>💡</span>
              <span>Tip: You will receive an SMS and WhatsApp notification when your turn is next.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
