import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import './PositiveStreakSection.css';

gsap.registerPlugin(ScrollTrigger);

const challenges = [
  {
    id: '7-day',
    title: '7-Day Challenge',
    description: 'Perfect for beginners. Build a foundation for mental wellness with daily mindfulness exercises.',
    icon: '🌱',
    duration: '7 days',
    difficulty: 'Beginner'
  },
  {
    id: '21-day',
    title: '21-Day Transformation',
    description: 'Create lasting habits with our most popular program. Includes guided meditation and mood tracking.',
    icon: '🌟',
    duration: '21 days',
    difficulty: 'Intermediate'
  },
  {
    id: '30-day',
    title: '30-Day Mastery',
    description: 'Advanced program for deep emotional intelligence development and lasting transformation.',
    icon: '🎯',
    duration: '30 days',
    difficulty: 'Advanced'
  }
];

const PositiveStreakSection = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Initial opacity for all elements
    gsap.set([cardsRef.current, sectionRef.current.querySelector('.section-title'), sectionRef.current.querySelector('.section-subtitle')], {
      opacity: 1,
      y: 0
    });

    // Animate section title and subtitle
    gsap.from(sectionRef.current.querySelector('.section-title'), {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });

    gsap.from(sectionRef.current.querySelector('.section-subtitle'), {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power2.out'
    });

    // Animate challenge cards
    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2 * index,
        ease: 'power2.out'
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`positive-streak-section ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="float-element float-1"></div>
        <div className="float-element float-2"></div>
        <div className="float-element float-3"></div>
      </div>

      {/* Decorative Lines */}
      <div className="deco-line line-1"></div>
      <div className="deco-line line-2"></div>

      <div className="section-content">
        <h2 className="section-title">Start Your Positive Streak</h2>
        <p className="section-subtitle">
          Choose a challenge that matches your goals and experience level.
          Our structured programs help you build lasting mental wellness habits.
        </p>

        <div className="challenges-grid">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              ref={el => cardsRef.current[index] = el}
              className="challenge-card"
            >
              <div className="challenge-icon">
                <span>{challenge.icon}</span>
              </div>
              <h3 className="challenge-title">{challenge.title}</h3>
              <p className="challenge-description">{challenge.description}</p>
              <div className="challenge-meta">
                <span className="duration">
                  <i className="far fa-clock"></i> {challenge.duration}
                </span>
                <span className="difficulty">
                  <i className="far fa-star"></i> {challenge.difficulty}
                </span>
              </div>
              <Link to={`/challenge/${challenge.id}`} className="start-challenge-btn">
                Start Challenge
              </Link>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="cta-section">
          <div className="cta-content">
            <h3 className="cta-title">Ready to Transform Your Life?</h3>
            <p className="cta-description">
              Join thousands of users who have already started their mental wellness journey. 
              Every challenge completed brings you closer to a healthier, happier you.
            </p>
            <Link to={user ? "/assessments" : "/login"} className="cta-button">
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PositiveStreakSection; 