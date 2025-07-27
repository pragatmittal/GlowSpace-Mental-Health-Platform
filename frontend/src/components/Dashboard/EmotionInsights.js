import React, { useState, useEffect } from 'react';
import { emotionAPI } from '../../services/api';
import './EmotionInsights.css';

const EmotionInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmotionInsights();
  }, []);

  const fetchEmotionInsights = async () => {
    try {
      setLoading(true);
      const response = await emotionAPI.getEmotionInsights();
      const data = response.data;
      
      if (data.success) {
        setInsights(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to load emotion insights');
      }
    } catch (err) {
      console.error('Error fetching emotion insights:', err);
      setError('Failed to load emotion insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#4CAF50',
      sad: '#2196F3',
      angry: '#F44336',
      fearful: '#9C27B0',
      disgusted: '#795548',
      surprised: '#FF9800',
      neutral: '#9E9E9E'
    };
    return colors[emotion] || '#9E9E9E';
  };

  const getInsightIcon = (type) => {
    const icons = {
      dominant_emotion: '🎭',
      wellness_score: '📊',
      pattern: '📈',
      recommendation: '💡'
    };
    return icons[type] || '📋';
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      positive: '😊',
      neutral: '😐',
      concerning: '😟'
    };
    return icons[sentiment] || '😐';
  };

  if (loading) {
    return (
      <div className="emotion-insights">
        <div className="insights-loading">
          <div className="loading-card">
            <div className="loading-shimmer"></div>
          </div>
          <div className="loading-card">
            <div className="loading-shimmer"></div>
          </div>
          <div className="loading-card">
            <div className="loading-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emotion-insights">
        <div className="emotion-insights-header">
          <h3>Emotion Insights</h3>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchEmotionInsights} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="emotion-insights">
        <div className="emotion-insights-header">
          <h3>Emotion Insights</h3>
        </div>
        <p>No emotion data available. Start tracking your emotions to get insights.</p>
      </div>
    );
  }

  return (
    <div className="emotion-insights">
      <div className="emotion-insights-header">
        <h3>Emotion Insights</h3>
        <span className="insight-period">Last {insights.period || '7 days'}</span>
      </div>

      {/* Wellness Score */}
      <div className="emotion-score-card">
        <div className="score-main">
          <div className="score-value">{insights.wellnessScore || 0}</div>
          <div className="score-label">Wellness Score</div>
        </div>
        <div className={`score-change ${insights.wellnessScore > 70 ? 'positive' : ''}`}>
          <span className="change-icon">
            {insights.wellnessScore > 70 ? '↗️' : '→'}
          </span>
          {insights.wellnessScore > 70 ? 'Good' : 'Needs attention'}
        </div>
      </div>

      {/* Dominant Emotion */}
      {insights.emotionSummary && Object.keys(insights.emotionSummary).length > 0 && (
        <div className="dominant-emotion">
          <div className="emotion-badge">
            <span className="emotion-icon">
              {getSentimentIcon(insights.wellnessScore > 70 ? 'positive' : 'neutral')}
            </span>
            <span className="emotion-name">
              {Object.keys(insights.emotionSummary).reduce((a, b) => 
                insights.emotionSummary[a] > insights.emotionSummary[b] ? a : b
              )}
            </span>
          </div>
          <p className="emotion-description">
            Your most frequent emotion in the last {insights.period || '7 days'}
          </p>
        </div>
      )}

      {/* Insights */}
      {insights.insights && insights.insights.length > 0 && (
        <div className="insights-patterns">
          <h4>Key Insights</h4>
          <div className="patterns-list">
            {insights.insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.trend || 'neutral'}`}>
                <div className="insight-header">
                  <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                  <span className="insight-title">{insight.title}</span>
                  {insight.trend && (
                    <span className="sentiment-indicator">
                      {getSentimentIcon(insight.trend)}
                    </span>
                  )}
                </div>
                <div className="insight-description">{insight.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="insights-patterns">
          <h4>Recommendations</h4>
          <div className="patterns-list">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="insight-card helpful">
                <div className="insight-header">
                  <span className="insight-icon">💡</span>
                  <span className="insight-title">Suggestion {index + 1}</span>
                </div>
                <div className="insight-description">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="emotion-actions">
        <button className="action-btn primary">
          <span className="btn-icon">📊</span>
          View Details
        </button>
        <button className="action-btn secondary">
          <span className="btn-icon">📅</span>
          Schedule Session
        </button>
      </div>
    </div>
  );
};

export default EmotionInsights;
