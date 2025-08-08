import React from 'react';
import './WelcomeMessage.css';

const WelcomeMessage = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Every small step forward is progress worth celebrating.",
      "Your mental health journey matters, and you're doing great.",
      "Today is a new opportunity to prioritize your wellbeing.",
      "Remember, seeking help is a sign of strength, not weakness.",
      "You're not alone in this journey - we're here to support you.",
      "Take time to breathe and appreciate how far you've come.",
      "Your commitment to self-care is inspiring.",
      "Progress isn't always linear, and that's perfectly okay."
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="welcome-message">
      <div className="greeting-section">
        <h1 className="greeting-text">
          {getGreeting()}, {user?.name || 'Friend'}! 👋
        </h1>
        <p className="motivational-text">
          {getMotivationalMessage()}
        </p>
      </div>
      
      <div className="wellness-streak">
        <div className="streak-info">
          <span className="streak-number">{user?.wellnessStreak || 0}</span>
          <span className="streak-label">Day Streak</span>
        </div>
        <div className="streak-icon">🌟</div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
