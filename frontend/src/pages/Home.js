import React from 'react';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import PositiveStreakSection from '../components/PositiveStreakSection';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-page">
      <HeroSection />
      <ServicesSection />
      <PositiveStreakSection />
    </div>
  );
}

export default Home;
