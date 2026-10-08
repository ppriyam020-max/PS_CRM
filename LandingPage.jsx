import React, { useState } from 'react';

export default function LandingPage({ onNavigate }) {
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello Farmer! 🌾 How can I help you with your procurement slot today?' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text) return;

    // Add user query
    const newMessages = [...chatMessages, { sender: 'user', text }];
    setChatMessages(newMessages);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      let reply = "I can help you check mandi rates, download your QR pass, or reschedule your procurement slot.";
      const query = text.toLowerCase();
      
      if (query.includes('slot') || query.includes('booking')) {
        reply = "Your current slot is booked for 31 Aug 2026, 10:00 AM - 12:00 AM at Meerut Center.";
      } else if (query.includes('queue') || query.includes('wait') || query.includes('status')) {
        reply = "You are at Position #12 in the queue. Estimated waiting time is 25 minutes.";
      } else if (query.includes('document') || query.includes('doc')) {
        reply = "Required documents: Aadhaar Card, Land Record (Khatauni), Bank Passbook, and Kisan Bandhu QR Pass.";
      } else if (query.includes('payment') || query.includes('money')) {
        reply = "Payments are credited directly via DBT into your Aadhaar-linked bank account within 48-72 hours.";
      }

      setChatMessages([...newMessages, { sender: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">Smart Procurement.<br />Zero Waiting.</h1>
            <p className="hero-subtitle">
              Book your procurement slot, track your queue in real-time and receive instant updates. All in one platform for farmers.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => onNavigate('book-slot')}>
                Book Your Slot
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('farmer-dashboard')}>
                Explore Portal
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              <img 
                src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80" 
                alt="Farmer holding phone in crop field" 
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="container">
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Farmers Registered</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏢</div>
              <div>
                <div className="stat-number">250+</div>
                <div className="stat-label">Procurement Centers</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📅</div>
              <div>
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Slots Booked</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div>
                <div className="stat-number">98%</div>
                <div className="stat-label">Farmer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything Farmers Need 🌾</h2>
            <p className="section-subtitle">Making procurement simple, transparent and efficient.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">📅</div>
              <h3 className="feature-title">Smart Slot Booking</h3>
              <p className="feature-desc">
                Book your preferred time slot in advance and save time without standing in long mandi lines.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">⏱️</div>
              <h3 className="feature-title">Live Queue Tracking</h3>
              <p className="feature-desc">
                Track your real-time queue position and estimated waiting time directly from your mobile.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">📱</div>
              <h3 className="feature-title">QR-Based Entry</h3>
              <p className="feature-desc">
                Fast and secure contactless entry using your digital QR code pass at procurement centers.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">🔔</div>
              <h3 className="feature-title">Instant Notifications</h3>
              <p className="feature-desc">
                Get critical real-time status updates via SMS and WhatsApp about your turn and payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section" id="how-it-works" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps for a hassle-free procurement experience.</p>
          </div>
          <div className="how-it-works-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4 className="step-title">Register</h4>
              <p className="step-desc">Create your farmer account in minutes with basic details.</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4 className="step-title">Book Slot</h4>
              <p className="step-desc">Choose procurement center, crop, date and time slot.</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4 className="step-title">Get QR Code</h4>
              <p className="step-desc">Receive your verified digital entry pass on your phone.</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4 className="step-title">Procurement</h4>
              <p className="step-desc">Visit center, scan QR pass, and complete procurement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="section" id="ai-assistant">
        <div className="container">
          <div className="ai-assistant-card">
            <div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f3e1b', marginBottom: '12px' }}>
                Your AI Farming Assistant 🤖
              </h3>
              <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                Get instant answers about slots, required documents, MSP rates, queue status, and payments. Available 24/7 in your regional language.
              </p>
              <div className="ai-chips">
                <span className="ai-chip" onClick={() => handleSend('Check My Slot')}>Check My Slot</span>
                <span className="ai-chip" onClick={() => handleSend('Queue Status')}>Queue Status</span>
                <span className="ai-chip" onClick={() => handleSend('Documents Required')}>Documents Required</span>
                <span className="ai-chip" onClick={() => handleSend('Payment Status')}>Payment Status</span>
              </div>
            </div>
            <div className="ai-chat-preview">
              <div style={{ height: '160px', overflowY: 'auto', marginBottom: '12px' }}>
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: '10px',
                      marginBottom: '10px'
                    }}
                  >
                    {msg.sender === 'bot' && (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#155724',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        🤖
                      </div>
                    )}
                    <div style={{
                      background: msg.sender === 'user' ? '#155724' : '#f1f5f9',
                      color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                      padding: '8px 14px',
                      borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      fontSize: '13px',
                      maxWidth: '80%'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="ai-chat-input-box">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..." 
                />
                <button 
                  onClick={() => handleSend()}
                  style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 'bold' }}
                >
                  ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
