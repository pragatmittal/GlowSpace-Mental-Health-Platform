import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TestimonialsSection.css';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    avatar: '👩‍💻',
    rating: 5,
    text: 'GlowSpace has completely transformed my approach to mental health. The AI emotion detection is incredibly accurate, and the mood tracking helps me understand my patterns better than ever before.',
    highlight: 'transformed my approach to mental health',
    color: '#2C7A7B'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Student',
    avatar: '👨‍🎓',
    rating: 5,
    text: 'As a student dealing with anxiety, this platform has been a lifesaver. The community support is amazing, and the guided exercises help me stay grounded during stressful periods.',
    highlight: 'lifesaver for dealing with anxiety',
    color: '#9F7AEA'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Healthcare Worker',
    avatar: '👩‍⚕️',
    rating: 5,
    text: 'Working in healthcare can be emotionally draining. GlowSpace provides the perfect balance of professional tools and personal support that I need to maintain my well-being.',
    highlight: 'perfect balance of professional tools',
    color: '#805AD5'
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Entrepreneur',
    avatar: '👨‍💼',
    rating: 5,
    text: 'The privacy features and AI insights are game-changing. I can track my mental health progress without worrying about data security, and the recommendations are surprisingly accurate.',
    highlight: 'privacy features and AI insights are game-changing',
    color: '#2C7A7B'
  },
  {
    id: 5,
    name: 'Lisa Park',
    role: 'Teacher',
    avatar: '👩‍🏫',
    rating: 5,
    text: 'Teaching during these challenging times has been tough, but GlowSpace gives me the tools and support I need to stay mentally healthy and be there for my students.',
    highlight: 'gives me the tools and support I need',
    color: '#9F7AEA'
  }
];

const stats = [
  { number: '98%', label: 'User Satisfaction', icon: '😊' },
  { number: '10K+', label: 'Active Users', icon: '👥' },
  { number: '24/7', label: 'Support Available', icon: '🔄' },
  { number: '4.9★', label: 'App Store Rating', icon: '⭐' }
];

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="testimonials-section">
      {/* Background elements */}
      <div className="testimonials-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <div className="testimonials-container">
        <div className="testimonials-header">
          <div className="section-badge">
            <span className="badge-icon">💬</span>
            <span className="badge-text">User Testimonials</span>
          </div>
          
          <h2 className="section-title">
            What Our Users
            <span className="title-accent"> Say</span>
          </h2>
          
          <p className="section-description">
            Join thousands of satisfied users who have transformed their mental health journey 
            with GlowSpace's innovative approach to wellness.
          </p>
        </div>

        {/* Stats showcase */}
        <div className="stats-showcase">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main testimonial showcase */}
        <div className="testimonial-showcase">
          <div className="testimonial-content">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="user-info">
                  <div className="user-avatar">{testimonials[activeTestimonial].avatar}</div>
                  <div className="user-details">
                    <div className="user-name">{testimonials[activeTestimonial].name}</div>
                    <div className="user-role">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
                <div className="rating">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
              </div>
              
              <div className="testimonial-text">
                <p>
                  {testimonials[activeTestimonial].text.split(testimonials[activeTestimonial].highlight).map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <span className="highlight">{testimonials[activeTestimonial].highlight}</span>
                      )}
                    </React.Fragment>
                  ))}
                </p>
              </div>
              
              <div className="testimonial-footer">
                <div className="quote-icon">"</div>
                <div className="testimonial-meta">
                  <div className="verified-badge">✓ Verified User</div>
                  <div className="date">2 days ago</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial navigation */}
          <div className="testimonial-nav">
            <button 
              className="nav-button"
              onClick={() => setActiveTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
            >
              <span className="nav-icon">←</span>
            </button>
            
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                  style={{ '--indicator-color': testimonials[index].color }}
                />
              ))}
            </div>
            
            <button 
              className="nav-button"
              onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
            >
              <span className="nav-icon">→</span>
            </button>
          </div>
        </div>

        {/* Additional testimonials grid */}
        <div className="testimonials-grid">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="mini-testimonial"
              style={{ '--card-color': testimonial.color }}
            >
              <div className="mini-header">
                <div className="mini-avatar">{testimonial.avatar}</div>
                <div className="mini-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="mini-star">⭐</span>
                  ))}
                </div>
              </div>
              
              <div className="mini-text">
                <p>{testimonial.text.substring(0, 120)}...</p>
              </div>
              
              <div className="mini-footer">
                <div className="mini-name">{testimonial.name}</div>
                <div className="mini-role">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="testimonials-cta">
          <div className="cta-content">
            <h3 className="cta-title">Join Our Community</h3>
            <p className="cta-description">
              Start your mental wellness journey today and become part of our growing community of users.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-button primary">
                <span className="button-text">Get Started Free</span>
                <span className="button-icon">🚀</span>
              </Link>
              <Link to="/demo" className="cta-button secondary">
                <span className="button-text">Watch Demo</span>
                <span className="button-icon">▶️</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 