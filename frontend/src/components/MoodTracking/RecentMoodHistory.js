import React, { useState, useEffect } from 'react';
import { moodAPI } from '../../services/api';
import { validateMoodEntry } from '../../utils/moodDataValidation';
import './RecentMoodHistory.css';

const RecentMoodHistory = ({ refreshTrigger }) => {
  const [recentMood, setRecentMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mood emoji mapping
  const moodEmojis = {
    'very_sad': '😢',
    'sad': '😞',
    'neutral': '😐',
    'happy': '😊',
    'very_happy': '😄'
  };

  // Mood color mapping
  const moodColors = {
    'very_sad': '#e74c3c',
    'sad': '#f39c12',
    'neutral': '#f1c40f',
    'happy': '#2ecc71',
    'very_happy': '#27ae60'
  };

  // Mood label mapping
  const moodLabels = {
    'very_sad': 'Very Sad',
    'sad': 'Sad',
    'neutral': 'Neutral',
    'happy': 'Happy',
    'very_happy': 'Very Happy'
  };

  // Fetch recent mood data
  const fetchRecentMood = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await moodAPI.getRecentMood();
      
      // Validate response structure and data
      if (response?.data?.success && response.data.data) {
        const validatedMood = validateMoodEntry(response.data.data);
        setRecentMood(validatedMood);
      } else {
        setRecentMood(null);
      }
    } catch (err) {
      console.error('Error fetching recent mood:', err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Please log in to view your mood history');
      } else if (err.response?.status === 404) {
        setError('Mood tracking service unavailable');
      } else if (!navigator.onLine) {
        setError('Please check your internet connection');
      } else {
        setError('Failed to load recent mood data');
      }
      
      setRecentMood(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when refreshTrigger changes
  useEffect(() => {
    fetchRecentMood();
  }, [refreshTrigger]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMins = Math.floor((now - date) / (1000 * 60));
      return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Truncate description
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="recent-mood-history">
        <div className="recent-mood-header">
          <h3>📝 Recent Mood</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner-small"></div>
          <p>Loading recent mood...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-mood-history">
        <div className="recent-mood-header">
          <h3>📝 Recent Mood</h3>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchRecentMood} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-mood-history">
      <div className="recent-mood-header">
        <h3>📝 Recent Mood</h3>
        <p>Your latest mood entry</p>
      </div>

      <div className="recent-mood-content">
        {recentMood ? (
          <div className="mood-entry-card">
            {/* Mood Display */}
            <div className="mood-display">
              <div 
                className="mood-emoji-circle"
                style={{ backgroundColor: moodColors[recentMood.mood] }}
              >
                <span className="mood-emoji-large">
                  {moodEmojis[recentMood.mood]}
                </span>
              </div>
              <div className="mood-info">
                <h4 className="mood-title">
                  {moodLabels[recentMood.mood]}
                </h4>
                <div className="mood-meta">
                  <span className="mood-timestamp">
                    {formatTimestamp(recentMood.createdAt)}
                  </span>
                </div>
              </div>
            </div>



            {/* Update Animation */}
            <div className="entry-animation">
              <div className="pulse-ring"></div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h4>No mood entries yet</h4>
            <p>Start tracking your mood to see your latest entry here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentMoodHistory;
