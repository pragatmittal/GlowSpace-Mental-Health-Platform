import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './HeroSection.css';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text-container">
          <h1 className="hero-title">
            Your Journey to<br />
            <span className="gradient-text">Mental Wellness</span>
          </h1>
          <p className="hero-subtitle">
            Experience personalized mental health support with AI-powered emotion detection,
            real-time counseling, and interactive healing tools.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
          <div className="hero-buttons">
            {user ? (
              <Link to="/dashboard" className="primary-button">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="primary-button">
                  Get Started
                </Link>
                <Link to="/login" className="secondary-button">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image">
            <img 
              src="/images/mental-wellness.svg" 
              alt="Mental Wellness Illustration"
              className="main-illustration" 
            />
            <div className="floating-elements">
              <div className="float-item emotion-icon">😊</div>
              <div className="float-item chart-icon">📈</div>
              <div className="float-item heart-icon">❤️</div>
              <div className="float-item mind-icon">🧠</div>
            </div>
          </div>
          <div className="hero-blob"></div>
        </div>
      </div>
      <div className="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection; 