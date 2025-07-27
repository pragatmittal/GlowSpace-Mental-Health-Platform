import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'emotion-detection',
      title: 'Emotion Detection',
      description: 'Analyze your emotions in real-time',
      icon: '🎭',
      color: '#4CAF50',
      path: '/emotion-detector'
    },
    {
      id: 'mood-check',
      title: 'Mood Check-in',
      description: 'Track your current mood',
      icon: '😊',
      color: '#2196F3',
      path: '/mood-tracker'
    },
    {
      id: 'journal',
      title: 'Write Journal',
      description: 'Express your thoughts',
      icon: '📝',
      color: '#2196F3',
      path: '/journal'
    },
    {
      id: 'meditation',
      title: 'Start Meditation',
      description: 'Find your inner peace',
      icon: '🧘',
      color: '#9C27B0',
      path: '/meditation'
    },
    {
      id: 'appointment',
      title: 'Book Appointment',
      description: 'Schedule with therapist',
      icon: '📅',
      color: '#FF9800',
      path: '/appointments'
    },
    {
      id: 'resources',
      title: 'Browse Resources',
      description: 'Educational materials',
      icon: '📚',
      color: '#795548',
      path: '/resources'
    },
    {
      id: 'community',
      title: 'Join Community',
      description: 'Connect with others',
      icon: '👥',
      color: '#607D8B',
      path: '/community'
    }
  ];

  const handleActionClick = (action) => {
    navigate(action.path);
  };

  return (
    <div className="quick-actions">
      <div className="quick-actions-header">
        <h3>Quick Actions</h3>
        <p>Take care of your mental health</p>
      </div>
      
      <div className="quick-actions-grid">
        {quickActions.map((action) => (
          <button
            key={action.id}
            className="quick-action-card"
            onClick={() => handleActionClick(action)}
            style={{ '--action-color': action.color }}
          >
            <div className="quick-action-icon">
              {action.icon}
            </div>
            <div className="quick-action-content">
              <h4>{action.title}</h4>
              <p>{action.description}</p>
            </div>
            <div className="quick-action-arrow">
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
