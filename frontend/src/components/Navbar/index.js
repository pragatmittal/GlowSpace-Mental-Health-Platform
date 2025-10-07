import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight; // Approximate hero section height
      
      // Hide navbar during hero section (first 100vh)
      if (scrollY < heroHeight * 0.8) {
        setIsVisible(false);
        setIsScrolled(false);
      } else {
        // Show navbar after scrolling past hero section
        setIsVisible(true);
        setIsScrolled(scrollY > heroHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isVisible ? 'visible' : ''} ${isScrolled ? 'scrolled' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">GlowSpace</span>
          <div className="logo-dot"></div>
        </Link>

        <div className="navbar-links">
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>

        <div className="navbar-auth">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>

          {user ? (
            <div className="user-menu">
              <button className="profile-button" onClick={toggleMenu}>
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="profile-image"
                />
                <span className="profile-name">{user.name}</span>
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="menu-item">
                    <i className="fas fa-columns"></i>
                    Dashboard
                  </Link>
                  <Link to="/assessments" className="menu-item">
                    <i className="fas fa-clipboard-list"></i>
                    Mental Health Assessments
                  </Link>
                  <Link to="/moodtracking" className="menu-item">
                    <i className="fas fa-heart"></i>
                    Mood Tracking
                  </Link>
                  <Link to="/community" className="menu-item">
                    <i className="fas fa-users"></i>
                    Community
                  </Link>
                  <Link to="/profile" className="menu-item">
                    <i className="fas fa-user"></i>
                    Profile
                  </Link>
                  <Link to="/settings" className="menu-item">
                    <i className="fas fa-cog"></i>
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="menu-item logout">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Sign In
              </Link>
              <Link to="/register" className="register-button">
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-button" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/features" className="mobile-link">Features</Link>
          <Link to="/about" className="mobile-link">About</Link>
          <Link to="/blog" className="mobile-link">Blog</Link>
          <Link to="/contact" className="mobile-link">Contact</Link>
          {!user && (
            <div className="mobile-auth">
              <Link to="/login" className="mobile-login">Sign In</Link>
              <Link to="/register" className="mobile-register">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
