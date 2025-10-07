import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import LoadingSpinner from '../common/LoadingSpinner';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import MoodTrackingBox from './MoodTrackingBox';
import EmotionInsights from './EmotionInsights';
import UpcomingAppointments from './UpcomingAppointments';
import QuickActions from './QuickActions';
import WelcomeMessage from './WelcomeMessage';
import { dashboardAPI } from '../../services/apiWrapper';
import { moodAPI } from '../../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [moodStreaks, setMoodStreaks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for cleanup and preventing multiple calls
  const abortControllerRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  // Function to fetch mood streaks
  const fetchMoodStreaks = async () => {
    try {
      const response = await moodAPI.getStreaks();
      if (response.data && response.data.success) {
        setMoodStreaks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching mood streaks:', error);
    }
  };

  // Debounced fetch function to prevent spam
  const fetchDashboardData = useCallback(async () => {
    const now = Date.now();
    const minInterval = 5000; // Minimum 5 seconds between fetches to prevent flickering
    
    // Prevent too frequent calls
    if (now - lastFetchTimeRef.current < minInterval) {
      console.log('⏳ Dashboard fetch skipped - too frequent');
      return;
    }
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    lastFetchTimeRef.current = now;
    
    try {
      // Only set loading to true if we don't have data yet
      if (!dashboardData) {
        setLoading(true);
      }
      setError(null);
      
      console.log('🌐 Fetching dashboard data...');
      const [dashboardResponse, streaksResponse] = await Promise.allSettled([
        dashboardAPI.getDashboardData(),
        moodAPI.getStreaks()
      ]);
      
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      // Transform backend data to match frontend expectations
      const response = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value : null;
      console.log('🌐 Raw dashboard API response:', response?.data);
      
      // Handle mood streaks
      if (streaksResponse.status === 'fulfilled' && streaksResponse.value.data.success) {
        setMoodStreaks(streaksResponse.value.data.data);
      }
      
      const transformedData = {
        ...response?.data,
        // Enhanced mood statistics for MoodTrackingBox
        moodStats: response?.data?.moodStats || {
          totalEntries: 0,
          thisWeekEntries: 0,
          averageMood: 0,
          lastEntry: null
        },
        emotionData: response?.data?.emotionTrends || [],
        appointments: response?.data?.recentAppointments || []
      };
      
      console.log('📊 Dashboard Data Loaded:', {
        moodStats: transformedData.moodStats,
        hasRecentData: transformedData.moodStats.totalEntries > 0,
        emotionDataCount: transformedData.emotionData.length,
        appointmentsCount: transformedData.appointments.length
      });
      
      if (isMountedRef.current) {
        setDashboardData(transformedData);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('� Dashboard fetch aborted');
        return;
      }
      
      console.error('Dashboard error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [dashboardData]);

  // Single useEffect for initial load and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch only - no event listeners to prevent circular dependencies
    fetchDashboardData();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

  // Listen for mood data updates to refresh streaks
  useEffect(() => {
    const handleMoodDataUpdate = () => {
      console.log('🔄 Mood data update detected in Dashboard, refreshing streaks...');
      fetchMoodStreaks();
    };

    window.addEventListener('moodDataUpdated', handleMoodDataUpdate);
    window.addEventListener('moodEntryAdded', handleMoodDataUpdate);

    return () => {
      window.removeEventListener('moodDataUpdated', handleMoodDataUpdate);
      window.removeEventListener('moodEntryAdded', handleMoodDataUpdate);
    };
  }, []);

  // Separate effect for location-based refresh (more controlled)
  useEffect(() => {
    // Only refresh if explicitly requested via state
    if (location.state?.refreshDashboard && isMountedRef.current) {
      console.log('🔄 Location state refresh triggered...');
      fetchDashboardData();
      
      // Clear the refresh flag
      window.history.replaceState({}, document.title);
    }
  }, [location.state, fetchDashboardData]);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'mood':
        navigate('/moodtracking');
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

  // REMOVED: handleMoodDataUpdate function that was causing circular dependencies

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
    <DashboardErrorBoundary>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <WelcomeMessage user={dashboardData?.user} moodStreaks={moodStreaks} />
        </div>

        <div className="dashboard-content">
          {/* Top Row - Quick Actions */}
          <div className="dashboard-top-row">
            <DashboardErrorBoundary>
              <div className="top-row-item quick-actions">
                <QuickActions onAction={handleQuickAction} />
              </div>
            </DashboardErrorBoundary>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-main-grid">
            <DashboardErrorBoundary>
              <div className="grid-item mood-tracking">
                <MoodTrackingBox />
              </div>
            </DashboardErrorBoundary>
            
            <DashboardErrorBoundary>
              <div className="grid-item appointments">
                <UpcomingAppointments appointments={dashboardData?.appointments} />
              </div>
            </DashboardErrorBoundary>
            
            <DashboardErrorBoundary>
              <div className="grid-item emotion-insights">
                <EmotionInsights data={dashboardData?.emotionData} />
              </div>
            </DashboardErrorBoundary>
          </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
