import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { moodAPI } from '../../services/apiWrapper';
import './MoodTrackingBox.css';

const MoodTrackingBox = () => {
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Refs for cleanup and preventing multiple calls
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);

  // Mood emoji mapping
  const moodEmojis = {
    'very_sad': '😢',
    'sad': '😞',
    'neutral': '😐',
    'happy': '😊',
    'very_happy': '😄'
  };

  // Mood colors
  const moodColors = {
    'very_sad': '#e74c3c',
    'sad': '#f39c12',
    'neutral': '#f1c40f',
    'happy': '#2ecc71',
    'very_happy': '#27ae60'
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchMoodData();

    // Listen for mood updates from the mood tracking page
    const handleMoodUpdate = () => {
      console.log('🔄 Dashboard MoodTrackingBox: Received mood update event');
      // Add small delay to prevent rapid-fire updates
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchMoodData();
        }
      }, 1000);
    };

    // Listen for custom mood update events
    window.addEventListener('moodDataUpdated', handleMoodUpdate);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('moodDataUpdated', handleMoodUpdate);
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

  const fetchMoodData = async () => {
    const now = Date.now();
    const minInterval = 2000; // Minimum 2 seconds between fetches
    
    // Prevent too frequent calls
    if (now - lastFetchTimeRef.current < minInterval) {
      console.log('⏳ MoodTrackingBox fetch skipped - too frequent');
      return;
    }
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    lastFetchTimeRef.current = now;

    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);

      // Fetch recent mood and basic analytics with error handling
      const [recentResponse, analyticsResponse, streaksResponse] = await Promise.allSettled([
        moodAPI.getRecentMood(),
        moodAPI.getAnalytics({ timeRange: '7d' }),
        moodAPI.getStreaks()
      ]);

      if (!isMountedRef.current) return;

      const data = {
        recentMood: recentResponse.status === 'fulfilled' && recentResponse.value.data.success 
          ? recentResponse.value.data.data 
          : null,
        analytics: analyticsResponse.status === 'fulfilled' && analyticsResponse.value.data.success 
          ? analyticsResponse.value.data.data.summary 
          : null,
        streaks: streaksResponse.status === 'fulfilled' && streaksResponse.value.data.success 
          ? streaksResponse.value.data.data 
          : null
      };

      setMoodData(data);

      // No event dispatching to prevent circular dependencies and flickering

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 MoodTrackingBox fetch aborted');
        return;
      }
      
      console.error('Error fetching mood data for dashboard:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load mood data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handleTrackMoodClick = () => {
    navigate('/moodtracking');
  };

  const handleViewDetailsClick = () => {
    navigate('/moodtracking');
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="mood-tracking-box">
        <div className="box-header">
          <h3>🎭 Mood Tracking</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading mood data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mood-tracking-box">
        <div className="box-header">
          <h3>🎭 Mood Tracking</h3>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchMoodData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No mood data yet - show welcome state
  if (!moodData?.recentMood && (!moodData?.analytics || moodData.analytics.totalEntries === 0)) {
    return (
      <div className="mood-tracking-box">
        <div className="box-header">
          <h3>🎭 Mood Tracking</h3>
        </div>
        <div className="welcome-state">
          <div className="welcome-icon">🌟</div>
          <h4>Start Your Mood Journey</h4>
          <p>Track your daily emotions and discover patterns in your mental wellbeing.</p>
          <button onClick={handleTrackMoodClick} className="track-mood-btn">
            📝 Track Your First Mood
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracking-box">
      <div className="box-header">
        <h3>🎭 Mood Tracking</h3>
        <button onClick={handleViewDetailsClick} className="view-details-btn">
          View All
        </button>
      </div>

      <div className="mood-content">
        {/* Recent Mood */}
        {moodData.recentMood && (
          <div className="recent-mood-section">
            <h4>Latest Mood</h4>
            <div className="recent-mood-display">
              <div 
                className="mood-emoji-circle"
                style={{ backgroundColor: moodColors[moodData.recentMood.mood] }}
              >
                {moodEmojis[moodData.recentMood.mood]}
              </div>
              <div className="recent-mood-info">
                <div className="mood-label">
                  {moodData.recentMood.moodLabel || moodData.recentMood.mood.replace('_', ' ')}
                </div>
                <div className="mood-time">
                  {formatTimeAgo(moodData.recentMood.createdAt)}
                </div>
                {moodData.recentMood.notes && (
                  <div className="mood-notes">
                    "{moodData.recentMood.notes.substring(0, 50)}
                    {moodData.recentMood.notes.length > 50 ? '...' : ''}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{moodData.analytics?.totalEntries || 0}</div>
              <div className="stat-label">Total Entries</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <div className="stat-value">{moodData.streaks?.currentPositiveStreak || 0}</div>
              <div className="stat-label">Positive Streak</div>
            </div>
          </div>
          
          {moodData.analytics?.averageIntensity && (
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">{moodData.analytics.averageIntensity.toFixed(1)}</div>
                <div className="stat-label">Avg Mood</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={handleTrackMoodClick} className="quick-track-btn">
            <span className="btn-icon">➕</span>
            Track Mood Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodTrackingBox;
