import React, { useState } from 'react';

export default function RegisterPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: 'priyam',
    mobile: '8081052909',
    village: 'meerut',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    crop: 'Wheat',
    landArea: '4.5'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate('farmer-dashboard');
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: 'calc(100vh - 72px)' }}>
      <div className="auth-card-container" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="brand-logo" style={{ justifyContent: 'center' }} onClick={() => onNavigate('landing')}>
            <span>🌾</span> <span>KISAN BANDHU</span>
          </div>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Join Kisan Bandhu today for smart procurement
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter full name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              className="form-control"
              placeholder="Enter mobile number"
              required
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Village</label>
            <input
              type="text"
              name="village"
              className="form-control"
              placeholder="Enter village"
              required
              value={formData.village}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">District</label>
              <select name="district" className="form-control" value={formData.district} onChange={handleChange}>
                <option>Meerut</option>
                <option>Ghaziabad</option>
                <option>Hapur</option>
                <option>Muzaffarnagar</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <select name="state" className="form-control" value={formData.state} onChange={handleChange}>
                <option>Uttar Pradesh</option>
                <option>Haryana</option>
                <option>Punjab</option>
                <option>Madhya Pradesh</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Crop Type</label>
              <select name="crop" className="form-control" value={formData.crop} onChange={handleChange}>
                <option>Wheat</option>
                <option>Rice / Paddy</option>
                <option>Mustard</option>
                <option>Sugarcane</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Land Area (in acres)</label>
              <input
                type="number"
                name="landArea"
                className="form-control"
                placeholder="e.g. 5"
                required
                value={formData.landArea}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary register-submit"
          >
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <a href="#login" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
