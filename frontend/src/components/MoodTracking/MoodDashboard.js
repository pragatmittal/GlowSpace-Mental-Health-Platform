import React, { useState, useEffect } from 'react';
import { moodAPI } from '../../services/api';
import MoodStreaks from './MoodStreaks';
import MoodInsights from './MoodInsights';
import QuickMoodEntry from './QuickMoodEntry';
import MoodChart from './MoodChart';
import './MoodDashboard.css';

const MoodDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsResponse, streaksResponse, insightsResponse] = await Promise.all([
        moodAPI.getAnalytics({ timeRange }),
        moodAPI.getStreaks(),
        moodAPI.getInsights({ days: 30 })
      ]);

      setDashboardData({
        analytics: analyticsResponse.data.data,
        streaks: streaksResponse.data.data,
        insights: insightsResponse.data.data
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load mood tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleEntryCreated = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="mood-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your mood data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mood-dashboard">
        <div className="error-container">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-dashboard">
      {/* Quick Entry Section */}
      <div className="dashboard-section quick-entry-section">
        <h2>How are you feeling right now?</h2>
        <QuickMoodEntry onEntryCreated={handleEntryCreated} />
      </div>

      {/* Stats Overview */}
      <div className="dashboard-section stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{dashboardData?.analytics?.summary?.totalEntries || 0}</h3>
              <p>Total Entries</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{dashboardData?.streaks?.currentTrackingStreak || 0}</h3>
              <p>Day Streak</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{dashboardData?.streaks?.currentPositiveStreak || 0}</h3>
              <p>Positive Days</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💡</div>
            <div className="stat-content">
              <h3>{dashboardData?.insights?.length || 0}</h3>
              <p>Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Mood Chart */}
        <div className="dashboard-item mood-chart-item">
          <div className="chart-header">
            <h3>Mood Trends</h3>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-selector"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <MoodChart data={dashboardData?.analytics?.trends} timeRange={timeRange} />
        </div>

        {/* Mood Streaks */}
        <div className="dashboard-item streaks-item">
          <h3>Your Streaks</h3>
          <MoodStreaks streaks={dashboardData?.streaks} />
        </div>

        {/* Mood Insights */}
        <div className="dashboard-item insights-item">
          <h3>Recent Insights</h3>
          <MoodInsights insights={dashboardData?.insights} compact={true} />
        </div>

        {/* Activity Correlation */}
        <div className="dashboard-item activity-item">
          <h3>Activity Impact</h3>
          <div className="activity-correlation">
            {dashboardData?.analytics?.summary?.activityCorrelation && 
              Object.entries(dashboardData.analytics.summary.activityCorrelation)
                .sort(([,a], [,b]) => b.average - a.average)
                .slice(0, 5)
                .map(([activity, data]) => (
                  <div key={activity} className="activity-item">
                    <div className="activity-info">
                      <span className="activity-name">{activity}</span>
                      <span className="activity-count">({data.total} entries)</span>
                    </div>
                    <div className="activity-mood">
                      <div 
                        className="mood-indicator" 
                        style={{ 
                          backgroundColor: getMoodColor(data.average),
                          width: `${(data.average / 4) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Time of Day Analysis */}
        <div className="dashboard-item time-analysis-item">
          <h3>Best Times</h3>
          <div className="time-analysis">
            {dashboardData?.analytics?.summary?.timeCorrelation && 
              Object.entries(dashboardData.analytics.summary.timeCorrelation)
                .sort(([,a], [,b]) => b.average - a.average)
                .map(([time, data]) => (
                  <div key={time} className="time-item">
                    <div className="time-info">
                      <span className="time-name">{time}</span>
                      <span className="time-count">({data.total} entries)</span>
                    </div>
                    <div className="time-mood">
                      <div 
                        className="mood-indicator" 
                        style={{ 
                          backgroundColor: getMoodColor(data.average),
                          width: `${(data.average / 4) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Social Context */}
        <div className="dashboard-item social-item">
          <h3>Social Impact</h3>
          <div className="social-analysis">
            {dashboardData?.analytics?.summary?.socialCorrelation && 
              Object.entries(dashboardData.analytics.summary.socialCorrelation)
                .sort(([,a], [,b]) => b.average - a.average)
                .map(([context, data]) => (
                  <div key={context} className="social-item">
                    <div className="social-info">
                      <span className="social-name">{formatSocialContext(context)}</span>
                      <span className="social-count">({data.total} entries)</span>
                    </div>
                    <div className="social-mood">
                      <div 
                        className="mood-indicator" 
                        style={{ 
                          backgroundColor: getMoodColor(data.average),
                          width: `${(data.average / 4) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getMoodColor = (moodIndex) => {
  const colors = {
    0: '#e74c3c', // very_sad
    1: '#f39c12', // sad
    2: '#f1c40f', // neutral
    3: '#2ecc71', // happy
    4: '#27ae60'  // very_happy
  };
  return colors[Math.round(moodIndex)] || '#bdc3c7';
};

const formatSocialContext = (context) => {
  const contextMap = {
    'alone': 'Alone',
    'with_friends': 'With Friends',
    'with_family': 'With Family',
    'at_work': 'At Work',
    'in_public': 'In Public',
    'at_home': 'At Home',
    'online': 'Online',
    'offline': 'Offline',
    'mixed': 'Mixed'
  };
  return contextMap[context] || context;
};

export default MoodDashboard; 