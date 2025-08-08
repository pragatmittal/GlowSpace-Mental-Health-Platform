import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Marketing Manager",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c9166c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "GlowSpace has completely transformed my approach to mental wellness. The emotion detection feature helped me understand my patterns and the counseling sessions were life-changing.",
      rating: 5,
      challenge: "Completed 30-day challenge"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Software Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "The mood tracking feature is incredible. I can now see how my daily habits affect my mental state. The healing games are also a fun way to de-stress after work.",
      rating: 5,
      challenge: "Completed 21-day challenge"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Teacher",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "As someone who struggled with anxiety, the chat support community has been amazing. Finding people who understand your journey makes all the difference.",
      rating: 5,
      challenge: "Active in community"
    },
    {
      id: 4,
      name: "David Park",
      role: "College Student",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "The counseling booking system is so convenient. I can easily schedule sessions around my classes, and the counselors are incredibly professional and caring.",
      rating: 5,
      challenge: "Regular counseling sessions"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Nurse",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "Working in healthcare can be stressful. GlowSpace's assessments helped me identify my stress triggers and the recommendations are spot-on.",
      rating: 5,
      challenge: "Completed 7-day challenge"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from people who have transformed their mental wellness journey with GlowSpace.
          </p>
        </div>

        <div className="relative testimonials-container">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                <div className="testimonial-card max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Quote Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <FaQuoteLeft className="text-white text-2xl" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex justify-center md:justify-start mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-400 text-xl" />
                        ))}
                      </div>
                      
                      <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic">
                        "{testimonial.content}"
                      </blockquote>

                      <div className="flex items-center justify-center md:justify-start space-x-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover shadow-md"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {testimonial.role}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            {testimonial.challenge}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:shadow-xl"
          >
            <FaChevronLeft />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:shadow-xl"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
            <div className="text-gray-600">Sessions Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
