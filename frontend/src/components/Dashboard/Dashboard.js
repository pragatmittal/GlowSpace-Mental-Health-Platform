import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import LoadingSpinner from '../common/LoadingSpinner';
import MoodChart from './MoodChart';
import EmotionInsights from './EmotionInsights';
import UpcomingAppointments from './UpcomingAppointments';
import QuickActions from './QuickActions';
import WelcomeMessage from './WelcomeMessage';
import { dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  // Auto-refresh when coming back from mood tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing dashboard data...');
        fetchDashboardData();
      }
    };

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when location changes (user navigates back to dashboard)
    if (location.state?.refreshDashboard) {
      console.log('🔄 Location state refresh triggered...');
      fetchDashboardData();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location]);

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
      
      // Transform backend data to match frontend expectations
      console.log('🌐 Raw dashboard API response:', response.data);
      console.log('📋 moodData from API:', response.data.moodData);
      console.log('📈 moodTrends from API:', response.data.moodTrends);
      console.log('📊 moodStats from API:', response.data.moodStats);
      
      const transformedData = {
        ...response.data,
        // Use the new moodData field if available, fallback to moodTrends
        moodData: response.data.moodData?.map(entry => ({
          date: entry.createdAt,
          mood: entry.moodValue,
          intensity: entry.intensity,
          timeOfDay: entry.timeOfDay,
          activity: entry.activity,
          label: entry.formattedDate,
          notes: entry.notes || ''
        })) || response.data.moodTrends?.map(trend => ({
          date: trend.date || trend._id?.date,
          mood: Math.round(trend.avgMood || 3), // Fallback to neutral
          intensity: Math.round(trend.avgIntensity || 5),
          label: new Date(trend.date || trend._id?.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        })) || [],
        // Enhanced mood statistics
        moodStats: response.data.moodStats || {
          totalEntries: 0,
          thisWeekEntries: 0,
          averageMood: 0,
          lastEntry: null
        },
        emotionData: response.data.emotionTrends || [],
        appointments: response.data.recentAppointments || []
      };
      
      console.log('📊 Dashboard Data Loaded:', {
        moodDataCount: transformedData.moodData.length,
        moodStats: transformedData.moodStats,
        hasRecentData: transformedData.moodData.length > 0,
        rawMoodDataSample: transformedData.moodData.slice(0, 2),
        rawAPIResponse: {
          moodDataLength: response.data.moodData?.length || 0,
          moodTrendsLength: response.data.moodTrends?.length || 0,
          totalMoodEntries: response.data.moodStats?.totalEntries || 0
        }
      });
      
      setDashboardData(transformedData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
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
      <LoadingSpinner 
        type="pulse" 
        size="large" 
        text="Loading your personalized dashboard..." 
        overlay={true}
      />
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          ✨ Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <WelcomeMessage user={dashboardData?.user} />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="grid-item quick-actions">
            <QuickActions onAction={handleQuickAction} />
          </div>
          
          <div className="grid-item mood-chart">
            <MoodChart data={dashboardData?.moodData} />
          </div>
          
          <div className="grid-item appointments">
            <UpcomingAppointments appointments={dashboardData?.appointments} />
          </div>
          
          <div className="grid-item emotion-insights">
            <EmotionInsights data={dashboardData?.emotionData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
