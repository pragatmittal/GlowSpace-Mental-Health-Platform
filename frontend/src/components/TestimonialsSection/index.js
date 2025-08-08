import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './TestimonialsSection.css';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Student',
    image: '/images/testimonials/sarah.jpg',
    quote: 'The 21-day challenge transformed my approach to mental wellness. The daily exercises were manageable and really made a difference.',
    challenge: '21-day Challenge',
    rating: 5
  },
  {
    id: 2,
    name: 'James R.',
    role: 'Professional',
    image: '/images/testimonials/james.jpg',
    quote: 'The emotion detection feature helped me understand my emotional patterns better. It\'s like having a personal mental wellness coach.',
    challenge: 'Emotion Detection',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily L.',
    role: 'Teacher',
    image: '/images/testimonials/emily.jpg',
    quote: 'The guided meditation sessions are perfect for my busy schedule. I\'ve noticed a significant improvement in my stress levels.',
    challenge: 'Meditation Program',
    rating: 5
  }
];

const TestimonialsSection = () => {
  const { isDarkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Auto-rotate testimonials
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDotClick = (index) => {
    setActiveIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
  };

  return (
    <section className={`testimonials-section ${isDarkMode ? 'dark' : ''}`}>
      <div className="testimonials-content">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">
          Real stories from our community members who have experienced positive changes
          in their mental wellness journey.
        </p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`testimonial-card ${index === activeIndex ? 'active' : ''}`}
            >
              <div className="testimonial-header">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="testimonial-image"
                />
                <div className="testimonial-info">
                  <h3 className="testimonial-name">{testimonial.name}</h3>
                  <span className="testimonial-role">{testimonial.role}</span>
                </div>
              </div>

              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>

              <blockquote className="testimonial-quote">
                "{testimonial.quote}"
              </blockquote>

              <div className="testimonial-footer">
                <span className="challenge-tag">{testimonial.challenge}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="testimonial-cta">
          <h3>Ready to Start Your Journey?</h3>
          <p>Join thousands of others who have transformed their mental well-being with GlowSpace.</p>
          <a href="/register" className="cta-button">Get Started Today</a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 