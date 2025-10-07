import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentAPI } from '../../services/api';
import './ComprehensiveAssessmentFlow.css';

const ComprehensiveAssessmentFlow = ({ onComplete, onBack, error }) => {
  const [currentStep, setCurrentStep] = useState('section-selection'); // 'section-selection', 'assessment', 'results'
  const [selectedSections, setSelectedSections] = useState([]);
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const { apiRequest } = useAuth();

  // Section selection handler
  const handleSectionSelection = (sectionKey) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionKey)) {
        return prev.filter(s => s !== sectionKey);
      } else {
        return [...prev, sectionKey];
      }
    });
  };

  // Start assessment with selected sections
  const handleStartAssessment = async () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one section to continue.');
      return;
    }

    setLoading(true);
    try {
      const response = await assessmentAPI.getByType('comprehensive', selectedSections);
      if (response.data.success) {
        setAssessmentData(response.data.data);
        setCurrentSection(selectedSections[0]);
        setCurrentStep('assessment');
        setCurrentQuestionIndex(0);
      } else {
        throw new Error(response.data.message || 'Failed to load assessment');
      }
    } catch (err) {
      console.error('Error starting assessment:', err);
      alert('Failed to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current question
  const getCurrentQuestion = () => {
    if (!assessmentData || !currentSection) return null;
    const section = assessmentData.sections[currentSection];
    return section.questions[currentQuestionIndex];
  };

  // Get question icon based on type
  const getQuestionIcon = (question) => {
    if (question.id === 'name' || question.id === 'occupation') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (question.id === 'ageGroup' || question.id === 'gender') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (question.id === 'stressLevel') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    }
    if (question.id === 'sleepQuality') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (question.id === 'exerciseFrequency') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (question.id === 'socialInteraction') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (question.id === 'screenTime') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 21l4-7 4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (question.id === 'pastExperiences') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (question.id === 'currentChallenges') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (question.type === 'scale') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (question.type === 'multiple_choice') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  // Get current section info
  const getCurrentSectionInfo = () => {
    if (!assessmentData || !currentSection) return null;
    return assessmentData.sections[currentSection];
  };

  // Handle response input
  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigate to next question or section
  const handleNext = () => {
    const currentSectionInfo = getCurrentSectionInfo();
    const isLastQuestion = currentQuestionIndex === currentSectionInfo.questions.length - 1;
    
    if (isLastQuestion) {
      // Check if there are more sections to complete
      const currentSectionIndex = selectedSections.indexOf(currentSection);
      const nextSection = selectedSections[currentSectionIndex + 1];
      
      if (nextSection) {
        // Move to next section
        setCurrentSection(nextSection);
        setCurrentQuestionIndex(0);
      } else {
        // All sections completed, submit assessment
        handleSubmitAssessment();
      }
    } else {
      // Move to next question in current section
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question or section
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Move to previous section
      const currentSectionIndex = selectedSections.indexOf(currentSection);
      const prevSection = selectedSections[currentSectionIndex - 1];
      
      if (prevSection) {
        const prevSectionInfo = assessmentData.sections[prevSection];
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(prevSectionInfo.questions.length - 1);
      }
    }
  };

  // Submit assessment
  const handleSubmitAssessment = async () => {
    setLoading(true);
    try {
      const response = await assessmentAPI.submit({
        type: 'comprehensive',
        responses,
        completedSections: selectedSections
      });

      if (response.data.success) {
        onComplete(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to submit assessment');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render section selection UI
  const renderSectionSelection = () => (
    <div className="section-selection">
      <div className="section-selection-header">
        <h2>Choose Your Assessment Sections</h2>
        <p>Select one or both sections to complete your mental health assessment</p>
      </div>

      {selectedSections.length > 0 && (
        <div className="selection-counter">
          <span>Selected Sections:</span>
          <div className="counter-badge">
            {selectedSections.length} of 2
          </div>
        </div>
      )}

      <div className="sections-grid">
        <div 
          className={`section-card ${selectedSections.includes('section1') ? 'selected' : ''}`}
          onClick={() => handleSectionSelection('section1')}
        >
          <div className="section-icon">👤</div>
          <h3>Tell About Yourself</h3>
          <p>Share information about your lifestyle, habits, and current state</p>
          <div className="section-meta">
            <span>📝 10 questions</span>
            <span>⏱️ 3-5 minutes</span>
          </div>
        </div>

        <div 
          className={`section-card ${selectedSections.includes('section2') ? 'selected' : ''}`}
          onClick={() => handleSectionSelection('section2')}
        >
          <div className="section-icon">🎭</div>
          <h3>Scenario-Based Testing</h3>
          <p>How would you respond in everyday situations?</p>
          <div className="section-meta">
            <span>📝 5 questions</span>
            <span>⏱️ 2-3 minutes</span>
          </div>
        </div>
      </div>

      <div className="section-selection-actions">
        <button onClick={onBack} className="btn btn-secondary">
          ← Back
        </button>
        <button 
          onClick={handleStartAssessment}
          disabled={selectedSections.length === 0 || loading}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{width: '1rem', height: '1rem', margin: 0}}></div>
              Starting Assessment...
            </>
          ) : (
            <>
              Start Assessment
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render question input based on type
  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="text-input">
            <textarea
              value={responses[question.id] || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              placeholder={question.placeholder || 'Please share your thoughts...'}
              rows={4}
            />
          </div>
        );
      
      case 'scale':
        return (
          <div className="scale-input">
            <div className="scale-options">
              {question.scale.labels.map((label, index) => (
                <button
                  key={index}
                  className={`scale-option ${responses[question.id] === (index + 1) ? 'selected' : ''}`}
                  onClick={() => handleResponse(question.id, index + 1)}
                >
                  <div className="scale-value">{index + 1}</div>
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
      
      default:
        return <div>Unknown question type</div>;
    }
  };

  // Render assessment flow
  const renderAssessment = () => {
    const currentQuestion = getCurrentQuestion();
    const currentSectionInfo = getCurrentSectionInfo();
    
    if (!currentQuestion || !currentSectionInfo) return null;

    const totalQuestions = currentSectionInfo.questions.length;
    const currentSectionIndex = selectedSections.indexOf(currentSection);
    const totalSections = selectedSections.length;
    const questionsInPreviousSections = selectedSections
      .slice(0, currentSectionIndex)
      .reduce((sum, sectionKey) => sum + assessmentData.sections[sectionKey].questions.length, 0);
    
    const overallQuestionNumber = questionsInPreviousSections + currentQuestionIndex + 1;
    const totalOverallQuestions = selectedSections.reduce((sum, sectionKey) => 
      sum + assessmentData.sections[sectionKey].questions.length, 0);
    
    const progressPercentage = (overallQuestionNumber / totalOverallQuestions) * 100;
    const canProceed = currentQuestion.required ? 
      (responses[currentQuestion.id] !== undefined && responses[currentQuestion.id] !== '') :
      true; // Optional questions can always proceed

    return (
      <div className="comprehensive-assessment-flow">
        <div className="assessment-header">
          <button onClick={onBack} className="back-btn">
            ← Back to Selection
          </button>
          
          <div className="assessment-title">
            <h2>{assessmentData.name}</h2>
            <p>{currentSectionInfo.title}</p>
          </div>
        </div>

        {error && (
          <div className="assessment-error">
            <p>{error}</p>
          </div>
        )}

        <div className="question-container">
          <div className="question-header">
            <div className="question-visual">
              <div className="question-icon">{getQuestionIcon(currentQuestion)}</div>
              <div className="question-decorative"></div>
              <div className="question-decorative"></div>
              <div className="question-decorative"></div>
            </div>
            <div className="question-text-container">
              <h3 className="question-text">
                {currentQuestion.question}
              </h3>
              {currentQuestion.required && (
                <span className="required-indicator">*</span>
              )}
            </div>
          </div>

          <div className="question-input">
            {renderQuestionInput(currentQuestion)}
          </div>

          <div className="question-navigation">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
              className="nav-btn prev-btn"
            >
              ← Previous
            </button>
            
            <div className="question-counter">
              {overallQuestionNumber} / {totalOverallQuestions}
            </div>
            
            <button 
              onClick={handleNext}
              disabled={!canProceed || loading}
              className={`nav-btn next-btn ${overallQuestionNumber === totalOverallQuestions ? 'complete-btn' : ''}`}
            >
              {loading ? 'Processing...' : 
               overallQuestionNumber === totalOverallQuestions ? 'Complete Assessment' : 'Next →'}
            </button>
          </div>
        </div>

        <div className="assessment-info">
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

  if (loading && currentStep === 'section-selection') {
    return (
      <div className="assessment-loading">
        <div className="loading-spinner"></div>
        <p>Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="comprehensive-assessment-container">
      {currentStep === 'section-selection' && renderSectionSelection()}
      {currentStep === 'assessment' && renderAssessment()}
    </div>
  );
};

export default ComprehensiveAssessmentFlow;
