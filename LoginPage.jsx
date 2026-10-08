import React, { useState } from 'react';

export default function LoginPage({ onNavigate }) {
  const [mobile, setMobile] = useState('8081052909');
  const [password, setPassword] = useState('priyam123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate('farmer-dashboard');
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: 'calc(100vh - 72px)' }}>
      <div className="auth-card-container">
        <div className="auth-header">
          <div className="brand-logo" style={{ justifyContent: 'center' }} onClick={() => onNavigate('landing')}>
            <span>🌾</span> <span>KISAN BANDHU</span>
          </div>
          <h2>Welcome Back!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Login to continue to your farmer portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="Enter 10-digit mobile number" 
              required 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot Password?
              </a>
            </div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            Login
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          type="button" 
          className="btn-secondary" 
          style={{ width: '100%', padding: '12px', fontWeight: 600 }}
          onClick={() => onNavigate('farmer-dashboard')}
        >
          📲 Login with OTP
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          New farmer?{' '}
          <a href="#register" onClick={(e) => { e.preventDefault(); onNavigate('register'); }} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
