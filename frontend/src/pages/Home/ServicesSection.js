import React from 'react';
import { FaChartLine, FaBrain, FaCalendarCheck, FaComments, FaHeart } from 'react-icons/fa';

const ServicesSection = () => {
  const services = [
    {
      icon: FaChartLine,
      title: 'Mood Tracking',
      description: 'Track your mood over time and gain insights into your emotional patterns.',
      link: '/mood-tracking'
    },
    {
      icon: FaBrain,
      title: 'Emotion Detection',
      description: 'Detect and analyze your emotions in real-time using AI technology.',
      link: '/emotion-detection'
    },
    {
      icon: FaCalendarCheck,
      title: 'Counseling',
      description: 'Schedule sessions with certified counselors to discuss your mental health.',
      link: '/counseling'
    },
    {
      icon: FaComments,
      title: 'Chat Support',
      description: 'Join our community and chat with others on their mental wellness journey.',
      link: '/chat-support'
    },
    {
      icon: FaHeart,
      title: 'Healing Games',
      description: 'Engage in interactive games designed to boost your emotional wellbeing.',
      link: '/healing-games'
    }
  ];

  return (
    <section className="py-12 bg-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
            Our Services
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-600 max-w-2xl mx-auto">
            Discover the wide range of services we offer to help you on your mental wellness journey.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 services-container">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.link}
              className="service-card flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                  <service.icon size={24} />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {service.title}
              </h3>
              <p className="mt-2 text-base text-gray-600">
                {service.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

