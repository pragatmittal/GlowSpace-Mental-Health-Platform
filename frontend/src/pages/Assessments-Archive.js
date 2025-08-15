import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentHub from '../components/Assessment/AssessmentHub';
import AssessmentFlow from '../components/Assessment/AssessmentFlow';
import AssessmentResults from '../components/Assessment/AssessmentResults';
import AssessmentHistory from '../components/Assessment/AssessmentHistory';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import './Assessments.css';

const Assessments = () => {
  const [currentView, setCurrentView] = useState('hub'); // 'hub', 'flow', 'results', 'history'
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { apiRequest } = useAuth();
  const navigate = useNavigate();

  const handleStartAssessment = async (assessmentType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create new assessment
      const response = await apiRequest('/assessments', {
        method: 'POST',
        data: { type: assessmentType }
      });

      if (response.success) {
        setCurrentAssessment(response.data);
        setCurrentView('flow');
      } else {
        setError(response.message || 'Failed to start assessment');
      }
    } catch (err) {
      setError('Failed to start assessment. Please try again.');
      console.error('Start assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAssessment = async (responses) => {
    if (!currentAssessment) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/assessments/${currentAssessment._id}/submit`, {
        method: 'PUT',
        data: { responses }
      });

      if (response.success) {
        setAssessmentResults(response.data);
        setCurrentView('results');
      } else {
        setError(response.message || 'Failed to submit assessment');
      }
    } catch (err) {
      setError('Failed to submit assessment. Please try again.');
      console.error('Submit assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    setCurrentAssessment(null);
    setAssessmentResults(null);
    setError(null);
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleRetakeAssessment = () => {
    if (assessmentResults?.assessment?.type) {
      handleStartAssessment(assessmentResults.assessment.type);
    }
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <LoadingSpinner 
          type="pulse" 
          size="large" 
          text="Processing your assessment..." 
          overlay={true}
        />
      );
    }

    switch (currentView) {
      case 'hub':
        return (
          <AssessmentHub 
            onStartAssessment={handleStartAssessment}
            onViewHistory={handleViewHistory}
            error={error}
          />
        );
      
      case 'flow':
        return (
          <AssessmentFlow 
            assessment={currentAssessment}
            onComplete={handleCompleteAssessment}
            onBack={handleBackToHub}
            error={error}
          />
        );
      
      case 'results':
        return (
          <AssessmentResults 
            results={assessmentResults}
            onBackToHub={handleBackToHub}
            onRetake={handleRetakeAssessment}
            onViewHistory={handleViewHistory}
          />
        );
      
      case 'history':
        return (
          <AssessmentHistory 
            onBack={handleBackToHub}
            onStartAssessment={handleStartAssessment}
          />
        );
      
      default:
        return <AssessmentHub onStartAssessment={handleStartAssessment} />;
    }
  };

  return (
    <div className="assessments-page">
      <div className="assessments-container">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Assessments;
