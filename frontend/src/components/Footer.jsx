import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
          
          {/* Column 1: Brand & Desc */}
          <div>
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/favicon.png"
              alt="PCOSmart Logo"
              style={{ height: '50px', width: 'auto' }}
            />
            <span>PCOSmart</span>
          </div>

            <p style={{ color: '#718096', lineHeight: '1.6', marginBottom: '20px', marginTop: '15px' }}>
              Empowering women with AI-powered PCOS screening and personalized health guidance.
            </p>
            <div className="flex gap-10">
              <a href="#" className="social-icon-btn"><FaFacebookF /></a>
              <a href="#" className="social-icon-btn"><FaTwitter /></a>
              <a href="#" className="social-icon-btn"><FaInstagram /></a>
              <a href="#" className="social-icon-btn"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-list">
              <li><Link to="/about" className="footer-link">About PCOS</Link></li>
              <li><Link to="/check/image" className="footer-link">Image Test</Link></li>
              <li><Link to="/check/symptom" className="footer-link">Symptom Test</Link></li>
              <li><Link to="/diet" className="footer-link">Diet & Exercise</Link></li>
              <li><Link to="/awareness" className="footer-link">Awareness</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-list">
              <li><Link to="/awareness" className="footer-link">FAQ</Link></li>
              <li><Link to="/awareness" className="footer-link">Research</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/contact" className="footer-link">Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-item">
              <FaEnvelope style={{ marginTop: '4px', color: 'var(--primary)' }} />
              <span>support@pcosmart.com</span>
            </div>
            <div className="contact-item">
              <FaPhone style={{ marginTop: '4px', color: 'var(--primary)' }} />
              <span>+1 (800) PCOS-HELP</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt style={{ marginTop: '4px', color: 'var(--primary)' }} />
              <span>123 Health Plaza, Medical District, Pune 90210</span>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div style={{ textAlign: 'right', marginTop: '60px', color: '#CBD5E0', fontSize: '0.85rem' }}>
          © 2026 PCOSmart. All rights reserved. Made with <FaHeart style={{ color: 'var(--primary)', margin: '0 3px' }} /> for women's health
        </div>
      </div>
    </footer>
  );
};

export default Footer;