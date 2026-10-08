import React from 'react';

export default function Navbar({ onNavigate, currentView }) {
  return (
    <header className="public-header">
      <div className="container nav-container">
        <div className="brand-logo" onClick={() => onNavigate('landing')}>
          <span className="icon">🌾</span>
          <span>KISAN BANDHU</span>
        </div>
        <ul className="nav-menu">
          <li>
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
              className={currentView === 'landing' ? 'active' : ''}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
              className={currentView === 'landing' ? 'active' : ''}
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
              className={currentView === 'landing' ? 'active' : ''}
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#ai-assistant"
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
              className={currentView === 'landing' ? 'active' : ''}
            >
              AI Assistant
            </a>
          </li>
          <li>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}
              className={currentView === 'landing' ? 'active' : ''} 
            >
              Contact
            </a>
          </li>
        </ul>
        <div className="nav-actions">
          <button className="btn-login" onClick={() => onNavigate('login')}>
            Login
          </button>
          <button className="btn-primary" onClick={() => onNavigate('register')}>
            Register
          </button>
        </div>
      </div>
    </header>
  );
}