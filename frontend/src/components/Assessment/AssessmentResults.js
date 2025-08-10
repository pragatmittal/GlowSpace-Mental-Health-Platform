import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AssessmentResults.css';

const AssessmentResults = ({ results, onBackToHub, onRetake, onViewHistory }) => {
  const navigate = useNavigate();
  
  if (!results) {
    return (
      <div className="assessment-results-error">
        <h2>No Results Available</h2>
        <p>Unable to display assessment results.</p>
        <button onClick={onBackToHub} className="btn btn-primary">
          Back to Hub
        </button>
      </div>
    );
  }

  const { assessment, results: assessmentResults } = results;
  const { totalScore, level, interpretation, color, recommendations, needsFollowUp } = assessmentResults;

  const getScoreIcon = (level) => {
    const icons = {
      minimal: '😊',
      mild: '😐',
      moderate: '😕',
      moderately_severe: '😟',
      severe: '😰',
      excellent: '😴',
      good: '🙂',
      fair: '😪',
      poor: '😫',
      low: '😌',
      high: '😰',
      very_high: '🚨'
    };
    return icons[level] || '📊';
  };

  const handleScheduleCounseling = () => {
    navigate('/counseling');
  };

  const handleViewProgress = () => {
    onViewHistory();
  };

  return (
    <div className="assessment-results">
      <div className="results-header">
        <button onClick={onBackToHub} className="back-btn">
          ← Back to Hub
        </button>
        
        <div className="results-title">
          <h1>Assessment Complete!</h1>
          <p>Here are your personalized results</p>
        </div>
      </div>

      <div className="results-content">
        <div className="score-section">
          <div className="score-card" style={{ '--result-color': color }}>
            <div className="score-header">
              <div className="score-icon">
                {getScoreIcon(level)}
              </div>
              <div className="score-info">
                <h2>{assessment.title}</h2>
                <p className="completion-date">
                  Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="score-display">
              <div className="score-number">
                {totalScore}
              </div>
              <div className="score-interpretation">
                {interpretation}
              </div>
            </div>
            
            <div className="score-level" style={{ backgroundColor: color }}>
              {level.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {needsFollowUp && (
            <div className="follow-up-notice">
              <div className="notice-icon">⚠️</div>
              <div className="notice-content">
                <h3>Professional Support Recommended</h3>
                <p>Based on your results, speaking with a mental health professional may be beneficial.</p>
                <button onClick={handleScheduleCounseling} className="btn btn-primary">
                  Schedule Counseling
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="recommendations-section">
          <h3>Personalized Recommendations</h3>
          <div className="recommendations-grid">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-icon">💡</div>
                <p>{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="next-steps-section">
          <h3>What's Next?</h3>
          <div className="next-steps-grid">
            <div className="next-step-card">
              <div className="step-icon">📈</div>
              <h4>Track Your Progress</h4>
              <p>Take this assessment regularly to monitor changes over time</p>
              <button onClick={handleViewProgress} className="btn btn-secondary">
                View Progress
              </button>
            </div>
            
            <div className="next-step-card">
              <div className="step-icon">🔄</div>
              <h4>Retake Assessment</h4>
              <p>Retake this assessment after implementing recommendations</p>
              <button onClick={onRetake} className="btn btn-secondary">
                Retake Assessment
              </button>
            </div>
            
            <div className="next-step-card">
              <div className="step-icon">📋</div>
              <h4>Try Other Assessments</h4>
              <p>Get a complete picture of your mental health with other assessments</p>
              <button onClick={onBackToHub} className="btn btn-secondary">
                Explore More
              </button>
            </div>
          </div>
        </div>

        <div className="resources-section">
          <h3>Additional Resources</h3>
          <div className="resources-grid">
            <div className="resource-card">
              <div className="resource-icon">🧘</div>
              <h4>Mindfulness & Meditation</h4>
              <p>Practice guided meditation to improve your wellbeing</p>
              <a href="/meditation" className="resource-link">Explore →</a>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">📝</div>
              <h4>Mood Tracking</h4>
              <p>Track your daily moods to identify patterns</p>
              <a href="/moodtracking" className="resource-link">Start Tracking →</a>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">👥</div>
              <h4>Support Community</h4>
              <p>Connect with others on similar journeys</p>
              <a href="/community" className="resource-link">Join Community →</a>
            </div>
          </div>
        </div>

        <div className="data-privacy">
          <div className="privacy-icon">🔒</div>
          <div className="privacy-content">
            <h4>Your Data Privacy</h4>
            <p>
              Your assessment results are confidential and secure. You can export or delete 
              your data at any time from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
