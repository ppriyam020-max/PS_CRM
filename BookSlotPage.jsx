import React, { useState } from 'react';
import { availableSlots } from '../data/mockData';

export default function BookSlotPage({ onNavigate, onSlotBooked }) {
  const [selectedCrop, setSelectedCrop] = useState('Wheat (Kanak)');
  const [selectedCenter, setSelectedCenter] = useState('Meerut Central Mandi');
  const [selectedDate, setSelectedDate] = useState('2026-08-31');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');
  const [load, setLoad] = useState('45');

  const handleBooking = (e) => {
    e.preventDefault();
    onSlotBooked({
      crop: selectedCrop,
      center: selectedCenter,
      date: selectedDate,
      slotTime: selectedSlot,
      quantity: `${load} Quintals`
    });
    alert(`Slot confirmed for ${selectedSlot} at ${selectedCenter}!`);
    onNavigate('qr-pass');
  };

  return (
    <div className="page-body">
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <button onClick={() => onNavigate('farmer-dashboard')} style={{ fontSize: '18px' }}>←</button>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#194a26' }}>Book Procurement Slot</h2>
        </div>

        <div className="booking-form-grid">
          {/* Left Form controls */}
          <div>
            <div className="form-group">
              <label className="form-label">Select Crop</label>
              <select className="form-control" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                <option>Wheat (Kanak)</option>
                <option>Paddy / Rice (Basmati)</option>
                <option>Mustard (Sarson)</option>
                <option>Maize (Makka)</option>
                <option>Barley (Jau)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Procurement Center</label>
              <select className="form-control" value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
                <option>Azamgarh Central Mandi</option>
                <option>Hapur Grain Market</option>
                <option>Ghaziabad APMC Center</option>
                <option>Modinagar Sub-Center</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Load (Quintals)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 50" 
                value={load}
                onChange={(e) => setLoad(e.target.value)}
              />
            </div>
          </div>

          {/* Right Slots selection */}
          <div>
            <label className="form-label">Available Slots</label>
            <div className="slots-time-list">
              {availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`slot-time-item ${selectedSlot === slot.time ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot.time)}
                >
                  <span>🕒 {slot.time}</span>
                  <span className={`badge-status ${slot.badge}`}>{slot.status}</span>
                </div>
              ))}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '24px', padding: '14px' }}
              onClick={handleBooking}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
