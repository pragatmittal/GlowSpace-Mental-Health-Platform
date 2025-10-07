import React from 'react';
import './ComprehensiveAssessmentResults.css';

const ComprehensiveAssessmentResults = ({ results, onBackToHub, onRetake, onViewHistory }) => {
  if (!results) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }

  const { score, insights, recommendations, completedSections, riskLevel } = results;

  // Get risk level styling
  const getRiskLevelStyle = (level) => {
    switch (level) {
      case 'high':
        return { color: '#ef4444', bgColor: '#fef2f2', icon: '⚠️' };
      case 'moderate':
        return { color: '#f59e0b', bgColor: '#fffbeb', icon: '⚡' };
      case 'low':
        return { color: '#22c55e', bgColor: '#f0fdf4', icon: '✅' };
      default:
        return { color: '#6b7280', bgColor: '#f9fafb', icon: 'ℹ️' };
    }
  };

  const riskStyle = getRiskLevelStyle(riskLevel);

  // Render insights section
  const renderInsights = (insightData, title, icon) => {
    if (!insightData) return null;

    return (
      <div className="insights-section">
        <h3 className="insights-title">
          <span className="insights-icon">{icon}</span>
          {title}
        </h3>
        
        {insightData.strengths && insightData.strengths.length > 0 && (
          <div className="insights-group">
            <h4 className="insights-subtitle">Strengths</h4>
            <ul className="insights-list strengths">
              {insightData.strengths.map((strength, index) => (
                <li key={index} className="insight-item strength">
                  <span className="insight-icon">💪</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insightData.concerns && insightData.concerns.length > 0 && (
          <div className="insights-group">
            <h4 className="insights-subtitle">Areas for Attention</h4>
            <ul className="insights-list concerns">
              {insightData.concerns.map((concern, index) => (
                <li key={index} className="insight-item concern">
                  <span className="insight-icon">🔍</span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insightData.recommendations && insightData.recommendations.length > 0 && (
          <div className="insights-group">
            <h4 className="insights-subtitle">Recommendations</h4>
            <ul className="insights-list recommendations">
              {insightData.recommendations.map((recommendation, index) => (
                <li key={index} className="insight-item recommendation">
                  <span className="insight-icon">💡</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comprehensive-results">
      <div className="results-header">
        <h1>Your Assessment Results</h1>
        <p className="results-subtitle">
          Based on your {completedSections?.length === 2 ? 'comprehensive' : 'selected section'} assessment
        </p>
      </div>

      {/* Overall Score */}
      <div className="score-section">
        <div className="score-card">
          <div className="score-circle" style={{ borderColor: score.color }}>
            <div className="score-value" style={{ color: score.color }}>
              {Math.round((score.total / score.max) * 100)}%
            </div>
            <div className="score-label">Overall Score</div>
          </div>
          <div className="score-details">
            <h3>{score.interpretation}</h3>
            <p>You completed {completedSections?.length || 0} section(s) of the assessment</p>
          </div>
        </div>

        <div className="risk-level" style={{ backgroundColor: riskStyle.bgColor, color: riskStyle.color }}>
          <span className="risk-icon">{riskStyle.icon}</span>
          <span className="risk-text">
            Risk Level: {riskLevel?.charAt(0).toUpperCase() + riskLevel?.slice(1) || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Section-specific Insights */}
      {completedSections?.includes('section1') && insights?.lifestyle && (
        <div className="section-results">
          <h2 className="section-title">
            <span className="section-icon">👤</span>
            Lifestyle & Wellbeing Insights
          </h2>
          {renderInsights(insights.lifestyle, 'Your Lifestyle Patterns', '🏠')}
        </div>
      )}

      {completedSections?.includes('section2') && insights?.personality && (
        <div className="section-results">
          <h2 className="section-title">
            <span className="section-icon">🎭</span>
            Personality & Response Patterns
          </h2>
          {renderInsights(insights.personality, 'Your Response Patterns', '🧠')}
        </div>
      )}

      {/* Combined Insights */}
      {completedSections?.length === 2 && insights?.combined && (
        <div className="section-results combined">
          <h2 className="section-title">
            <span className="section-icon">🔗</span>
            Combined Insights
          </h2>
          {renderInsights(insights.combined, 'Comprehensive Analysis', '📊')}
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2 className="recommendations-title">
            <span className="recommendations-icon">💡</span>
            Personalized Recommendations
          </h2>
          <div className="recommendations-grid">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-number">{index + 1}</div>
                <div className="recommendation-text">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-actions">
        <button onClick={onBackToHub} className="btn btn-secondary">
          ← Back to Assessments
        </button>
        <button onClick={onRetake} className="btn btn-outline">
          🔄 Retake Assessment
        </button>
        <button onClick={onViewHistory} className="btn btn-primary">
          📊 View History
        </button>
      </div>

      {/* Additional Resources */}
      <div className="resources-section">
        <h3>Additional Resources</h3>
        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-icon">🧘</div>
            <h4>Mindfulness & Meditation</h4>
            <p>Practice techniques to improve your mental wellbeing</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon">👥</div>
            <h4>Community Support</h4>
            <p>Connect with others on similar mental health journeys</p>
          </div>
          <div className="resource-card">
            <div className="resource-icon">📚</div>
            <h4>Educational Content</h4>
            <p>Learn more about mental health and wellness strategies</p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <h4>🔒 Your Privacy Matters</h4>
        <p>
          Your assessment results are confidential and stored securely. You can delete your 
          assessment history at any time from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default ComprehensiveAssessmentResults;
