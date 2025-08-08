import React, { useState, useEffect } from 'react';
import './RecentActivity.css';

const RecentActivity = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockActivities = [
          {
            id: 1,
            type: 'mood_check',
            title: 'Mood Check-in',
            description: 'Logged mood as "Good" with 3 emotions',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            icon: '😊',
            category: 'mood'
          },
          {
            id: 2,
            type: 'therapy_session',
            title: 'Therapy Session',
            description: 'Completed session with Dr. Sarah Johnson',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            icon: '💬',
            category: 'therapy'
          },
          {
            id: 3,
            type: 'journal_entry',
            title: 'Journal Entry',
            description: 'Wrote about daily reflections and gratitude',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            icon: '📝',
            category: 'journal'
          },
          {
            id: 4,
            type: 'goal_progress',
            title: 'Goal Achievement',
            description: 'Completed daily meditation goal',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            icon: '🎯',
            category: 'goal'
          },
          {
            id: 5,
            type: 'resource_access',
            title: 'Resource Access',
            description: 'Viewed "Managing Anxiety" guided meditation',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            icon: '📚',
            category: 'resource'
          }
        ];

        setActivities(mockActivities);
        setError(null);
      } catch (err) {
        setError('Failed to load recent activity');
        console.error('Error fetching recent activity:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecentActivity();
    }
  }, [userId]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      mood: '#4CAF50',
      therapy: '#2196F3',
      journal: '#FF9800',
      goal: '#9C27B0',
      resource: '#607D8B'
    };
    return colors[category] || '#757575';
  };

  if (loading) {
    return (
      <div className="recent-activity">
        <div className="recent-activity-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="recent-activity-content">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="activity-item skeleton">
              <div className="activity-icon skeleton-circle"></div>
              <div className="activity-details">
                <div className="activity-title skeleton-text"></div>
                <div className="activity-description skeleton-text"></div>
                <div className="activity-timestamp skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-activity">
        <div className="recent-activity-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="recent-activity-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="recent-activity-header">
        <h3>Recent Activity</h3>
        <button className="view-all-button">View All</button>
      </div>
      
      <div className="recent-activity-content">
        {activities.length === 0 ? (
          <div className="no-activity">
            <div className="no-activity-icon">📋</div>
            <p>No recent activity to display</p>
            <p className="no-activity-subtitle">
              Start your wellness journey by checking in with your mood!
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div 
                  className="activity-icon"
                  style={{ backgroundColor: getCategoryColor(activity.category) }}
                >
                  {activity.icon}
                </div>
                <div className="activity-details">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-timestamp">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
                <div className="activity-actions">
                  <button className="view-details-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
