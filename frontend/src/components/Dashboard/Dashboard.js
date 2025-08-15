import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import LoadingSpinner from '../common/LoadingSpinner';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import MoodChart from './MoodChart';
import MoodTrackingBox from './MoodTrackingBox';
import EmotionInsights from './EmotionInsights';
import UpcomingAppointments from './UpcomingAppointments';
import QuickActions from './QuickActions';
import WelcomeMessage from './WelcomeMessage';
import { dashboardAPI } from '../../services/apiWrapper';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for cleanup and preventing multiple calls
  const abortControllerRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  // Debounced fetch function to prevent spam
  const fetchDashboardData = useCallback(async () => {
    const now = Date.now();
    const minInterval = 2000; // Minimum 2 seconds between fetches
    
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
      setLoading(true);
      setError(null);
      
      console.log('🌐 Fetching dashboard data...');
      const response = await dashboardAPI.getDashboardData();
      
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      // Transform backend data to match frontend expectations
      console.log('🌐 Raw dashboard API response:', response.data);
      
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
        rawMoodDataSample: transformedData.moodData.slice(0, 2)
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
  }, []);

  // Single useEffect for initial load and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchDashboardData();
    
    // Listen for mood data updates (but debounced)
    const handleMoodDataUpdate = (event) => {
      console.log('🔄 Mood data updated event received');
      // Add delay to prevent immediate refetch
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchDashboardData();
        }
      }, 1000);
    };

    // Only listen for specific events, not all visibility changes
    window.addEventListener('moodDataUpdated', handleMoodDataUpdate);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('moodDataUpdated', handleMoodDataUpdate);
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

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
          <WelcomeMessage user={dashboardData?.user} />
        </div>

        <div className="dashboard-content">
          <div className="dashboard-grid">
            <DashboardErrorBoundary>
              <div className="grid-item quick-actions">
                <QuickActions onAction={handleQuickAction} />
              </div>
            </DashboardErrorBoundary>
            
            <DashboardErrorBoundary>
              <div className="grid-item mood-tracking">
                <MoodTrackingBox />
              </div>
            </DashboardErrorBoundary>
            
            <DashboardErrorBoundary>
              <div className="grid-item mood-chart">
                <MoodChart data={dashboardData?.moodData} />
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
