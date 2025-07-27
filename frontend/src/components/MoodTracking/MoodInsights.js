import React, { useState, useEffect } from 'react';
import './MoodInsights.css';

const MoodInsights = ({ insights = [], compact = false }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'pattern': return '🔍';
      case 'improvement': return '📈';
      case 'warning': return '⚠️';
      case 'achievement': return '🏆';
      case 'recommendation': return '💡';
      default: return '📊';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'pattern': return '#667eea';
      case 'improvement': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'achievement': return '#e74c3c';
      case 'recommendation': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'activity': return '🏃‍♂️';
      case 'social': return '👥';
      case 'lifestyle': return '🌱';
      case 'therapy': return '🧠';
      case 'general': return '📊';
      default: return '📋';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFilteredInsights = () => {
    if (activeFilter === 'all') return insights;
    return insights.filter(insight => insight.type === activeFilter);
  };

  const handleInsightAction = (insight) => {
    if (insight.actionUrl) {
      // Here you would typically navigate to the action URL
      console.log('Taking action for insight:', insight.id);
      alert(`Action: ${insight.actionText}`);
    }
  };

  const toggleInsightExpansion = (insightId) => {
    setExpandedInsight(expandedInsight === insightId ? null : insightId);
  };

  const filteredInsights = getFilteredInsights();

  if (loading) {
    return (
      <div className="mood-insights">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-insights">
      <div className="insights-header">
        <h2>Mood Insights</h2>
        <p>Personalized insights and recommendations based on your mood patterns</p>
      </div>

      {/* Insights Summary */}
      <div className="insights-summary">
        <div className="summary-card">
          <div className="summary-icon">💡</div>
          <div className="summary-content">
            <h3>{insights.length}</h3>
            <p>Total Insights</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <h3>{insights.filter(i => i.actionable).length}</h3>
            <p>Actionable</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h3>{insights.filter(i => i.type === 'improvement').length}</h3>
            <p>Improvements</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <h3>{insights.filter(i => i.type === 'warning').length}</h3>
            <p>Warnings</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="insights-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({insights.length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'pattern' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pattern')}
        >
          Patterns ({insights.filter(i => i.type === 'pattern').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'improvement' ? 'active' : ''}`}
          onClick={() => setActiveFilter('improvement')}
        >
          Improvements ({insights.filter(i => i.type === 'improvement').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'warning' ? 'active' : ''}`}
          onClick={() => setActiveFilter('warning')}
        >
          Warnings ({insights.filter(i => i.type === 'warning').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'recommendation' ? 'active' : ''}`}
          onClick={() => setActiveFilter('recommendation')}
        >
          Recommendations ({insights.filter(i => i.type === 'recommendation').length})
        </button>
      </div>

      {/* Insights List */}
      <div className="insights-list">
        {filteredInsights.length === 0 ? (
          <div className="no-insights">
            <div className="no-insights-icon">🔍</div>
            <h4>No insights found</h4>
            <p>Try adjusting your filters or continue tracking your mood to generate more insights.</p>
          </div>
        ) : (
          filteredInsights.map((insight, index) => (
            <div key={insight.id || `insight-${index}`} className="insight-card">
              <div className="insight-header">
                <div className="insight-meta">
                  <div 
                    className="insight-icon"
                    style={{ backgroundColor: getInsightColor(insight.type) }}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="insight-info">
                    <h3>{insight.title}</h3>
                    <div className="insight-tags">
                      <span className="category-tag">
                        {getCategoryIcon(insight.category)} {insight.category}
                      </span>
                      <span 
                        className="priority-tag"
                        style={{ backgroundColor: getPriorityColor(insight.priority) }}
                      >
                        {insight.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="insight-actions">
                  <button 
                    className="expand-btn"
                    onClick={() => toggleInsightExpansion(insight.id)}
                  >
                    {expandedInsight === insight.id ? '−' : '+'}
                  </button>
                </div>
              </div>

              <div className="insight-content">
                <p className="insight-message">{insight.message}</p>
                
                {expandedInsight === insight.id && (
                  <div className="insight-details">
                    <div className="detail-section">
                      <h4>Details</h4>
                      <p>{insight.details}</p>
                    </div>
                    
                    <div className="detail-section">
                      <h4>Confidence</h4>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${insight.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="confidence-text">{(insight.confidence * 100).toFixed(0)}% confident</span>
                    </div>

                    <div className="detail-section">
                      <h4>Tags</h4>
                      <div className="tags-list">
                        {insight.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Generated</h4>
                      <span className="generated-date">{formatDate(insight.createdAt)}</span>
                    </div>
                  </div>
                )}

                {insight.actionable && (
                  <div className="insight-action">
                    <button 
                      className="action-btn"
                      onClick={() => handleInsightAction(insight)}
                    >
                      {insight.actionText}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Insights Tips */}
      <div className="insights-tips">
        <h3>💡 Tips for Better Insights</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Track Consistently</h4>
            <p>Log your mood daily to get more accurate patterns and insights.</p>
          </div>
          <div className="tip-card">
            <h4>Add Context</h4>
            <p>Include activities, social context, and notes for richer analysis.</p>
          </div>
          <div className="tip-card">
            <h4>Review Regularly</h4>
            <p>Check your insights weekly to identify trends and take action.</p>
          </div>
          <div className="tip-card">
            <h4>Share with Therapist</h4>
            <p>Use insights to inform discussions with your mental health professional.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodInsights; 