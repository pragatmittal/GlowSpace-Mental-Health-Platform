import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './HeroSection.css';

const HeroSection = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero-section">
      {/* Video background */}
      <div className="hero-video-bg">
        <video autoPlay muted loop playsInline>
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Animated background elements */}
      <div className="hero-bg-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="bg-circle circle-4"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text-section">
            <h1 className="hero-title">
              Your Journey to
              <span className="title-highlight"> Mental Wellness</span>
              <span className="title-accent"> Starts Here</span>
            </h1>
            
            <p className="hero-description">
              Experience personalized mental health support with cutting-edge AI emotion detection, 
              real-time counseling, and interactive healing tools designed for your unique journey.
            </p>

            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="cta-button primary">
                  <span className="button-text">Go to Dashboard</span>
                  <span className="button-icon">→</span>
                </Link>
              ) : (
                <Link to="/register" className="cta-button primary">
                  <span className="button-text">Start Your Journey</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 