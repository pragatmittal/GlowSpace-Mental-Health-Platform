import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ServicesSection.css';

const services = [
  {
    id: 'emotion-detection',
    title: 'AI Emotion Detection',
    description: 'Advanced facial recognition technology that analyzes your emotions in real-time, providing instant feedback and mood tracking.',
    icon: '',
    color: '#2C7A7B',
    gradient: 'linear-gradient(135deg, #2C7A7B 0%, #805AD5 100%)',
    features: ['Real-time analysis', 'Mood tracking', 'Personalized insights', 'Privacy protected'],
    link: '/emotion-detector'
  },
  {
    id: 'mood-tracking',
    title: 'Smart Mood Tracking',
    description: 'Intelligent mood monitoring with AI-powered insights, helping you understand patterns and triggers in your emotional wellbeing.',
    icon: '',
    color: '#9F7AEA',
    gradient: 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)',
    features: ['Daily mood logging', 'Pattern recognition', 'Trigger identification', 'Progress visualization'],
    link: '/moodtracking'
  },
  {
    id: 'community-support',
    title: 'Community Support',
    description: 'Connect with like-minded individuals in a safe, supportive environment designed to foster mental wellness and personal growth.',
    icon: '',
    color: '#805AD5',
    gradient: 'linear-gradient(135deg, #805AD5 0%, #2C7A7B 100%)',
    features: ['Peer support', 'Group discussions', 'Expert guidance', 'Safe environment'],
    link: '/community'
  },
  {
    id: 'mental-assessments',
    title: 'Mental Health Assessments',
    description: 'Comprehensive evaluations using clinically validated tools to assess your mental health status and provide personalized recommendations.',
    icon: '',
    color: '#2C7A7B',
    gradient: 'linear-gradient(135deg, #2C7A7B 0%, #9F7AEA 100%)',
    features: ['Clinical tools', 'Personalized reports', 'Action plans', 'Progress tracking'],
    link: '/assessments'
  },
  {
    id: 'ai-chatbot',
    title: 'AI Wellness Assistant',
    description: '24/7 intelligent chatbot providing immediate support, guidance, and resources for your mental health journey.',
    icon: '',
    color: '#9F7AEA',
    gradient: 'linear-gradient(135deg, #9F7AEA 0%, #2C7A7B 100%)',
    features: ['24/7 availability', 'Instant responses', 'Resource library', 'Crisis support'],
    link: '/chat'
  },
  {
    id: 'progress-analytics',
    title: 'Progress Analytics',
    description: 'Comprehensive dashboard showing your mental wellness journey with detailed insights, trends, and achievement tracking.',
    icon: '',
    color: '#805AD5',
    gradient: 'linear-gradient(135deg, #805AD5 0%, #9F7AEA 100%)',
    features: ['Visual insights', 'Trend analysis', 'Goal tracking', 'Achievement badges'],
    link: '/dashboard'
  }
];

const ServicesSection = () => {
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    // Auto-rotate featured service
    const interval = setInterval(() => {
      setActiveService(prev => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="services-section">
      {/* Background decoration */}
      <div className="services-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="services-container">
        {/* Featured service showcase - This is the continuously changing feature */}
        <div className="featured-service">
          <div className="featured-content">
            <div className="featured-info">
              <h3 className="featured-title">{services[activeService].title}</h3>
              <p className="featured-description">{services[activeService].description}</p>
              <div className="featured-features">
                {services[activeService].features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    <span className="feature-check">✓</span>
                    {feature}
                  </span>
                ))}
              </div>
              <Link to={services[activeService].link} className="featured-cta">
                <span>Learn More</span>
                <span className="cta-arrow">→</span>
              </Link>
            </div>
            <div className="featured-visual">
              <div className="visual-container">
                <div className="visual-circle" style={{ background: services[activeService].gradient }}></div>
                <div className="visual-elements">
                  <div className="visual-dot dot-1"></div>
                  <div className="visual-dot dot-2"></div>
                  <div className="visual-dot dot-3"></div>
                  <div className="visual-line line-1"></div>
                  <div className="visual-line line-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header text - Now positioned above the feature cards */}
        <div className="services-header">
          <h2 className="section-title">
            Comprehensive Mental Health
            <span className="title-accent"> Solutions</span>
          </h2>
          

        </div>

        {/* All services grid - Feature cards */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className={`service-card ${index === activeService ? 'highlighted' : ''}`}
              style={{ '--card-color': service.color }}
              onMouseEnter={() => setActiveService(index)}
            >
              <div className="service-header">
                <div className="service-badge">Featured</div>
              </div>
              
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-features">
                {service.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to={service.link} className="service-cta">
                <span>Explore</span>
                <span className="cta-icon">→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Journey Roadmap */}
        <div className="journey-roadmap">
          <div className="roadmap-content">
            {/* Inspirational Quote */}
            <div className="roadmap-quote">
              <p className="quote-text">
                "Every journey begins with a single step. Your path to mental wellness starts here."
              </p>
            </div>

            {/* Roadmap Steps */}
            <div className="roadmap-container">
              <h3 className="roadmap-title">Your Journey to Wellness</h3>
              
              <div className="roadmap-path">
                {/* Top Row - Steps 1, 2, 3 */}
                <div className="roadmap-row roadmap-row-top">
                  <div className="roadmap-step" data-step="1">
                    <div className="step-number">01</div>
                    <div className="step-content">
                      <h4 className="step-title">Create Account</h4>
                      <p className="step-description">Sign up and log in securely</p>
                    </div>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="roadmap-step" data-step="2">
                    <div className="step-number">02</div>
                    <div className="step-content">
                      <h4 className="step-title">Take Assessment</h4>
                      <p className="step-description">Complete mental health evaluation</p>
                    </div>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="roadmap-step" data-step="3">
                    <div className="step-number">03</div>
                    <div className="step-content">
                      <h4 className="step-title">Get AI Insights</h4>
                      <p className="step-description">Receive personalized recommendations</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row - Steps 4, 5 */}
                <div className="roadmap-row roadmap-row-bottom">
                  <div className="roadmap-step" data-step="4">
                    <div className="step-number">04</div>
                    <div className="step-content">
                      <h4 className="step-title">Track Progress</h4>
                      <p className="step-description">Analyze and improve consistently</p>
                    </div>
                  </div>
                  <div className="step-arrow">←</div>
                  <div className="roadmap-step" data-step="5">
                    <div className="step-number">05</div>
                    <div className="step-content">
                      <h4 className="step-title">Join Challenges</h4>
                      <p className="step-description">Build lasting wellness habits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 