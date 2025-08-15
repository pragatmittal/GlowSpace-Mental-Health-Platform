import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MoodEntry from '../components/MoodTracking/MoodEntry';
import RecentMoodHistory from '../components/MoodTracking/RecentMoodHistory';
import MoodChart from '../components/MoodTracking/MoodChart';
import MoodInsights from '../components/MoodTracking/MoodInsights';
import MoodErrorBoundary from '../components/common/MoodErrorBoundary';
import './MoodTracking.css';

const MoodTracking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-refresh mechanism when new mood is added
  const handleMoodAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mood-tracking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mood tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracking-page">
      <div className="mood-tracking-container">
        {/* Page Header */}
        <div className="page-header">
          <h1>🌱 Mood Tracking</h1>
          <p>Track your daily emotions and discover patterns in your mental wellbeing</p>
        </div>

        {/* Main Mood Tracking Grid */}
        <div className="mood-tracking-grid">
          
          {/* Box 1: Mood Entry (Full Width) */}
          <div className="mood-box mood-entry-box">
            <MoodErrorBoundary>
              <MoodEntry onMoodAdded={handleMoodAdded} />
            </MoodErrorBoundary>
          </div>

          {/* Box 2: Recent Mood History (50% Width, Left) */}
          <div className="mood-box recent-history-box">
            <MoodErrorBoundary>
              <RecentMoodHistory refreshTrigger={refreshTrigger} />
            </MoodErrorBoundary>
          </div>

          {/* Box 3: Mood Chart (50% Width, Right) */}
          <div className="mood-box mood-chart-box">
            <MoodErrorBoundary>
              <MoodChart refreshTrigger={refreshTrigger} />
            </MoodErrorBoundary>
          </div>

          {/* Box 4: Mood Insights (Full Width) */}
          <div className="mood-box mood-insights-box">
            <MoodErrorBoundary>
              <MoodInsights refreshTrigger={refreshTrigger} />
            </MoodErrorBoundary>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MoodTracking;
