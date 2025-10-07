import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentHub from '../components/Assessment-Archive/AssessmentHub';
import ComprehensiveAssessmentFlow from '../components/Assessment-Archive/ComprehensiveAssessmentFlow';
import ComprehensiveAssessmentResults from '../components/Assessment-Archive/ComprehensiveAssessmentResults';
import AssessmentHistory from '../components/Assessment-Archive/AssessmentHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import './Assessments-Archive.css';

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
      // For comprehensive assessment, we don't need to create it on the backend first
      // The flow will handle section selection and submission
      if (assessmentType.type === 'comprehensive') {
        setCurrentAssessment(assessmentType);
        setCurrentView('flow');
      } else {
        // Handle other assessment types if needed
        const response = await apiRequest('/assessments', {
          method: 'POST',
          data: { type: assessmentType.type }
        });

        if (response.success) {
          setCurrentAssessment(response.data);
          setCurrentView('flow');
        } else {
          setError(response.message || 'Failed to start assessment');
        }
      }
    } catch (err) {
      setError('Failed to start assessment. Please try again.');
      console.error('Start assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAssessment = async (results) => {
    if (!currentAssessment) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // For comprehensive assessment, results are already processed
      if (currentAssessment.type === 'comprehensive') {
        setAssessmentResults(results);
        setCurrentView('results');
      } else {
        // Handle other assessment types
        const response = await apiRequest(`/assessments/${currentAssessment._id}/submit`, {
          method: 'PUT',
          data: { responses: results }
        });

        if (response.success) {
          setAssessmentResults(response.data);
          setCurrentView('results');
        } else {
          setError(response.message || 'Failed to submit assessment');
        }
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
    console.log('Retake assessment clicked, results:', assessmentResults);
    
    // Get the assessment type from the results
    const assessmentType = assessmentResults?.type || assessmentResults?.assessment?.type;
    console.log('Assessment type found:', assessmentType);
    
    if (assessmentType) {
      // Create a simple assessment object with the type
      const assessmentToRetake = { type: assessmentType };
      console.log('Starting retake with:', assessmentToRetake);
      handleStartAssessment(assessmentToRetake);
    } else {
      console.error('No assessment type found in results:', assessmentResults);
      setError('Unable to retake assessment - type not found');
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
          <ComprehensiveAssessmentFlow 
            assessment={currentAssessment}
            onComplete={handleCompleteAssessment}
            onBack={handleBackToHub}
            error={error}
          />
        );
      
      case 'results':
        return (
          <ComprehensiveAssessmentResults 
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
