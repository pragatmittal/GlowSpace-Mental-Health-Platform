import React, { useState, useEffect, useRef } from 'react';
import { emotionAPI } from '../../services/apiWrapper';
import './EmotionInsights.css';

const EmotionInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for cleanup and preventing multiple calls
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEmotionInsights();
    
    return () => {
      isMountedRef.current = false;
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

  const fetchEmotionInsights = async () => {
    const now = Date.now();
    const minInterval = 3000; // Minimum 3 seconds between fetches
    
    // Prevent too frequent calls
    if (now - lastFetchTimeRef.current < minInterval) {
      console.log('⏳ EmotionInsights fetch skipped - too frequent');
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
      const response = await emotionAPI.getEmotionInsights();
      
      if (!isMountedRef.current) return;
      
      const data = response.data;
      
      if (data.success) {
        setInsights(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to load emotion insights');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 EmotionInsights fetch aborted');
        return;
      }
      
      console.error('Error fetching emotion insights:', err);
      if (isMountedRef.current) {
        if (err.message.includes('Too many requests') || err.message.includes('429')) {
          setError('Server is busy. Emotion insights will be available shortly.');
        } else {
          setError('Failed to load emotion insights. Please try again.');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
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
