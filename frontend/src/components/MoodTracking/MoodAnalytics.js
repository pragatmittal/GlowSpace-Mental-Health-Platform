import React, { useState, useEffect } from 'react';
import './MoodAnalytics.css';

const MoodAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data
  useEffect(() => {
    const mockAnalytics = {
      overview: {
        totalEntries: 45,
        averageMood: 3.2,
        moodDistribution: {
          very_happy: 8,
          happy: 15,
          neutral: 12,
          sad: 7,
          very_sad: 3
        },
        trackingStreak: 12,
        positiveStreak: 5,
        mostFrequentActivity: 'work',
        mostFrequentContext: 'alone'
      },
      patterns: {
        weeklyPattern: 'Mondays tend to be your lowest mood days',
        monthlyPattern: 'Your mood improves significantly in the second half of the month',
        timeOfDay: {
          morning: 3.8,
          afternoon: 3.2,
          evening: 3.5,
          night: 2.9
        },
        activityCorrelation: [
          { activity: 'exercise', avgMood: 4.2, frequency: 8 },
          { activity: 'social', avgMood: 4.0, frequency: 12 },
          { activity: 'work', avgMood: 2.8, frequency: 15 },
          { activity: 'relaxation', avgMood: 3.5, frequency: 6 },
          { activity: 'creative', avgMood: 3.8, frequency: 4 }
        ],
        socialCorrelation: [
          { context: 'with_friends', avgMood: 4.1, frequency: 10 },
          { context: 'alone', avgMood: 2.9, frequency: 20 },
          { context: 'with_family', avgMood: 3.8, frequency: 8 },
          { context: 'at_work', avgMood: 2.7, frequency: 7 }
        ]
      },
      trends: {
        overallTrend: 'improving',
        trendStrength: 0.6,
        recentChanges: [
          'Mood has improved 15% over the last 2 weeks',
          'Exercise frequency increased by 40%',
          'Social interactions up by 25%'
        ],
        predictions: [
          'Continued improvement expected with current patterns',
          'Weekend activities show positive correlation',
          'Morning routine changes may boost mood'
        ]
      },
      insights: [
        {
          type: 'pattern',
          message: 'Your mood is 40% better on days you exercise',
          priority: 'high',
          actionable: true
        },
        {
          type: 'improvement',
          message: 'You\'ve maintained a positive streak for 5 days',
          priority: 'medium',
          actionable: false
        },
        {
          type: 'warning',
          message: 'Mondays show consistently lower mood scores',
          priority: 'medium',
          actionable: true
        }
      ]
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, []);

  const moodLabels = {
    'very_happy': 'Very Happy',
    'happy': 'Happy',
    'neutral': 'Neutral',
    'sad': 'Sad',
    'very_sad': 'Very Sad'
  };

  const moodColors = {
    'very_happy': '#27ae60',
    'happy': '#2ecc71',
    'neutral': '#f1c40f',
    'sad': '#f39c12',
    'very_sad': '#e74c3c'
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const getMoodPercentage = (count, total) => {
    return ((count / total) * 100).toFixed(1);
  };

  const getTrendIcon = (trend) => {
    return trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';
  };

  const getTrendColor = (trend) => {
    return trend === 'improving' ? '#27ae60' : trend === 'declining' ? '#e74c3c' : '#f39c12';
  };

  if (loading) {
    return (
      <div className="mood-analytics">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-analytics">
      <div className="analytics-header">
        <h2>Mood Analytics</h2>
        <p>Deep insights into your mood patterns and trends</p>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <label>Time Range:</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          {timeRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>

      {/* Analytics Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          🔍 Patterns
        </button>
        <button 
          className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          📈 Trends
        </button>
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 Insights
        </button>
      </div>

      {/* Analytics Content */}
      <div className="analytics-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>{analytics.overview.totalEntries}</h3>
                  <p>Total Entries</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{analytics.overview.averageMood.toFixed(1)}</h3>
                  <p>Average Mood</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <h3>{analytics.overview.trackingStreak}</h3>
                  <p>Tracking Streak</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>{analytics.overview.positiveStreak}</h3>
                  <p>Positive Streak</p>
                </div>
              </div>
            </div>

            <div className="mood-distribution">
              <h3>Mood Distribution</h3>
              <div className="distribution-chart">
                {Object.entries(analytics.overview.moodDistribution).map(([mood, count]) => (
                  <div key={mood} className="distribution-bar">
                    <div className="bar-label">{moodLabels[mood]}</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${getMoodPercentage(count, analytics.overview.totalEntries)}%`,
                          backgroundColor: moodColors[mood]
                        }}
                      ></div>
                    </div>
                    <div className="bar-value">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="frequent-activities">
              <div className="activity-card">
                <h4>Most Frequent Activity</h4>
                <p>{analytics.overview.mostFrequentActivity}</p>
              </div>
              <div className="activity-card">
                <h4>Most Frequent Context</h4>
                <p>{analytics.overview.mostFrequentContext}</p>
              </div>
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="patterns-section">
            <div className="pattern-cards">
              <div className="pattern-card">
                <h3>Weekly Pattern</h3>
                <p>{analytics.patterns.weeklyPattern}</p>
              </div>
              
              <div className="pattern-card">
                <h3>Monthly Pattern</h3>
                <p>{analytics.patterns.monthlyPattern}</p>
              </div>
            </div>

            <div className="time-of-day-analysis">
              <h3>Time of Day Analysis</h3>
              <div className="time-chart">
                {Object.entries(analytics.patterns.timeOfDay).map(([time, avgMood]) => (
                  <div key={time} className="time-bar">
                    <div className="time-label">{time}</div>
                    <div className="time-container">
                      <div 
                        className="time-fill"
                        style={{ 
                          width: `${(avgMood / 5) * 100}%`,
                          backgroundColor: avgMood >= 4 ? '#27ae60' : avgMood >= 3 ? '#f39c12' : '#e74c3c'
                        }}
                      ></div>
                    </div>
                    <div className="time-value">{avgMood.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="correlation-analysis">
              <div className="activity-correlation">
                <h3>Activity Correlation</h3>
                <div className="correlation-list">
                  {analytics.patterns.activityCorrelation.map((item, index) => (
                    <div key={index} className="correlation-item">
                      <div className="correlation-info">
                        <span className="correlation-label">{item.activity}</span>
                        <span className="correlation-frequency">({item.frequency} times)</span>
                      </div>
                      <div className="correlation-mood">
                        <span className="mood-score">{item.avgMood.toFixed(1)}</span>
                        <div 
                          className="mood-indicator"
                          style={{ backgroundColor: item.avgMood >= 4 ? '#27ae60' : item.avgMood >= 3 ? '#f39c12' : '#e74c3c' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="social-correlation">
                <h3>Social Context Correlation</h3>
                <div className="correlation-list">
                  {analytics.patterns.socialCorrelation.map((item, index) => (
                    <div key={index} className="correlation-item">
                      <div className="correlation-info">
                        <span className="correlation-label">
                          {item.context.replace('_', ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                        <span className="correlation-frequency">({item.frequency} times)</span>
                      </div>
                      <div className="correlation-mood">
                        <span className="mood-score">{item.avgMood.toFixed(1)}</span>
                        <div 
                          className="mood-indicator"
                          style={{ backgroundColor: item.avgMood >= 4 ? '#27ae60' : item.avgMood >= 3 ? '#f39c12' : '#e74c3c' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="trends-section">
            <div className="trend-overview">
              <div className="trend-card">
                <div className="trend-header">
                  <span className="trend-icon">{getTrendIcon(analytics.trends.overallTrend)}</span>
                  <h3>Overall Trend</h3>
                </div>
                <div className="trend-content">
                  <p className="trend-description">
                    Your mood is {analytics.trends.overallTrend}
                  </p>
                  <div className="trend-strength">
                    <span>Strength: {(analytics.trends.trendStrength * 100).toFixed(0)}%</span>
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{ 
                          width: `${analytics.trends.trendStrength * 100}%`,
                          backgroundColor: getTrendColor(analytics.trends.overallTrend)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="trend-details">
              <div className="recent-changes">
                <h3>Recent Changes</h3>
                <ul>
                  {analytics.trends.recentChanges.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>

              <div className="predictions">
                <h3>Predictions</h3>
                <ul>
                  {analytics.trends.predictions.map((prediction, index) => (
                    <li key={index}>{prediction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="insights-section">
            <div className="insights-list">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-header">
                    <div className="insight-type">
                      {insight.type === 'pattern' ? '🔍' : 
                       insight.type === 'improvement' ? '📈' : 
                       insight.type === 'warning' ? '⚠️' : '💡'}
                    </div>
                    <div className="insight-priority">
                      <span className={`priority-badge ${insight.priority}`}>
                        {insight.priority}
                      </span>
                    </div>
                  </div>
                  <div className="insight-content">
                    <p>{insight.message}</p>
                    {insight.actionable && (
                      <button className="action-button">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalytics; 