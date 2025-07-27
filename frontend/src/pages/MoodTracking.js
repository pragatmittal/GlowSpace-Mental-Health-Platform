import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MoodDashboard from '../components/MoodTracking/MoodDashboard';
import MoodEntry from '../components/MoodTracking/MoodEntry';
import MoodHistory from '../components/MoodTracking/MoodHistory';
import MoodAnalytics from '../components/MoodTracking/MoodAnalytics';
import MoodInsights from '../components/MoodTracking/MoodInsights';
import './MoodTracking.css';

const MoodTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Handle URL parameters for deep linking
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['dashboard', 'entry', 'history', 'analytics', 'insights'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MoodDashboard />;
      case 'entry':
        return <MoodEntry />;
      case 'history':
        return <MoodHistory />;
      case 'analytics':
        return <MoodAnalytics />;
      case 'insights':
        return <MoodInsights />;
      default:
        return <MoodDashboard />;
    }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'entry', label: '✏️ New Entry', icon: '✏️' },
    { id: 'history', label: '📝 History', icon: '📝' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'insights', label: '💡 Insights', icon: '💡' }
  ];

  return (
    <div className="mood-tracking-page">
      <div className="mood-tracking-container">
        {/* Header */}
        <div className="mood-tracking-header">
          <div className="header-content">
            <h1>🌱 Mood Tracking</h1>
            <p>Track and analyze your daily moods with interactive charts and personalized insights</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mood-tracking-nav">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mood-tracking-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="content-wrapper">
              {renderActiveComponent()}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="quick-actions-content">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="quick-action-btn"
                onClick={() => handleTabChange('entry')}
              >
                ✏️ Log Mood
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleTabChange('analytics')}
              >
                📈 View Trends
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleTabChange('insights')}
              >
                💡 Get Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracking; 