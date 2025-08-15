import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ComingSoon.css';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(75); // Simulated progress
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    // Simulate API call for email subscription
    setTimeout(() => {
      setIsSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  const handleExploreFeatures = (feature) => {
    navigate(feature);
  };

  const features = [
    {
      icon: '📊',
      title: 'Mood Tracking',
      description: 'Track your emotional patterns',
      link: '/moodtracking',
      available: true
    },
    {
      icon: '🎭',
      title: 'Emotion Detection',
      description: 'AI-powered emotion analysis',
      link: '/emotion-detector',
      available: true
    },
    {
      icon: '💬',
      title: 'Chat Support',
      description: 'Connect with our community',
      link: '/chat',
      available: true
    },
    {
      icon: '🧘',
      title: 'Mindfulness',
      description: 'Guided meditation sessions',
      link: '/meditation',
      available: true
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      text: 'GlowSpace has been a game-changer for my mental wellness journey!',
      rating: 5
    },
    {
      name: 'Alex K.',
      text: 'The mood tracking feature helped me understand my patterns better.',
      rating: 5
    },
    {
      name: 'Maya P.',
      text: 'Can\'t wait for the assessment features - the preview looks amazing!',
      rating: 5
    }
  ];

  return (
    <div className="coming-soon">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="construction-icon">
              🚀
            </div>
            <h1 className="hero-title">
              Something Amazing is Coming!
            </h1>
            <p className="hero-subtitle">
              We're crafting personalized mental health assessments that will revolutionize your wellness journey
            </p>
            
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-label">
                <span>Development Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">
                Nearly there! Our team is putting the finishing touches on your new assessment experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="features-preview">
        <div className="container">
          <h2>What's Coming</h2>
          <div className="coming-features">
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Advanced Analytics</h3>
              <p>Deep insights into your mental well-being patterns and trends</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>Visual progress reports and personalized recommendations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy First</h3>
              <p>Your data stays secure with end-to-end encryption</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Results</h3>
              <p>Instant feedback and actionable insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Signup */}
      <div className="email-signup">
        <div className="container">
          <div className="signup-content">
            <h2>Be the First to Know</h2>
            <p>Join thousands of users already transforming their lives with GlowSpace</p>
            
            {!isSubscribed ? (
              <form onSubmit={handleEmailSubmit} className="signup-form">
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={user?.email || "Enter your email address"}
                    required
                    className="email-input"
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    className="notify-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      'Notify Me'
                    )}
                  </button>
                </div>
                <p className="signup-note">
                  We'll send you an email as soon as assessments are ready!
                </p>
              </form>
            ) : (
              <div className="subscription-success">
                <div className="success-icon">✅</div>
                <h3>You're all set!</h3>
                <p>We'll notify you as soon as mental health assessments are ready.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Features */}
      <div className="available-features">
        <div className="container">
          <h2>Explore What's Available Now</h2>
          <p>While you wait, check out these amazing features already helping thousands of users</p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="available-feature-card"
                onClick={() => handleExploreFeatures(feature.link)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="explore-btn">
                  Explore Now →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <div className="container">
          <h2>What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p>"{testimonial.text}"</p>
                <div className="testimonial-author">- {testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-section">
        <div className="container">
          <h2>Development Timeline</h2>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-marker">✅</div>
              <div className="timeline-content">
                <h3>Research & Planning</h3>
                <p>Completed comprehensive research on mental health assessment methodologies</p>
              </div>
            </div>
            <div className="timeline-item completed">
              <div className="timeline-marker">✅</div>
              <div className="timeline-content">
                <h3>UI/UX Design</h3>
                <p>Designed user-friendly interfaces focused on accessibility and engagement</p>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-marker">🔄</div>
              <div className="timeline-content">
                <h3>Development & Testing</h3>
                <p>Currently building and testing the assessment algorithms and user experience</p>
              </div>
            </div>
            <div className="timeline-item upcoming">
              <div className="timeline-marker">⏳</div>
              <div className="timeline-content">
                <h3>Launch</h3>
                <p>Final testing and launch of the complete assessment suite</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="back-section">
        <div className="container">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
