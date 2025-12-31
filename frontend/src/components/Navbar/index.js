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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu');
      if (isUserMenuOpen && userMenu && !userMenu.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      // Use a small delay to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close user menu when navigating
  const handleUserMenuClick = () => {
    setIsUserMenuOpen(false);
  };

  // Scroll to home hero section
  const scrollToHome = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to features section
  const scrollToFeatures = (e) => {
    e.preventDefault();
    const featuresSection = document.querySelector('.services-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not on home page, navigate to home and then scroll
      navigate('/');
      setTimeout(() => {
        const section = document.querySelector('.services-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <nav className={`navbar ${isVisible ? 'visible' : ''} ${isScrolled ? 'scrolled' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">GlowSpace</span>
          <div className="logo-dot"></div>
        </Link>

        <div className="navbar-links">
          <a href="/" onClick={scrollToHome} className="nav-link">Home</a>
          <a href="/" onClick={scrollToFeatures} className="nav-link">Features</a>
          {user && (
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          )}
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
              <button className="profile-button" onClick={toggleUserMenu}>
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="profile-image"
                />
                <span className="profile-name">{user.name}</span>
              </button>
              <div className={`dropdown-menu ${isUserMenuOpen ? 'show' : ''}`}>
                <Link to="/" className="menu-item" onClick={handleUserMenuClick}>
                  <i className="fas fa-home"></i>
                  Home
                </Link>
                <Link to="/dashboard" className="menu-item" onClick={handleUserMenuClick}>
                  <i className="fas fa-columns"></i>
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); handleUserMenuClick(); }} className="menu-item logout">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
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
          <a href="/" onClick={(e) => { scrollToHome(e); setIsMenuOpen(false); }} className="mobile-link">Home</a>
          <a href="/" onClick={(e) => { scrollToFeatures(e); setIsMenuOpen(false); }} className="mobile-link">Features</a>
          {user && (
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="mobile-link">Dashboard</Link>
          )}
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
