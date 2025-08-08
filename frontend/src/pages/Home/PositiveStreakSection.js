import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FaCalendarAlt, FaCheckCircle, FaTrophy } from 'react-icons/fa';

const PositiveStreakSection = () => {
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const challenges = [
    {
      duration: '7-day',
      title: '7-Day Mindfulness Challenge',
      description: 'Start your journey with daily mindfulness exercises',
      icon: '🌱',
      color: 'from-green-400 to-blue-500'
    },
    {
      duration: '21-day',
      title: '21-Day Habit Building',
      description: 'Build lasting positive habits for mental wellness',
      icon: '🎯',
      color: 'from-blue-400 to-purple-500'
    },
    {
      duration: '30-day',
      title: '30-Day Transformation',
      description: 'Complete mental wellness transformation journey',
      icon: '🏆',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Please login to start a challenge');
      return;
    }

    if (!selectedChallenge) {
      setMessage('Please select a challenge duration');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: selectedChallenge,
          startDate: new Date()
        })
      });

      if (response.ok) {
        setMessage('Challenge started successfully! 🎉');
        setSelectedChallenge('');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to start challenge');
      }
    } catch (error) {
      setMessage('Error starting challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <FaTrophy className="text-white text-2xl" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Build Your Positive Streak
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a challenge duration and start building positive habits that will transform your mental wellness journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {challenges.map((challenge, index) => (
              <div
                key={challenge.duration}
                className={`relative p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedChallenge === challenge.duration 
                    ? 'ring-4 ring-purple-500 bg-white' 
                    : 'bg-white hover:shadow-xl'
                }`}
                onClick={() => setSelectedChallenge(challenge.duration)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${challenge.color} rounded-2xl opacity-10`}></div>
                
                <div className="relative z-10">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{challenge.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <FaCalendarAlt />
                      <span>{challenge.duration.split('-')[0]} Days</span>
                    </div>
                  </div>
                  
                  {selectedChallenge === challenge.duration && (
                    <div className="absolute top-4 right-4">
                      <FaCheckCircle className="text-purple-500 text-xl" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="text-center">
            <div className="mb-6">
              <button
                type="submit"
                disabled={isSubmitting || !selectedChallenge}
                className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isSubmitting || !selectedChallenge
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Starting Challenge...
                  </span>
                ) : (
                  'Start Your Challenge'
                )}
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {!user && (
              <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-lg">
                <p>
                  Please{' '}
                  <a href="/login" className="font-semibold underline">
                    login
                  </a>{' '}
                  or{' '}
                  <a href="/register" className="font-semibold underline">
                    register
                  </a>{' '}
                  to start a challenge
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">📈</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
            <p className="text-gray-600 text-sm">Monitor your daily progress and celebrate milestones</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Daily Goals</h4>
            <p className="text-gray-600 text-sm">Complete daily tasks designed for mental wellness</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🏆</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Achievements</h4>
            <p className="text-gray-600 text-sm">Unlock badges and rewards for completing challenges</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PositiveStreakSection;
