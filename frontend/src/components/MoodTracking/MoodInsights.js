import React, { useState, useEffect } from 'react';
import './MoodInsights.css';

const MoodInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedInsight, setExpandedInsight] = useState(null);

  // Mock insights data
  useEffect(() => {
    const mockInsights = [
      {
        id: '1',
        type: 'pattern',
        category: 'activity',
        priority: 'high',
        title: 'Exercise Boosts Your Mood',
        message: 'Your mood is 40% better on days you exercise. Consider adding more physical activity to your routine.',
        details: 'Analysis of your last 30 entries shows a strong correlation between exercise and improved mood scores. On exercise days, your average mood score is 4.2 compared to 3.0 on non-exercise days.',
        actionable: true,
        actionUrl: '/moodtracking?tab=entry',
        actionText: 'Log Exercise Mood',
        confidence: 0.85,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['exercise', 'mood-boost', 'correlation']
      },
      {
        id: '2',
        type: 'improvement',
        category: 'general',
        priority: 'medium',
        title: 'Positive Streak Achievement',
        message: 'You\'ve maintained a positive mood streak for 5 consecutive days!',
        details: 'This is your longest positive streak in the last 3 months. Your consistent mood tracking and self-awareness are paying off.',
        actionable: false,
        confidence: 0.95,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['streak', 'achievement', 'progress']
      },
      {
        id: '3',
        type: 'warning',
        category: 'lifestyle',
        priority: 'medium',
        title: 'Monday Blues Pattern',
        message: 'Mondays consistently show lower mood scores. Consider adjusting your Monday routine.',
        details: 'Over the past 8 weeks, your Monday mood scores average 2.8, significantly lower than your weekly average of 3.4. This pattern suggests work-related stress or transition difficulties.',
        actionable: true,
        actionUrl: '/dashboard',
        actionText: 'View Monday Tips',
        confidence: 0.78,
        createdAt: new Date(),
        tags: ['pattern', 'monday', 'work-stress']
      },
      {
        id: '4',
        type: 'recommendation',
        category: 'social',
        priority: 'high',
        title: 'Social Interactions Improve Mood',
        message: 'Your mood is 35% better when you spend time with friends or family.',
        details: 'Social activities consistently correlate with higher mood scores. Consider scheduling more social interactions, especially during low-mood periods.',
        actionable: true,
        actionUrl: '/community',
        actionText: 'Join Community',
        confidence: 0.82,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: ['social', 'friends', 'family']
      },
      {
        id: '5',
        type: 'achievement',
        category: 'therapy',
        priority: 'low',
        title: 'Consistent Tracking Milestone',
        message: 'You\'ve tracked your mood for 30 consecutive days!',
        details: 'Consistent mood tracking is a key component of mental health awareness. Your dedication to self-monitoring shows strong commitment to your well-being.',
        actionable: false,
        confidence: 1.0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['milestone', 'consistency', 'self-care']
      },
      {
        id: '6',
        type: 'pattern',
        category: 'lifestyle',
        priority: 'medium',
        title: 'Evening Mood Improvement',
        message: 'Your mood tends to improve in the evenings, especially after 7 PM.',
        details: 'This pattern suggests you may be a night person or that evening activities help you unwind. Consider scheduling important tasks for your peak mood hours.',
        actionable: true,
        actionUrl: '/moodtracking?tab=analytics',
        actionText: 'View Time Analysis',
        confidence: 0.73,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        tags: ['time-pattern', 'evening', 'productivity']
      }
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, []);

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
          filteredInsights.map(insight => (
            <div key={insight.id} className="insight-card">
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