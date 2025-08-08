import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import DashboardStats from './DashboardStats';
import MoodChart from './MoodChart';
import EmotionInsights from './EmotionInsights';
import UpcomingAppointments from './UpcomingAppointments';
import RecentActivity from './RecentActivity';
import GoalsProgress from './GoalsProgress';
import QuickActions from './QuickActions';
import WelcomeMessage from './WelcomeMessage';
import { dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  // Auto-refresh dashboard when navigating back to /dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchDashboardData();
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'mood':
        navigate('/mood-tracking');
        break;
      case 'emotion':
        navigate('/emotion-detection');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'appointment':
        navigate('/counseling');
        break;
      case 'assessment':
        navigate('/assessment');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  // --- NEW: Latest Session Highlight ---
  const latestSession = dashboardData?.latestSession;
  const latestSummary = latestSession?.summary;
  const latestRecommendations = latestSummary?.recommendations || [];
  const latestGraphData = latestSession?.data || [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <WelcomeMessage user={dashboardData?.user} />
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleTabChange('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => handleTabChange('progress')}
          >
            Progress
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* --- Highlight Latest Session --- */}
            {latestSummary && (
              <div className="latest-session-highlight">
                <h2>🧠 Your Latest Emotion Session</h2>
                <div className="wellness-score-highlight">
                  <span className="score-label">Wellness Score:</span>
                  <span className="score-value">{latestSummary.averageWellnessScore}</span>
                  <span className="score-max">/100</span>
                </div>
                <div className="emotion-graph-section">
                  <h4>Emotion Progression</h4>
                  <div className="emotion-graph">
                    {/* Simple line graph using SVG for demo, can use chart.js for production */}
                    <svg width="100%" height="80" viewBox="0 0 300 80">
                      {latestGraphData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#667eea"
                          strokeWidth="3"
                          points={latestGraphData.map((d, i) => `${(i * 300) / (latestGraphData.length - 1)},${80 - (d.wellnessScore * 80) / 100}`).join(' ')}
                        />
                      )}
                      {latestGraphData.map((d, i) => (
                        <circle
                          key={i}
                          cx={(i * 300) / (latestGraphData.length - 1)}
                          cy={80 - (d.wellnessScore * 80) / 100}
                          r="4"
                          fill="#4CAF50"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
                {latestRecommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h4>Recommendations to Improve Your Wellness</h4>
                    <ul className="recommendations-list">
                      {latestRecommendations.map((rec, idx) => (
                        <li key={idx} className="recommendation-item">
                          <span className="rec-icon">💡</span> {rec.type || rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {/* --- End Highlight --- */}
            <div className="dashboard-grid">
              <div className="grid-item stats">
                <DashboardStats stats={dashboardData?.stats} />
              </div>
              
              <div className="grid-item quick-actions">
                <QuickActions onAction={handleQuickAction} />
              </div>
              
              <div className="grid-item mood-chart">
                <MoodChart data={dashboardData?.moodData} />
              </div>
              
              <div className="grid-item appointments">
                <UpcomingAppointments appointments={dashboardData?.appointments} />
              </div>
              
              <div className="grid-item recent-activity">
                <RecentActivity activities={dashboardData?.recentActivity} />
              </div>
              
              <div className="grid-item emotion-insights">
                <EmotionInsights data={dashboardData?.emotionData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-grid">
              <div className="chart-container">
                <MoodChart 
                  data={dashboardData?.moodData} 
                  detailed={true}
                  timeRange="month"
                />
              </div>
              
              <div className="emotion-analytics">
                <EmotionInsights 
                  data={dashboardData?.emotionData} 
                  detailed={true}
                />
              </div>
              
              <div className="progress-charts">
                <GoalsProgress />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-tab">
            <div className="progress-grid">
              <div className="goals-section">
                <GoalsProgress 
                  detailed={true}
                />
              </div>
              
              <div className="achievements-section">
                <h3>Recent Achievements</h3>
                <div className="achievements-list">
                  {dashboardData?.achievements?.map((achievement, index) => (
                    <div key={index} className="achievement-item">
                      <div className="achievement-icon">🏆</div>
                      <div className="achievement-info">
                        <h4>{achievement.title}</h4>
                        <p>{achievement.description}</p>
                        <span className="achievement-date">{achievement.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
