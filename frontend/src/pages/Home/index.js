import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/Navbar';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import PositiveStreakSection from './PositiveStreakSection';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const homeRef = useRef(null);

  useEffect(() => {
    // Initialize GSAP animations
    const ctx = gsap.context(() => {
      // Fade in animation for sections
      gsap.from('.animate-fade-in', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.animate-fade-in',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      });

      // Services cards animation
      gsap.from('.service-card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.services-container',
          start: 'top 70%',
          end: 'bottom 30%',
          toggleActions: 'play none none reverse'
        }
      });

    }, homeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={homeRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <PositiveStreakSection />
      </main>
    </div>
  );
};

export default Home;
