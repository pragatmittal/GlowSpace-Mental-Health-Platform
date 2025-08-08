import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`footer ${isDarkMode ? 'dark' : ''}`}>
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill={isDarkMode ? '#1a1a1a' : '#f8f9fa'} fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column brand-column">
            <Link to="/" className="footer-logo">
              <span className="logo-text">GlowSpace</span>
              <div className="logo-dot"></div>
            </Link>
            <p className="brand-description">
              Empowering mental wellness through AI-powered emotion detection,
              real-time counseling, and interactive healing tools.
            </p>
            <div className="social-links">
              <a href="https://twitter.com/glowspace" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://facebook.com/glowspace" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://instagram.com/glowspace" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com/company/glowspace" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Services</h3>
            <ul>
              <li><Link to="/emotion-detection">Emotion Detection</Link></li>
              <li><Link to="/counseling">Online Counseling</Link></li>
              <li><Link to="/meditation">Guided Meditation</Link></li>
              <li><Link to="/assessments">Mental Health Tests</Link></li>
              <li><Link to="/community">Support Community</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/accessibility">Accessibility</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Newsletter</h3>
            <p>Subscribe to our newsletter for mental wellness tips and updates.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GlowSpace. All rights reserved.</p>
          <div className="footer-badges">
            <span className="badge">
              <i className="fas fa-shield-alt"></i> SSL Secured
            </span>
            <span className="badge">
              <i className="fas fa-lock"></i> HIPAA Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
