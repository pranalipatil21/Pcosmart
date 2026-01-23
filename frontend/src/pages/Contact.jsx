import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaGlobe, FaPaperPlane, FaCommentDots, FaMapPin } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="container page-spacing">
      
      {/* 1. HEADER SECTION - UPDATED */}
      <div className="contact-hero-card mb-12">
        <div className="hero-content text-center">
          <span className="hero-badge">24/7 Support</span>
          <h1 className="hero-title">
            Contact <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D6689C' }}>US</span>
          </h1>
          <p className="hero-subtitle">
            Have questions about PCOS or our platform? We're here to help. 
            Reach out and we'll respond as soon as we can.
          </p>
        </div>
      </div>
      
      <br />
      <div className="contact-grid">
        
        {/* 2. LEFT COLUMN: FORM */}
        <div className="contact-form-card">
          <div className="form-header">
            <div style={{ background: '#D6689C', padding: '10px', borderRadius: '50%', color: 'white', display: 'flex' }}>
              <FaCommentDots size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Send us a Message</h2>
          </div>

          <form>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" className="form-input" placeholder="username" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="user@example.com" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input type="text" className="form-input" placeholder="How can we help?" />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" placeholder="Tell us more about your inquiry..."></textarea>
            </div>

            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
              <FaPaperPlane /> Send Message
            </button>
          </form>
        </div>

        {/* 3. RIGHT COLUMN: INFO CARDS */}
        <div>
          
          {/* Purple Info Card */}
          <div className="info-card-purple">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '25px', color: 'white' }}>Contact Information</h3>
            
            <div className="info-item">
              <div className="info-icon-circle"><FaEnvelope /></div>
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">support@pcosmart.com</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-circle"><FaPhone /></div>
              <div>
                <span className="info-label">Helpline</span>
                <span className="info-value">+1 (800) PCOS-HELP</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-circle"><FaClock /></div>
              <div>
                <span className="info-label">Hours</span>
                <span className="info-value">Mon-Fri: 9AM-6PM EST</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-circle"><FaGlobe /></div>
              <div>
                <span className="info-label">Website</span>
                <span className="info-value">www.pcosmart.com</span>
              </div>
            </div>
          </div>

          {/* Crisis Card */}
          <div className="crisis-card">
            <h4 style={{ color: '#2D3748', marginBottom: '8px', fontSize: '1rem' }}>Need Immediate Help?</h4>
            <p style={{ fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
              For urgent medical concerns, please contact your healthcare provider or local emergency services.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#4A5568', marginTop: '10px', fontWeight: '600' }}>
              Crisis Helpline: 988 (Suicide & Crisis Lifeline)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;