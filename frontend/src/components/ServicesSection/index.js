import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesSection.css';

const services = [
  {
    id: 'emotion-detection',
    title: 'Emotion Detection',
    description: 'Real-time facial emotion recognition using advanced AI technology to help you understand your emotional patterns.',
    icon: '🎭',
    color: '#4CAF50',
    link: '/emotion-detector'
  },
  {
    id: 'mood-tracking',
    title: 'Mood Tracking',
    description: 'Track and analyze your daily moods with interactive charts and personalized insights.',
    icon: '📊',
    color: '#2196F3',
    link: '/mood-tracking'
  },
  {
    id: 'counseling',
    title: 'Online Counseling',
    description: 'Connect with licensed therapists for personalized support and guidance from the comfort of your home.',
    icon: '💬',
    color: '#9C27B0',
    link: '/counseling'
  },
  {
    id: 'assessments',
    title: 'Mental Health Assessments',
    description: 'Take comprehensive assessments to better understand your mental well-being and track progress.',
    icon: '📋',
    color: '#FF9800',
    link: '/assessments'
  },
  {
    id: 'meditation',
    title: 'Guided Meditation',
    description: 'Access a library of mindfulness exercises and meditation sessions for stress relief.',
    icon: '🧘',
    color: '#00BCD4',
    link: '/meditation'
  },
  {
    id: 'community',
    title: 'Support Community',
    description: 'Join a caring community of individuals on similar journeys to share experiences and support.',
    icon: '👥',
    color: '#795548',
    link: '/community'
  }
];

const ServicesSection = () => {
  return (
    <section className="services-section">
      <div className="services-content">
        <div className="services-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive mental health support tailored to your needs
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.link}
              className="service-card"
              style={{ '--card-color': service.color }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="services-cta">
        <div className="cta-content">
          <h3>Ready to Start Your Journey?</h3>
          <p>Join thousands of others who have transformed their mental well-being with GlowSpace.</p>
          <Link to="/register" className="cta-button">Get Started Today</Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 