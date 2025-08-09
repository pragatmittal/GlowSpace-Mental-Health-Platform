import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ stats, isLoading }) => {
  const defaultStats = {
    totalSessions: 0,
    averageMood: 0,
    completedGoals: 0,
    streakDays: 0,
    upcomingAppointments: 0,
    activeChatSessions: 0,
    completedAssessments: 0,
    hoursOfSupport: 0
  };

  const displayStats = stats || defaultStats;

  const statItems = [
    {
      icon: '🧠',
      label: 'Total Sessions',
      value: displayStats.totalSessions,
      color: '#4CAF50',
      description: 'Completed therapy sessions'
    },
    {
      icon: '😊',
      label: 'Average Mood',
      value: displayStats.averageMood ? (typeof displayStats.averageMood === 'number' ? `${displayStats.averageMood.toFixed(1)}/10` : `${displayStats.averageMood}/10`) : '0.0/10',
      color: '#FF9800',
      description: 'Your mood rating average'
    },
    {
      icon: '🎯',
      label: 'Goals Completed',
      value: displayStats.completedGoals,
      color: '#2196F3',
      description: 'Successfully achieved goals'
    },
    {
      icon: '🔥',
      label: 'Streak Days',
      value: displayStats.streakDays,
      color: '#FF5722',
      description: 'Consecutive days of engagement'
    },
    {
      icon: '📅',
      label: 'Upcoming Appointments',
      value: displayStats.upcomingAppointments,
      color: '#9C27B0',
      description: 'Scheduled counseling sessions'
    },
    {
      icon: '💬',
      label: 'Active Chats',
      value: displayStats.activeChatSessions,
      color: '#00BCD4',
      description: 'Ongoing chat conversations'
    },
    {
      icon: '📊',
      label: 'Assessments',
      value: displayStats.completedAssessments,
      color: '#795548',
      description: 'Completed mental health assessments'
    },
    {
      icon: '⏰',
      label: 'Support Hours',
      value: displayStats.hoursOfSupport,
      color: '#607D8B',
      description: 'Total hours of support received'
    }
  ];

  if (isLoading) {
    return (
      <div className="dashboard-stats">
        <div className="stats-header">
          <h2>Your Wellness Statistics</h2>
          <p>Loading your progress...</p>
        </div>
        <div className="stats-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="stat-card loading">
              <div className="stat-icon loading-skeleton"></div>
              <div className="stat-content">
                <div className="stat-value loading-skeleton"></div>
                <div className="stat-label loading-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h2>Your Wellness Statistics</h2>
        <p>Track your mental health journey and celebrate your progress</p>
      </div>
      
      <div className="stats-grid">
        {statItems.map((item, index) => (
          <div key={index} className="stat-card" style={{ '--accent-color': item.color }}>
            <div className="stat-icon">
              {item.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-description">{item.description}</div>
            </div>
            <div className="stat-progress-indicator">
              <div className="progress-dot"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="stats-insights">
        <div className="insight-card">
          <div className="insight-icon">✨</div>
          <div className="insight-content">
            <h3>Great Progress!</h3>
            <p>You've been consistently engaging with your mental health tools. Keep up the excellent work!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
