import React, { useState, useEffect, useCallback } from 'react';
import { moodAPI } from '../../services/api';
import './MoodInsights.css';

const MoodInsights = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // Fetch insights data
  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data with better error handling
      const analyticsResponse = await moodAPI.getAnalytics({ timeRange: '30d' });
      
      if (!analyticsResponse?.data?.success) {
        throw new Error('Failed to fetch analytics data');
      }

      const analytics = analyticsResponse.data.data;
      
      // Calculate comprehensive insights with proper data validation
      if (!analytics) {
        setInsights(getEmptyInsights());
        return;
      }

      const summary = analytics.summary || {};
      const trends = Array.isArray(analytics.trends) ? analytics.trends : [];
      const streaks = analytics.streaks || {};
      const consistency = analytics.consistency || {};
      const weeklyChange = analytics.weeklyChange || {};
      const activitySuggestions = analytics.activitySuggestions || {};
      
      // Calculate total moods with validation
      const totalMoods = Number(summary.totalEntries) || 0;
      
      // Get streak information with fallbacks
      const currentStreak = Number(streaks.currentPositiveStreak) || 0;
      const longestStreak = Number(streaks.maxPositiveStreak) || 0;
      
      // Get weekly change data from backend
      const weeklyImprovement = Number(weeklyChange.percentageChange) || 0;
      const changeDirection = weeklyChange.changeDirection || 'stable';
      const changeDescription = weeklyChange.changeDescription || 'No change';
      const currentWeekAvg = Number(weeklyChange.currentWeekAvg) || 0;
      const previousWeekAvg = Number(weeklyChange.previousWeekAvg) || 0;
      const currentWeekEntries = Number(weeklyChange.currentWeekEntries) || 0;
      const previousWeekEntries = Number(weeklyChange.previousWeekEntries) || 0;
      
      // Activity analysis
      const activityCorrelation = summary.activityCorrelation || {};
      let bestActivity = null;
      let bestActivityAvg = 0;
      
      Object.entries(activityCorrelation).forEach(([activity, data]) => {
        if (data && typeof data.average === 'number' && data.average > bestActivityAvg) {
          bestActivityAvg = data.average;
          bestActivity = activity;
        }
      });
      
      // Time analysis
      const timeCorrelation = summary.timeCorrelation || {};
      let bestTime = null;
      let bestTimeAvg = 0;
      
      Object.entries(timeCorrelation).forEach(([time, data]) => {
        if (data && typeof data.average === 'number' && data.average > bestTimeAvg) {
          bestTimeAvg = data.average;
          bestTime = time;
        }
      });

      // Get consistency data from backend
      const consistencyScore = Number(consistency.consistencyScore) || 0;
      const daysTracked = Number(consistency.daysTracked) || 0;
      const totalDays = Number(consistency.totalDays) || 30;
      const trackingPattern = consistency.trackingPattern || 'none';

      const calculatedInsights = {
        totalMoods,
        currentStreak,
        longestStreak,
        weeklyImprovement: Math.round(weeklyImprovement * 10) / 10,
        changeDirection,
        changeDescription,
        currentWeekAvg,
        previousWeekAvg,
        currentWeekEntries,
        previousWeekEntries,
        bestActivity: bestActivity ? {
          name: bestActivity,
          average: Math.round(bestActivityAvg * 10) / 10
        } : null,
        bestTime: bestTime ? {
          name: bestTime,
          average: Math.round(bestTimeAvg * 10) / 10
        } : null,
        consistencyScore,
        daysTracked,
        totalDays,
        trackingPattern,
        activitySuggestions: activitySuggestions.suggestions || [],
        moodPattern: activitySuggestions.moodPattern || 'balanced',
        suggestionConfidence: activitySuggestions.confidence || 0.5
      };

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
        setError('Failed to load insights. Please try again.');
      }
      
      setInsights(getEmptyInsights());
    } finally {
      setLoading(false);
    }
  }, []);

  // Get empty insights for new users
  const getEmptyInsights = () => ({
    totalMoods: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyImprovement: 0,
    changeDirection: 'stable',
    changeDescription: 'No change',
    currentWeekAvg: 0,
    previousWeekAvg: 0,
    currentWeekEntries: 0,
    previousWeekEntries: 0,
    bestActivity: null,
    bestTime: null,
    consistencyScore: 0,
    daysTracked: 0,
    totalDays: 30,
    trackingPattern: 'none',
    activitySuggestions: [],
    moodPattern: 'new_user',
    suggestionConfidence: 0.5
  });



  // Fetch data on mount and when refreshTrigger changes
  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger, fetchInsights]);

  if (loading) {
    return (
      <div className="mood-insights">
        <div className="insights-header">
          <h3>💡 Wellness Insights</h3>
          <p>Discover personalized recommendations and patterns</p>
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
          <h3>💡 Wellness Insights</h3>
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
                <h4>Total Entries</h4>
                <div className="insight-value">{insights.totalMoods}</div>
                <p>Mood records tracked</p>
              </div>
            </div>



            {/* Current Streak */}
            <div className="insight-card success">
              <div className="insight-icon">🔥</div>
              <div className="insight-content">
                <h4>Positive Streak</h4>
                <div className="insight-value">{insights.currentStreak}</div>
                <p>Days of positive moods</p>
              </div>
            </div>



            {/* Consistency Score */}
            <div className="insight-card info">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Consistency</h4>
                <div className="insight-value">{insights.consistencyScore}%</div>
                <p>{insights.daysTracked} of {insights.totalDays} days tracked</p>
                <div className="tracking-pattern" style={{
                  fontSize: '0.8rem',
                  color: insights.trackingPattern === 'excellent' ? '#10B981' :
                         insights.trackingPattern === 'good' ? '#3B82F6' :
                         insights.trackingPattern === 'moderate' ? '#F59E0B' :
                         insights.trackingPattern === 'poor' ? '#EF4444' : '#6B7280',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  {insights.trackingPattern === 'excellent' && '🌟 Excellent tracking!'}
                  {insights.trackingPattern === 'good' && '👍 Good consistency'}
                  {insights.trackingPattern === 'moderate' && '📊 Moderate tracking'}
                  {insights.trackingPattern === 'poor' && '⚠️ Inconsistent tracking'}
                  {insights.trackingPattern === 'very_poor' && '❌ Very inconsistent'}
                  {insights.trackingPattern === 'none' && '📝 Start tracking to see consistency'}
                </div>
              </div>
            </div>

            {/* Weekly Change */}
            <div className={`insight-card ${insights.changeDirection === 'improving' ? 'positive' : insights.changeDirection === 'declining' ? 'negative' : 'neutral'}`}>
              <div className="insight-icon">
                {insights.changeDirection === 'improving' ? '📈' : 
                 insights.changeDirection === 'declining' ? '📉' : '➡️'}
              </div>
              <div className="insight-content">
                <h4>Weekly Change</h4>
                <div className="insight-value">
                  {insights.weeklyImprovement > 0 ? '+' : ''}{insights.weeklyImprovement}%
                </div>
                <p>{insights.changeDescription}</p>
                <div className="weekly-details" style={{
                  fontSize: '0.8rem',
                  color: '#6B7280',
                  marginTop: '4px'
                }}>
                  {insights.currentWeekEntries > 0 && insights.previousWeekEntries > 0 && (
                    <>
                      This week: {insights.currentWeekAvg}/5 ({insights.currentWeekEntries} entries)<br/>
                      Last week: {insights.previousWeekAvg}/5 ({insights.previousWeekEntries} entries)
                    </>
                  )}
                  {insights.currentWeekEntries > 0 && insights.previousWeekEntries === 0 && (
                    <>This week: {insights.currentWeekAvg}/5 ({insights.currentWeekEntries} entries)<br/>
                    Last week: No entries</>
                  )}
                  {insights.currentWeekEntries === 0 && insights.previousWeekEntries > 0 && (
                    <>This week: No entries<br/>
                    Last week: {insights.previousWeekAvg}/5 ({insights.previousWeekEntries} entries)</>
                  )}
                  {insights.currentWeekEntries === 0 && insights.previousWeekEntries === 0 && (
                    <>No entries this week or last week</>
                  )}
                </div>
              </div>
            </div>

            {/* Personalized Activity Suggestions */}
            {insights.activitySuggestions && insights.activitySuggestions.length > 0 && (
              <div className="insight-card suggestions" style={{
                gridColumn: 'span 2',
                minHeight: '200px'
              }}>
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <h4>Recommended for You</h4>
                  <div className="suggestions-list" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginTop: '12px'
                  }}>
                    {insights.activitySuggestions.slice(0, 2).map((suggestion, index) => (
                      <div key={index} className="suggestion-item" style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}>
                        <div className="suggestion-header" style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ marginRight: '10px', fontSize: '1.5rem' }}>{suggestion.icon}</span>
                          <span style={{ 
                            fontWeight: '600', 
                            fontSize: '1rem',
                            color: suggestion.priority === 'critical' ? '#EF4444' :
                                   suggestion.priority === 'high' ? '#F59E0B' :
                                   suggestion.priority === 'medium' ? '#3B82F6' : '#6B7280'
                          }}>
                            {suggestion.title}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '0.85rem', 
                          color: '#9CA3AF',
                          margin: '0 0 8px 0',
                          lineHeight: '1.4'
                        }}>
                          {suggestion.description}
                        </p>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          fontStyle: 'italic',
                          lineHeight: '1.3'
                        }}>
                          {suggestion.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '12px',
                    fontSize: '0.8rem',
                    color: '#6B7280',
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    Based on your mood patterns
                  </div>
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
