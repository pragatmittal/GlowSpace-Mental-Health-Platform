import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentAPI } from '../../services/api';
import './AssessmentHub.css';

const AssessmentHub = ({ onStartAssessment, onViewHistory, error }) => {
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchAssessmentTypes = useCallback(async () => {
    try {
      const response = await assessmentAPI.getTemplates();
      if (response.data.success) {
        setAssessmentTypes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching assessment types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessmentTypes();
  }, [fetchAssessmentTypes]);

  const assessmentIcons = {
    comprehensive: '🧠',
    depression: '😔',
    anxiety: '😰',
    sleep: '😴',
    stress: '💪'
  };

  const assessmentColors = {
    comprehensive: '#8B5CF6',
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
        <div className="header-content">
          <div className="header-text">
            <h1>Mental Health Assessments</h1>
            <p>Take scientifically-backed assessments to better understand your mental well-being</p>
          </div>
          <button 
            onClick={onViewHistory}
            className="view-history-btn"
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
        {assessmentTypes && assessmentTypes.length > 0 ? (
          assessmentTypes.map((assessment) => (
            <div 
              key={assessment.type}
              className={`assessment-type-card ${assessment.type === 'comprehensive' ? 'comprehensive' : ''}`}
              style={{ '--card-color': assessmentColors[assessment.type] || '#6B7280' }}
              onClick={() => onStartAssessment(assessment)}
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
                    📝 {assessment.questionCount || 0} questions
                  </span>
                </div>
            </div>
            
            <div className="assessment-card-footer">
              <button className="start-assessment-btn">
                Start Assessment →
              </button>
            </div>
          </div>
        ))
        ) : (
          <div className="no-assessments">
            <div className="no-assessments-icon">📋</div>
            <h3>No Assessments Available</h3>
            <p>Assessment templates are being loaded. Please try again in a moment.</p>
          </div>
        )}
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
