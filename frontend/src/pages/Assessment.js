import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssessmentHub from '../components/Assessment/AssessmentHub';
import AssessmentFlow from '../components/Assessment/AssessmentFlow';
import AssessmentResults from '../components/Assessment/AssessmentResults';
import AssessmentHistory from '../components/Assessment/AssessmentHistory';
import { assessmentAPI } from '../services/api';
import './Assessment.css';

const Assessment = () => {
  const [currentView, setCurrentView] = useState('hub'); // hub, flow, results, history
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { type, view } = useParams();
  const navigate = useNavigate();

  // Set initial view based on URL params
  React.useEffect(() => {
    if (view) {
      setCurrentView(view);
    } else if (type) {
      // If type is specified, start assessment flow
      setSelectedAssessment({ type });
      setCurrentView('flow');
    }
  }, [type, view]);

  const handleStartAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setCurrentView('flow');
    setError('');
  };

  const handleAssessmentComplete = async (responses) => {
    try {
      setLoading(true);
      setError('');
      
      const assessmentData = {
        type: selectedAssessment.type,
        responses: responses
      };

      const response = await assessmentAPI.submit(assessmentData);
      
      if (response.data.success) {
        setAssessmentResults(response.data.data);
        setCurrentView('results');
        // Update URL
        navigate(`/assessments/results/${response.data.data._id}`, { replace: true });
      } else {
        setError('Failed to submit assessment. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    setSelectedAssessment(null);
    setAssessmentResults(null);
    setError('');
    navigate('/assessments', { replace: true });
  };

  const handleViewHistory = () => {
    setCurrentView('history');
    navigate('/assessments/history', { replace: true });
  };

  const handleRetakeAssessment = () => {
    setCurrentView('flow');
    setAssessmentResults(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="assessment-loading">
        <div className="loading-spinner"></div>
        <p>Processing your assessment...</p>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      {error && (
        <div className="assessment-error">
          <p>{error}</p>
          <button onClick={() => setError('')} className="btn btn-secondary">
            Dismiss
          </button>
        </div>
      )}

      {currentView === 'hub' && (
        <AssessmentHub
          onStartAssessment={handleStartAssessment}
          onViewHistory={handleViewHistory}
          error={error}
        />
      )}

      {currentView === 'flow' && selectedAssessment && (
        <AssessmentFlow
          assessment={selectedAssessment}
          onComplete={handleAssessmentComplete}
          onBack={handleBackToHub}
          error={error}
        />
      )}

      {currentView === 'results' && assessmentResults && (
        <AssessmentResults
          results={assessmentResults}
          onRetake={handleRetakeAssessment}
          onBackToHub={handleBackToHub}
          onViewHistory={handleViewHistory}
        />
      )}

      {currentView === 'history' && (
        <AssessmentHistory />
      )}
    </div>
  );
};

export default Assessment;
