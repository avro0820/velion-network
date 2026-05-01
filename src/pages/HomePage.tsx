import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Briefcase, Code, Mail, ArrowRight, Zap, ShieldAlert } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-container">
      {/* Breaking News Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-label">BREAKING</div>
        <div className="ticker">
          <div className="ticker-item">SYSTEM UPDATE: New proprietary nodes deployed. Access restricted to approved operatives.</div>
          <div className="ticker-item">SECURITY ALERT: Ensure all intelligence templates are properly sanitized before upload.</div>
          <div className="ticker-item">NETWORK STATUS: All systems operating at 1ms latency.</div>
        </div>
      </div>

      {/* Navbar inspired by FEZ-portfolio-nav */}
      <header className="header animate-fade-down" style={{ marginTop: '36px' }}>
        <Link to="/" className="brand">
          <div className="brand-logo-box">
            <Zap size={22} fill="#050a14" color="#050a14" />
          </div>
          <span className="brand-name">VELION</span>
        </Link>

        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                <div className="icon"><Home size={20} /></div>
                <span className="label">Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/platforms" className="nav-link">
                <div className="icon"><Briefcase size={20} /></div>
                <span className="label">Nodes</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/templates" className="nav-link">
                <div className="icon"><Code size={20} /></div>
                <span className="label">Templates</span>
              </Link>
            </li>
            <li className="nav-item">
              <a href="#contact" className="nav-link">
                <div className="icon"><Mail size={20} /></div>
                <span className="label">Contact</span>
              </a>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link cta-link">
                <div className="icon"><ArrowRight size={20} /></div>
                <span className="label">Access System</span>
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        <div className="hero-section animate-fade-up">
          <h1 className="hero-title">Secure <span className="gradient-text">Intelligence</span> Network</h1>
          <p className="hero-subtitle">Access proprietary nodes, intelligence templates, and collaborate with powership operatives worldwide. Operating at 1ms precision.</p>
          
          <div className="action-buttons">
            <Link to="/login" className="hero-btn primary">
              Login to Network <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="hero-btn secondary">
              Request Access
            </Link>
          </div>
        </div>

        <div className="owner-section animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">Director Contact</h2>
          
          {/* Social Links from FEZ-social-expanding-links */}
          <div className="social-wrapper" id="contact">
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="social-btn whatsapp">
              <i className="fa-brands fa-whatsapp"></i>
              <span className="btn-text">WhatsApp</span>
            </a>
            <a href="#" className="social-btn facebook">
              <i className="fa-brands fa-facebook-f"></i>
              <span className="btn-text">Facebook</span>
            </a>
            <a href="#" className="social-btn twitter">
              <i className="fa-brands fa-twitter"></i>
              <span className="btn-text">Twitter</span>
            </a>
            <a href="#" className="social-btn discord">
              <i className="fa-brands fa-discord"></i>
              <span className="btn-text">Discord</span>
            </a>
            <a href="#" className="social-btn instagram">
              <i className="fa-brands fa-instagram"></i>
              <span className="btn-text">Instagram</span>
            </a>
          </div>

          <div className="emergency-contact">
            <ShieldAlert size={20} className="emergency-icon" />
            <div>
              <h3>Emergency Contact Protocol</h3>
              <p>For immediate powership assistance, ping the secure comms channel or utilize direct WhatsApp dispatch.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
