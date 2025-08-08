import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { gsap } from 'gsap';
import { FaArrowRight, FaPlay } from 'react-icons/fa';

const HeroSection = () => {
  const { user } = useContext(AuthContext);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // Hero animation sequence
      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
      .from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.5")
      .from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.3")
      .from(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8");

      // Floating animation for hero image
      gsap.to(imageRef.current, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const motivationalQuotes = [
    "Your journey to mental wellness starts here",
    "Illuminate your path to emotional balance",
    "Transform your mindset, transform your life",
    "Every small step counts towards healing",
    "You are stronger than you think"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                ✨ Mental Wellness Platform
              </span>
            </div>
            
            <h1 
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                GlowSpace
              </span>
              <br />
              <span className="text-gray-800">
                Your Journey to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </h1>

            <p 
              ref={subtitleRef}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl"
            >
              {randomQuote}
            </p>

            <div 
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {user ? (
                <>
                  <Link
                    to="/assessment"
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Take Assessment
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Get Started Free
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="group inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl">
                    <FaPlay className="mr-2" />
                    Watch Demo
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start mt-12 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <div 
              ref={imageRef}
              className="relative"
            >
              <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-64 h-64 lg:w-80 lg:h-80 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-6xl lg:text-8xl mb-4">🧠</div>
                    <div className="text-lg font-semibold text-gray-700">Mental</div>
                    <div className="text-lg font-semibold text-gray-700">Wellness</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-2xl">✨</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce animation-delay-1000">
                <span className="text-2xl">🌱</span>
              </div>
              <div className="absolute top-1/2 -left-8 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-xl">💙</span>
              </div>
              <div className="absolute top-1/4 -right-8 w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center shadow-lg animate-pulse animation-delay-2000">
                <span className="text-xl">🔮</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
