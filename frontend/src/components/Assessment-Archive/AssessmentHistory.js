import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentAPI } from '../../services/api';
import './AssessmentHistory.css';

const AssessmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('3months');
  const [chartData, setChartData] = useState(null);
  const { token } = useAuth();

  const assessmentTypeNames = {
    comprehensive: 'Comprehensive Mental Health Assessment',
    depression: 'Depression (PHQ-9)',
    anxiety: 'Anxiety (GAD-7)',
    sleep: 'Sleep Quality',
    stress: 'Stress Level'
  };

  const assessmentIcons = {
    comprehensive: '🧠',
    depression: '🧠',
    anxiety: '💙',
    sleep: '😴',
    stress: '📊'
  };

  const severityColors = {
    minimal: '#22c55e',
    mild: '#facc15',
    moderate: '#f97316',
    'moderately-severe': '#dc2626',
    severe: '#991b1b'
  };

  const fetchAssessmentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (timeRange !== 'all') {
        params.timeRange = timeRange;
      }
      
      const response = await assessmentAPI.getHistory(params);
      
      if (response.data.success) {
        setHistory(response.data.data.history);
        setChartData(response.data.data.chartData);
      }
    } catch (err) {
      setError('Failed to load assessment history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAssessmentHistory();
  }, [fetchAssessmentHistory]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreInterpretation = (assessment) => {
    // Use the interpretation from the assessment if available
    if (assessment.score?.interpretation) {
      return assessment.score.interpretation;
    }
    
    const score = assessment.score?.total || assessment.totalScore || 0;
    const type = assessment.type;
    
    if (type === 'comprehensive') {
      const percentage = (score / (assessment.score?.max || 100)) * 100;
      if (percentage >= 80) return 'Excellent';
      if (percentage >= 60) return 'Good';
      if (percentage >= 40) return 'Fair';
      return 'Needs Attention';
    } else if (type === 'depression' || type === 'anxiety') {
      if (score >= 20) return 'Severe';
      if (score >= 15) return 'Moderately Severe';
      if (score >= 10) return 'Moderate';
      if (score >= 5) return 'Mild';
      return 'Minimal';
    } else if (type === 'sleep') {
      if (score >= 85) return 'Excellent';
      if (score >= 70) return 'Good';
      if (score >= 55) return 'Fair';
      return 'Poor';
    } else { // stress
      if (score >= 80) return 'Severe';
      if (score >= 60) return 'High';
      if (score >= 40) return 'Moderate';
      if (score >= 20) return 'Mild';
      return 'Minimal';
    }
  };

  const getSeverityKey = (interpretation) => {
    const lowerCase = interpretation.toLowerCase().replace(' ', '-');
    return severityColors[lowerCase] ? lowerCase : 'moderate';
  };

  const getTrendIcon = (current, previous) => {
    if (!previous) return '📊';
    if (current < previous) return '📈'; // Improvement (lower scores are better for depression/anxiety/stress)
    if (current > previous) return '📉'; // Worsening
    return '➡️'; // No change
  };

  const renderPersonalDetails = (personalDetails) => {
    if (!personalDetails) return null;

    return (
      <div className="personal-details">
        <h5>Personal Assessment Details:</h5>
        <div className="details-grid">
          {personalDetails.stressLevel && (
            <div className="detail-item">
              <span className="detail-label">Stress Level:</span>
              <span className="detail-value">{personalDetails.stressLevel}/10</span>
            </div>
          )}
          {personalDetails.sleepQuality && (
            <div className="detail-item">
              <span className="detail-label">Sleep Quality:</span>
              <span className="detail-value">{personalDetails.sleepQuality}</span>
            </div>
          )}
          {personalDetails.exerciseFrequency && (
            <div className="detail-item">
              <span className="detail-label">Exercise:</span>
              <span className="detail-value">{personalDetails.exerciseFrequency}</span>
            </div>
          )}
          {personalDetails.socialInteraction && (
            <div className="detail-item">
              <span className="detail-label">Social Activity:</span>
              <span className="detail-value">{personalDetails.socialInteraction}</span>
            </div>
          )}
          {personalDetails.screenTime && (
            <div className="detail-item">
              <span className="detail-label">Screen Time:</span>
              <span className="detail-value">{personalDetails.screenTime}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="assessment-history">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your assessment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-history">
        <div className="error-container">
          <h2>📊 Assessment History</h2>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchAssessmentHistory} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-history">
      <div className="history-header">
        <h1>📊 Assessment History</h1>
        <p>Track your mental health journey and progress over time</p>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <label htmlFor="time-filter">Time Range:</label>
          <select
            id="time-filter"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {chartData && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-content">
              <h3>Total Assessments</h3>
              <p className="summary-number">{chartData.totalAssessments}</p>
              <span className="summary-label">Completed</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h3>Most Recent</h3>
              <p className="summary-number">
                {chartData.mostRecent ? formatDate(chartData.mostRecent.date) : 'N/A'}
              </p>
              <span className="summary-label">
                {chartData.mostRecent ? assessmentTypeNames[chartData.mostRecent.type] : 'No assessments yet'}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <h3>Consistency</h3>
              <p className="summary-number">{chartData.averageGap}</p>
              <span className="summary-label">Days between assessments</span>
            </div>
          </div>
        </div>
      )}

      {/* History Timeline */}
      <div className="history-content">
        {history.length === 0 ? (
          <div className="no-history">
            <div className="no-history-icon">📊</div>
            <h3>No Assessment History Found</h3>
            <p>You haven't completed any assessments yet that match your current filters.</p>
            <a href="/assessments" className="btn btn-primary">
              Take Your First Assessment
            </a>
          </div>
        ) : (
          <div className="history-timeline">
            <h3>Your Assessment Timeline</h3>
            <div className="timeline">
              {history.map((assessment, index) => {
                const interpretation = getScoreInterpretation(assessment);
                const severityKey = getSeverityKey(interpretation);
                const currentScore = assessment.score?.total || assessment.totalScore || 0;
                const previousScore = index < history.length - 1 ? 
                  (history[index + 1].score?.total || history[index + 1].totalScore || 0) : null;
                const trendIcon = getTrendIcon(currentScore, previousScore);

                return (
                  <div key={assessment._id} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="assessment-type-icon">
                        {assessmentIcons[assessment.type] || '📊'}
                      </span>
                    </div>
                    
                    <div className="timeline-content">
                      <div className="assessment-card">
                        <div className="assessment-header">
                          <div className="assessment-info">
                            <h4>{assessmentTypeNames[assessment.type] || assessment.title}</h4>
                            <p className="assessment-date">{formatDate(assessment.completedAt || assessment.createdAt)}</p>
                          </div>
                          <div className="trend-indicator">
                            <span className="trend-icon">{trendIcon}</span>
                          </div>
                        </div>

                        <div className="assessment-score">
                          <div 
                            className="score-display"
                            style={{ '--severity-color': assessment.score?.color || severityColors[severityKey] }}
                          >
                            <span className="score-number">{currentScore}</span>
                            <span className="score-max">/{assessment.score?.max || assessment.maxScore || 100}</span>
                          </div>
                          <div 
                            className="severity-badge"
                            style={{ backgroundColor: assessment.score?.color || severityColors[severityKey] }}
                          >
                            {interpretation}
                          </div>
                        </div>

                        {/* Personal Details for Comprehensive Assessments */}
                        {assessment.personalDetails && (
                          <div className="personal-details-section">
                            {renderPersonalDetails(assessment.personalDetails)}
                          </div>
                        )}

                        {/* Section Scores for Comprehensive Assessments */}
                        {assessment.sectionScores && Object.keys(assessment.sectionScores).length > 0 && (
                          <div className="section-scores">
                            <h5>Section Breakdown:</h5>
                            <div className="scores-grid">
                              {Object.entries(assessment.sectionScores).map(([section, scoreData]) => (
                                <div key={section} className="section-score-item">
                                  <span className="section-name">
                                    {section === 'section1' ? 'Personal Assessment' : 'Scenario Testing'}
                                  </span>
                                  <span className="section-score">
                                    {scoreData.score}/{scoreData.maxScore}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {assessment.recommendations && assessment.recommendations.length > 0 && (
                          <div className="assessment-recommendations">
                            <h5>Key Recommendations:</h5>
                            <ul>
                              {assessment.recommendations.slice(0, 2).map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="assessment-actions">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => window.location.href = `/assessments?type=${assessment.type}`}
                          >
                            Retake Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Progress Insights */}
      {history.length > 1 && (
        <div className="progress-insights">
          <h3>📈 Progress Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h4>Assessment Frequency</h4>
                <p>
                  You've completed {history.length} assessments in the selected timeframe.
                  {chartData && chartData.averageGap && (
                    <> Average gap: {chartData.averageGap} days between assessments.</>
                  )}
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Most Common Assessment</h4>
                <p>
                  {chartData && chartData.mostCommonType ? 
                    `You most frequently take ${assessmentTypeNames[chartData.mostCommonType]} assessments.` :
                    'Take more assessments to see patterns in your mental health journey.'
                  }
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <h4>Consistency Tip</h4>
                <p>
                  Regular assessment tracking helps identify patterns and measure progress. 
                  Consider taking assessments weekly or bi-weekly for best insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
