import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'mood-check',
      title: 'Track Mood',
      description: 'Quick mood check-in',
      icon: '😊',
      color: '#2196F3',
      path: '/moodtracking'
    },
    {
      id: 'emotion-detection',
      title: 'Emotion AI',
      description: 'Analyze emotions',
      icon: '🎭',
      color: '#4CAF50',
      path: '/emotion-detector'
    },
    {
      id: 'appointment',
      title: 'Book Session',
      description: 'Schedule therapy',
      icon: '📅',
      color: '#FF9800',
      path: '/counseling'
    },
    {
      id: 'assessment',
      title: 'Assessment',
      description: 'Mental health check',
      icon: '📋',
      color: '#9C27B0',
      path: '/assessment'
    },
    {
      id: 'community',
      title: 'Community',
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
