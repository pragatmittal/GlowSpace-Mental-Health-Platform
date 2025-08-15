import React, { useState, useEffect } from 'react';
import { moodAPI } from '../../services/api';
import { validateAnalyticsResponse } from '../../utils/moodDataValidation';
import './MoodInsights.css';

const MoodInsights = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState(null);
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

  // Fetch insights data
  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple data sources for comprehensive insights with error handling
      const requests = [
        moodAPI.getAnalytics({ timeRange: '30d' }).catch(err => ({ error: err, data: { success: false } })),
        moodAPI.getStreaks().catch(err => ({ error: err, data: { success: false } })),
        moodAPI.getPatterns({ days: 30 }).catch(err => ({ error: err, data: { success: false } }))
      ];

      const [analyticsResponse, streaksResponse, patternsResponse] = await Promise.all(requests);

      // Validate and extract data using the validation utility
      const analytics = validateAnalyticsResponse(analyticsResponse);
      const streaks = streaksResponse?.data?.success ? streaksResponse.data.data : {};
      const patterns = patternsResponse?.data?.success ? patternsResponse.data.data : [];

      // Calculate comprehensive insights with validated data
      const calculatedInsights = calculateInsights(analytics, streaks, patterns);
      setInsights(calculatedInsights);

    } catch (err) {
      console.error('Error fetching insights:', err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Please log in to view your mood insights');
      } else if (err.response?.status === 404) {
        setError('Mood tracking service unavailable');
      } else if (!navigator.onLine) {
        setError('Please check your internet connection');
      } else {
        setError('Failed to load insights');
      }
      
      setInsights(getEmptyInsights());
    } finally {
      setLoading(false);
    }
  };

  // Calculate insights from data
  const calculateInsights = (analytics, streaks, patterns) => {
    // Safely extract data with fallbacks
    const summary = analytics?.summary || {};
    const trends = Array.isArray(analytics?.trends) ? analytics.trends : [];
    
    // Calculate statistics with validation
    const totalMoods = Number(summary.totalEntries) || 0;
    
    // Find most frequent mood with validation
    const moodCounts = summary.moodCounts || {};
    const validMoodCounts = Object.keys(moodCounts).filter(mood => 
      ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].includes(mood)
    );
    
    const mostFrequentMood = validMoodCounts.length > 0 
      ? validMoodCounts.reduce((a, b) => (moodCounts[a] || 0) > (moodCounts[b] || 0) ? a : b, 'neutral')
      : 'neutral';
    
    // Calculate best and worst days with validation
    const validTrends = trends.filter(trend => trend && typeof trend.avgMood === 'number' && !isNaN(trend.avgMood));
    const sortedTrends = validTrends.sort((a, b) => (b.avgMood || 0) - (a.avgMood || 0));
    const bestDay = sortedTrends[0];
    const worstDay = sortedTrends[sortedTrends.length - 1];
    
    // Calculate weekly improvement with validation
    const recentWeek = validTrends.slice(-7);
    const previousWeek = validTrends.slice(-14, -7);
    
    const recentAvg = recentWeek.length > 0 
      ? recentWeek.reduce((sum, t) => sum + (t.avgMood || 0), 0) / recentWeek.length 
      : 0;
    const previousAvg = previousWeek.length > 0 
      ? previousWeek.reduce((sum, t) => sum + (t.avgMood || 0), 0) / previousWeek.length 
      : 0;
    
    const weeklyImprovement = previousAvg > 0 
      ? ((recentAvg - previousAvg) / previousAvg * 100) 
      : 0;
    
    // Monthly mood distribution with validation
    const safeMoodCounts = {
      'very_happy': Number(moodCounts.very_happy) || 0,
      'happy': Number(moodCounts.happy) || 0,
      'neutral': Number(moodCounts.neutral) || 0,
      'sad': Number(moodCounts.sad) || 0,
      'very_sad': Number(moodCounts.very_sad) || 0
    };
    
    const moodDistribution = {};
    Object.keys(safeMoodCounts).forEach(mood => {
      moodDistribution[mood] = totalMoods > 0 ? (safeMoodCounts[mood] / totalMoods * 100) : 0;
    });
    
    // Activity analysis with validation
    const activityCorrelation = summary.activityCorrelation || {};
    const validActivities = Object.entries(activityCorrelation)
      .filter(([, data]) => data && typeof data.average === 'number' && !isNaN(data.average));
    const bestActivity = validActivities.length > 0 
      ? validActivities.sort(([,a], [,b]) => (b.average || 0) - (a.average || 0))[0]
      : null;
    
    // Time analysis with validation
    const timeCorrelation = summary.timeCorrelation || {};
    const validTimes = Object.entries(timeCorrelation)
      .filter(([, data]) => data && typeof data.average === 'number' && !isNaN(data.average));
    const bestTime = validTimes.length > 0 
      ? validTimes.sort(([,a], [,b]) => (b.average || 0) - (a.average || 0))[0]
      : null;

    return {
      totalMoods,
      avgMood: isNaN(Number(summary.avgMood) || 3) ? 0 : Math.round((Number(summary.avgMood) || 3) * 10) / 10,
      mostFrequentMood,
      currentStreak: Number(streaks?.currentPositiveStreak) || 0,
      longestStreak: Number(streaks?.maxPositiveStreak) || 0,
      bestDay: bestDay ? {
        date: bestDay.date,
        mood: Math.round(bestDay.avgMood || 0),
        formatted: formatDate(bestDay.date)
      } : null,
      worstDay: worstDay ? {
        date: worstDay.date,
        mood: Math.round(worstDay.avgMood || 0),
        formatted: formatDate(worstDay.date)
      } : null,
      weeklyImprovement: isNaN(weeklyImprovement) ? 0 : Math.round(weeklyImprovement * 10) / 10,
      moodDistribution,
      bestActivity: bestActivity ? {
        name: bestActivity[0],
        average: Math.round((bestActivity[1].average || 0) * 10) / 10
      } : null,
      bestTime: bestTime ? {
        name: bestTime[0],
        average: Math.round((bestTime[1].average || 0) * 10) / 10
      } : null,
      consistencyScore: Math.round((totalMoods / 30) * 100) || 0 // percentage of days tracked in last 30 days
    };
  };

  // Get empty insights for new users
  const getEmptyInsights = () => ({
    totalMoods: 0,
    avgMood: 0,
    mostFrequentMood: 'neutral',
    currentStreak: 0,
    longestStreak: 0,
    bestDay: null,
    worstDay: null,
    weeklyImprovement: 0,
    moodDistribution: {
      'very_happy': 0,
      'happy': 0,
      'neutral': 0,
      'sad': 0,
      'very_sad': 0
    },
    bestActivity: null,
    bestTime: null,
    consistencyScore: 0
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get mood label
  const getMoodLabel = (moodValue) => {
    const labels = {
      1: 'Very Sad',
      2: 'Sad', 
      3: 'Neutral',
      4: 'Happy',
      5: 'Very Happy'
    };
    return labels[moodValue] || 'Neutral';
  };

  // Get mood color
  const getMoodColor = (mood) => {
    const colors = {
      'very_sad': '#e74c3c',
      'sad': '#f39c12',
      'neutral': '#f1c40f',
      'happy': '#2ecc71',
      'very_happy': '#27ae60'
    };
    return colors[mood] || colors.neutral;
  };

  // Fetch data on mount and when refreshTrigger changes
  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="mood-insights">
        <div className="insights-header">
          <h3>💡 Mood Insights</h3>
          <p>Personal analytics and patterns</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner-small"></div>
          <p>Calculating insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mood-insights">
        <div className="insights-header">
          <h3>💡 Mood Insights</h3>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchInsights} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = insights.totalMoods === 0;

  return (
    <div className="mood-insights">
      {/* Header */}
      <div className="insights-header">
        <h3>💡 Mood Insights</h3>
        <p>Personal analytics and patterns from your mood tracking journey</p>
      </div>

      {/* Content */}
      <div className="insights-content">
        {isEmpty ? (
          <div className="empty-insights">
            <div className="empty-icon">🔮</div>
            <h4>No insights yet</h4>
            <p>Start tracking your mood regularly to unlock personalized insights and discover patterns in your emotional wellbeing!</p>
          </div>
        ) : (
          <div className="insights-grid">
            
            {/* Total Moods */}
            <div className="insight-card primary">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h4>Total Moods</h4>
                <div className="insight-value">{insights.totalMoods}</div>
                <p>Entries recorded</p>
              </div>
            </div>

            {/* Average Mood */}
            <div className="insight-card secondary">
              <div className="insight-icon">
                {moodEmojis[insights.mostFrequentMood]}
              </div>
              <div className="insight-content">
                <h4>Average Mood</h4>
                <div className="insight-value">{insights.avgMood}/5</div>
                <p>{getMoodLabel(Math.round(insights.avgMood))}</p>
              </div>
            </div>

            {/* Most Frequent Mood */}
            <div className="insight-card tertiary">
              <div 
                className="insight-icon mood-circle"
                style={{ backgroundColor: getMoodColor(insights.mostFrequentMood) }}
              >
                {moodEmojis[insights.mostFrequentMood]}
              </div>
              <div className="insight-content">
                <h4>Most Frequent</h4>
                <div className="insight-value">
                  {insights.mostFrequentMood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <p>Your common mood</p>
              </div>
            </div>

            {/* Current Streak */}
            <div className="insight-card success">
              <div className="insight-icon">🔥</div>
              <div className="insight-content">
                <h4>Current Streak</h4>
                <div className="insight-value">{insights.currentStreak}</div>
                <p>Days of positive moods</p>
              </div>
            </div>

            {/* Best Day */}
            {insights.bestDay && (
              <div className="insight-card highlight">
                <div className="insight-icon">⭐</div>
                <div className="insight-content">
                  <h4>Best Day</h4>
                  <div className="insight-value">{insights.bestDay.formatted}</div>
                  <p>{getMoodLabel(insights.bestDay.mood)} mood</p>
                </div>
              </div>
            )}

            {/* Consistency Score */}
            <div className="insight-card info">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Consistency</h4>
                <div className="insight-value">{insights.consistencyScore}%</div>
                <p>Tracking regularity</p>
              </div>
            </div>

            {/* Weekly Improvement */}
            <div className={`insight-card ${insights.weeklyImprovement >= 0 ? 'positive' : 'negative'}`}>
              <div className="insight-icon">
                {insights.weeklyImprovement >= 0 ? '📈' : '📉'}
              </div>
              <div className="insight-content">
                <h4>Weekly Change</h4>
                <div className="insight-value">
                  {insights.weeklyImprovement > 0 ? '+' : ''}{insights.weeklyImprovement}%
                </div>
                <p>{insights.weeklyImprovement >= 0 ? 'Improving' : 'Declining'}</p>
              </div>
            </div>

            {/* Best Activity */}
            {insights.bestActivity && (
              <div className="insight-card activity">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <h4>Best Activity</h4>
                  <div className="insight-value">
                    {insights.bestActivity.name.charAt(0).toUpperCase() + insights.bestActivity.name.slice(1)}
                  </div>
                  <p>Boosts your mood most</p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default MoodInsights;
