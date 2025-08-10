import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AssessmentHub.css';

const AssessmentHub = ({ onStartAssessment, onViewHistory, error }) => {
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiRequest } = useAuth();

  useEffect(() => {
    fetchAssessmentTypes();
  }, []);

  const fetchAssessmentTypes = async () => {
    try {
      const response = await apiRequest('/assessments/templates');
      if (response.success) {
        setAssessmentTypes(response.data);
      }
    } catch (err) {
      console.error('Error fetching assessment types:', err);
    } finally {
      setLoading(false);
    }
  };

  const assessmentIcons = {
    depression: '😔',
    anxiety: '😰',
    sleep: '😴',
    stress: '💪'
  };

  const assessmentColors = {
    depression: '#3B82F6',
    anxiety: '#8B5CF6',
    sleep: '#06B6D4',
    stress: '#F59E0B'
  };

  if (loading) {
    return (
      <div className="assessment-hub-loading">
        <div className="loading-spinner"></div>
        <p>Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="assessment-hub">
      <div className="assessment-hub-header">
        <h1>Mental Health Assessments</h1>
        <p>Take scientifically-backed assessments to better understand your mental well-being</p>
        
        <div className="assessment-hub-actions">
          <button 
            onClick={onViewHistory}
            className="btn btn-secondary"
          >
            📊 View History
          </button>
        </div>
      </div>

      {error && (
        <div className="assessment-error">
          <p>{error}</p>
        </div>
      )}

      <div className="assessment-types-grid">
        {assessmentTypes.map((assessment) => (
          <div 
            key={assessment.type}
            className="assessment-type-card"
            style={{ '--card-color': assessmentColors[assessment.type] || '#6B7280' }}
            onClick={() => onStartAssessment(assessment.type)}
          >
            <div className="assessment-card-header">
              <div className="assessment-icon">
                {assessmentIcons[assessment.type] || '📋'}
              </div>
              <h3>{assessment.name}</h3>
            </div>
            
            <div className="assessment-card-content">
              <p className="assessment-description">
                {assessment.description}
              </p>
              
              <div className="assessment-meta">
                <span className="assessment-time">
                  ⏱️ {assessment.timeEstimate}
                </span>
                <span className="assessment-questions">
                  📝 {assessment.questions.length} questions
                </span>
              </div>
            </div>
            
            <div className="assessment-card-footer">
              <button className="start-assessment-btn">
                Start Assessment →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="assessment-hub-info">
        <div className="info-section">
          <h3>Why Take Assessments?</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">🎯</div>
              <h4>Get Personalized Insights</h4>
              <p>Understand your mental health patterns and receive tailored recommendations</p>
            </div>
            <div className="info-item">
              <div className="info-icon">📈</div>
              <h4>Track Progress</h4>
              <p>Monitor your mental health journey over time with detailed analytics</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🛡️</div>
              <h4>Identify Early Signs</h4>
              <p>Catch potential issues early and take proactive steps for your wellbeing</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🤝</div>
              <h4>Professional Support</h4>
              <p>Get recommendations for when to seek additional help from professionals</p>
            </div>
          </div>
        </div>

        <div className="privacy-notice">
          <h4>🔒 Your Privacy Matters</h4>
          <p>
            All assessment data is encrypted and confidential. You have full control over
            your data and can delete your assessment history at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentHub;
