import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentAPI } from '../../services/api';
import './AssessmentFlow.css';

const AssessmentFlow = ({ assessment, onComplete, onBack, error }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchAssessmentDetails = useCallback(async () => {
    try {
      const response = await assessmentAPI.getByType(assessment.type);
      if (response.data.success) {
        setAssessmentData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching assessment details:', err);
    } finally {
      setLoading(false);
    }
  }, [assessment.type]);

  useEffect(() => {
    if (assessment) {
      fetchAssessmentDetails();
    }
  }, [assessment, fetchAssessmentDetails]);

  if (loading || !assessmentData) {
    return (
      <div className="assessment-flow-loading">
        <div className="loading-spinner"></div>
        <p>Loading assessment...</p>
      </div>
    );
  }

  const currentQuestion = assessmentData.questions[currentQuestionIndex];
  const totalQuestions = assessmentData.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed = responses[currentQuestion.id] !== undefined && responses[currentQuestion.id] !== '';

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(responses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveForLater = () => {
    // Implementation for saving progress
    onBack();
  };

  const renderQuestionInput = () => {
    const question = currentQuestion;
    
    switch (question.type) {
      case 'scale':
        return (
          <div className="scale-input">
            <div className="scale-options">
              {question.scale.labels.map((label, index) => (
                <button
                  key={index}
                  className={`scale-option ${responses[question.id] === index ? 'selected' : ''}`}
                  onClick={() => handleResponse(question.id, index)}
                >
                  <div className="scale-value">{index}</div>
                  <div className="scale-label">{label}</div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'multiple_choice':
        return (
          <div className="multiple-choice-input">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`choice-option ${responses[question.id] === option ? 'selected' : ''}`}
                onClick={() => handleResponse(question.id, option)}
              >
                <div className="choice-radio">
                  {responses[question.id] === option && <div className="choice-selected"></div>}
                </div>
                <div className="choice-text">{option}</div>
              </button>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className="text-input">
            <textarea
              value={responses[question.id] || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              placeholder="Please share your thoughts..."
              rows={4}
            />
          </div>
        );
      
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="assessment-flow">
      <div className="assessment-flow-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Hub
        </button>
        
        <div className="assessment-title">
          <h2>{assessmentData.name}</h2>
          <p>{assessmentData.description}</p>
        </div>
        
        <button onClick={handleSaveForLater} className="save-btn">
          💾 Save for Later
        </button>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
      </div>

      {error && (
        <div className="assessment-error">
          <p>{error}</p>
        </div>
      )}

      <div className="question-container">
        <div className="question-header">
          <h3 className="question-text">
            {currentQuestion.question}
          </h3>
          {currentQuestion.required && (
            <span className="required-indicator">*</span>
          )}
        </div>

        <div className="question-input">
          {renderQuestionInput()}
        </div>

        <div className="question-navigation">
          <button 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          <div className="question-counter">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          
          <button 
            onClick={handleNext}
            disabled={!canProceed}
            className={`nav-btn next-btn ${isLastQuestion ? 'complete-btn' : ''}`}
          >
            {isLastQuestion ? 'Complete Assessment' : 'Next →'}
          </button>
        </div>
      </div>

      <div className="assessment-flow-info">
        <div className="info-item">
          <span className="info-icon">⏱️</span>
          <span>Estimated time: {assessmentData.timeEstimate}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🔒</span>
          <span>Your responses are private and secure</span>
        </div>
      </div>
    </div>
  );
};

export default AssessmentFlow;
