import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { moodAPI } from '../../services/api';
import { 
  validateAnalyticsResponse, 
  validateMoodValue 
} from '../../utils/moodDataValidation';
import './MoodChart.css';

const MoodChart = ({ refreshTrigger, isDarkMode = false }) => {
  // State for chart data and mood entries
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('weekly');
  
  // Add state for live mood data that will be used by pie chart
  const [liveMoodData, setLiveMoodData] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  // Mood configuration with improved accessibility
  const moodConfig = {
    'very_happy': {
      value: 5,
      label: 'Very Happy',
      emoji: '😄',
      color: '#27ae60',
      description: 'Feeling fantastic!'
    },
    'happy': {
      value: 4,
      label: 'Happy',
      emoji: '😊',
      color: '#2ecc71',
      description: 'Feeling good'
    },
    'neutral': {
      value: 3,
      label: 'Neutral',
      emoji: '😐',
      color: '#f1c40f',
      description: 'Feeling okay'
    },
    'sad': {
      value: 2,
      label: 'Sad',
      emoji: '😞',
      color: '#f39c12',
      description: 'Feeling down'
    },
    'very_sad': {
      value: 1,
      label: 'Very Sad',
      emoji: '😢',
      color: '#e74c3c',
      description: 'Feeling terrible'
    }
  };

  const colorScale = {
    1: '#EF4444',
    2: '#F97316',
    3: '#EAB308',
    4: '#22C55E',
    5: '#10B981'
  };

  // Process chart data with enhanced error handling and validation
  const processedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    // Return the chart data as-is since it's already processed in fetchChartData
    return chartData;
  }, [chartData]);

  // Function to refresh live mood data for pie chart
  const refreshLiveMoodData = async () => {
    try {
      console.log('🔄 Refreshing live mood data for pie chart...');
      const entriesResponse = await moodAPI.getEntries({ 
        limit: 100 
      });
      
      if (entriesResponse?.data?.success && entriesResponse.data.data) {
        const rawEntries = entriesResponse.data.data;
        console.log('📊 Fresh mood entries fetched for pie chart:', rawEntries.length);
        
        // Process raw entries for pie chart
        const processedEntries = rawEntries.map((entry, index) => {
          let moodValue;
          if (typeof entry.mood === 'string') {
            switch (entry.mood) {
              case 'very_happy': moodValue = 5; break;
              case 'happy': moodValue = 4; break;
              case 'neutral': moodValue = 3; break;
              case 'sad': moodValue = 2; break;
              case 'very_sad': moodValue = 1; break;
              default: moodValue = 3;
            }
        } else {
            moodValue = validateMoodValue(entry.mood);
          }
          
          const entryDate = entry.date || entry.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
          const entryTime = entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '';
          
          return {
            id: entry._id || index,
            date: entryDate,
            time: entryTime,
            moodValue: moodValue,
            moodLabel: getMoodLabel(moodValue),
            emoji: getMoodEmoji(moodValue),
            color: getMoodColor(moodValue),
            intensity: entry.intensity || 5,
            activity: entry.activity || 'other',
            timeOfDay: entry.timeOfDay || 'unknown',
            notes: entry.notes || '',
            originalMood: entry.mood,
            formatted_date: `${new Date(entryDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} ${entryTime}`,
            chartKey: `${entryDate}_${index}`
          };
        });
        
        // Update live mood data state
        setLiveMoodData([...processedEntries]);
        setLastUpdateTime(Date.now());
        console.log('✅ Live mood data updated for pie chart');
      }
    } catch (error) {
      console.error('❌ Error refreshing live mood data:', error);
    }
  };

  // Initial data fetch and refresh trigger handling
  useEffect(() => {
    console.log('🚀 MoodChart component mounted or refreshTrigger changed');
    fetchChartData();
    refreshLiveMoodData(); // Also refresh live mood data for pie chart
  }, [refreshTrigger, timeRange]);

  // Refresh live mood data when component mounts
  useEffect(() => {
    console.log('🔄 Initial live mood data refresh');
    refreshLiveMoodData();
  }, []);

  // Listen for real-time mood updates
  useEffect(() => {
    const handleMoodUpdate = (event) => {
      console.log('📊 Mood update detected, refreshing chart...', event?.detail);
      
      // Force immediate refresh when new mood is added
      if (event?.detail?.action === 'create') {
        console.log('🆕 New mood entry detected, forcing immediate refresh');
        // Small delay to ensure backend has processed the new entry
        setTimeout(() => {
          fetchChartData();
          refreshLiveMoodData(); // Also refresh live mood data for pie chart
        }, 1000);
      } else {
      fetchChartData();
        refreshLiveMoodData(); // Also refresh live mood data for pie chart
      }
    };

    // Listen for custom mood update events
    window.addEventListener('moodDataUpdated', handleMoodUpdate);
    
    // Also listen for storage changes (if mood is saved to localStorage)
    window.addEventListener('storage', handleMoodUpdate);

    // Listen for any mood-related updates
    window.addEventListener('moodEntryAdded', handleMoodUpdate);
    window.addEventListener('moodDataChanged', handleMoodUpdate);

    return () => {
      window.removeEventListener('moodDataUpdated', handleMoodUpdate);
      window.removeEventListener('storage', handleMoodUpdate);
      window.removeEventListener('moodEntryAdded', handleMoodUpdate);
      window.removeEventListener('moodDataChanged', handleMoodUpdate);
    };
  }, []);

  const fetchChartData = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setIsUpdating(true);
        setError(null);
      }

      console.log('🔄 Fetching chart data for timeRange:', timeRange);

      // Always get raw mood entries first for complete data
      try {
        console.log('📊 Fetching raw mood entries...');
        const entriesResponse = await moodAPI.getEntries({ 
          limit: 100 // Get entries for chart data
        });
        
        if (entriesResponse?.data?.success && entriesResponse.data.data) {
          const rawEntries = entriesResponse.data.data;
          console.log('📊 Raw mood entries fetched:', rawEntries.length, 'entries');
          
          // Process raw entries directly - create one data point per entry
          const processedEntries = rawEntries.map((entry, index) => {
            // Map string mood values to numeric values for chart display
            let moodValue;
            if (typeof entry.mood === 'string') {
              switch (entry.mood) {
                case 'very_happy':
                  moodValue = 5;
                  break;
                case 'happy':
                  moodValue = 4;
                  break;
                case 'neutral':
                  moodValue = 3;
                  break;
                case 'sad':
                  moodValue = 2;
                  break;
                case 'very_sad':
                  moodValue = 1;
                  break;
                default:
                  moodValue = 3;
              }
            } else {
              moodValue = validateMoodValue(entry.mood);
            }
            
            // Use createdAt date if date field is not available
            const entryDate = entry.date || entry.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
            const entryTime = entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '';
            
            return {
              id: entry._id || index,
              date: entryDate,
              time: entryTime,
              moodValue: moodValue,
              moodLabel: getMoodLabel(moodValue),
              emoji: getMoodEmoji(moodValue),
              color: getMoodColor(moodValue),
              intensity: entry.intensity || 5,
              activity: entry.activity || 'other',
              timeOfDay: entry.timeOfDay || 'unknown',
              notes: entry.notes || '',
              originalMood: entry.mood,
              formatted_date: `${new Date(entryDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} ${entryTime}`,
              // For chart display, use a unique identifier for each entry
              chartKey: `${entryDate}_${index}`
            };
          });
          
          // Sort entries by date and time (newest first)
          processedEntries.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
          
          // For weekly view, filter to last 7 days but keep all data for pie chart
          let finalData = processedEntries;
          if (timeRange === 'weekly') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            finalData = processedEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
          }
          
          // Store the complete data for pie chart and other calculations
          setChartData(finalData);
          
          // Also update the live mood data state for pie chart
          setLiveMoodData([...finalData]);
          setLastUpdateTime(Date.now());
          
          // Set loading to false and show update animation
          setLoading(false);
          setTimeout(() => setIsUpdating(false), 1000);
          return;
        }
      } catch (entriesError) {
        console.error('❌ Failed to fetch raw entries:', entriesError);
      }

      // Only fallback to analytics if raw entries completely fail
      console.log('🔄 Falling back to analytics API...');
      const response = await moodAPI.getAnalytics({ 
        timeRange: timeRange === 'weekly' ? '7d' : '30d' 
      });

      if (response?.data?.success && response.data.data?.trends) {
        // Transform analytics data to chart format
        const trends = response.data.data.trends;
        console.log('📊 Raw trends data from analytics:', trends);
        
        const transformedData = trends.map(trend => ({
          date: trend.date,
          moodValue: trend.avgMood,
          moodLabel: getMoodLabel(trend.avgMood),
          emoji: getMoodEmoji(trend.avgMood),
          color: getMoodColor(trend.avgMood),
          intensity: trend.avgIntensity,
          totalEntries: trend.totalEntries,
          moodEntries: trend.moodEntries || [],
          formatted_date: new Date(trend.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        
        setChartData(transformedData);
        console.log('📊 Chart data from analytics:', transformedData);
      } else {
        console.warn('⚠️ Analytics API also failed');
        setChartData([]);
      }
      
      // Set loading to false
      setLoading(false);
      setTimeout(() => setIsUpdating(false), 1000);
      
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
      setError(error.message || 'Failed to load chart data');
      setChartData([]);
      setLoading(false);
      setIsUpdating(false);
    }
  };

  // Helper functions for mood data
  const getMoodLabel = (moodValue) => {
    if (moodValue >= 4.5) return 'Very Happy';
    if (moodValue >= 3.5) return 'Happy';
    if (moodValue >= 2.5) return 'Neutral';
    if (moodValue >= 1.5) return 'Sad';
    return 'Very Sad';
  };

  const getMoodEmoji = (moodValue) => {
    if (moodValue >= 4.5) return '😄';
    if (moodValue >= 3.5) return '😊';
    if (moodValue >= 2.5) return '😐';
    if (moodValue >= 1.5) return '😞';
    return '😢';
  };

  const getMoodColor = (moodValue) => {
    if (moodValue >= 4.5) return '#10B981';
    if (moodValue >= 3.5) return '#22C55E';
    if (moodValue >= 2.5) return '#EAB308';
    if (moodValue >= 1.5) return '#F97316';
    return '#EF4444';
  };

  // Fill weekly data with all 7 days
  const fillWeeklyData = (trendsData) => {
    const filledData = [];
    const today = new Date();
    
    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Find existing data for this date
      const existingData = trendsData.find(trend => trend.date === dateString);
      
      if (existingData) {
        // Use existing data
        filledData.push(existingData);
      } else {
        // Create placeholder for missing date
        filledData.push({
          date: dateString,
          moodValue: null,
          moodLabel: 'No Data',
          emoji: '❓',
          color: '#94a3b8',
          intensity: 0,
          totalEntries: 0,
          moodEntries: [],
          formatted_date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    console.log('📅 Weekly data filled:', filledData);
    return filledData;
  };

  // Calculate mood trend indicator
  const getMoodTrendIndicator = () => {
    if (chartData.length < 2) return null;
    
    const recentMoods = chartData
      .filter(d => d.moodValue)
      .slice(-3); // Last 3 data points
    
    if (recentMoods.length < 2) return null;
    
    const firstMood = recentMoods[0].moodValue;
    const lastMood = recentMoods[recentMoods.length - 1].moodValue;
    const change = lastMood - firstMood;
    
    if (change > 0.5) {
      return (
        <div className="trend-up">
          <span>📈</span>
          <span>Mood Improving</span>
        </div>
      );
    } else if (change < -0.5) {
      return (
        <div className="trend-down">
          <span>📉</span>
          <span>Mood Declining</span>
        </div>
      );
    } else {
      return (
        <div className="trend-stable">
          <span>➡️</span>
          <span>Mood Stable</span>
        </div>
      );
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.moodValue) {
        return (
          <div className="chart-tooltip" style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>{data.formatted_date}</h4>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>{data.emoji}</span>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>{data.moodLabel}</span>
              <span style={{ color: '#6c757d', marginLeft: '8px' }}>({data.moodValue.toFixed(1)}/5)</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              <div><strong>Time:</strong> {data.time || 'Unknown'}</div>
              <div><strong>Time of Day:</strong> {data.timeOfDay}</div>
              <div><strong>Activity:</strong> {data.activity}</div>
              <div><strong>Intensity:</strong> {data.intensity}/10</div>
              {data.notes && <div><strong>Notes:</strong> {data.notes}</div>}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="mood-chart-container">
        <div className="chart-header">
          <h2>📈 Mood Trends</h2>
          <p>Loading your mood data...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <p>Analyzing your emotional patterns...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mood-chart-container">
        <div className="chart-header">
          <h2>📈 Mood Trends</h2>
          <p>Unable to load mood data</p>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          {lastError && (
            <div className="rate-limit-info">
              <p className="rate-limit-message">{lastError}</p>
              {retryCount > 0 && (
                <p className="retry-info">Retry attempts: {retryCount}/3</p>
              )}
            </div>
          )}
          <div className="error-actions">
            <button onClick={() => fetchChartData()} className="retry-button">
              Try Again
            </button>
            {retryCount > 0 && (
              <button 
                onClick={() => {
                  setRetryCount(0);
                  setLastError(null);
                  fetchChartData();
                }} 
                className="reset-button"
              >
                Reset & Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state component
  const EmptyState = () => (
    <div className="empty-chart">
      <div className="empty-chart-icon">📊</div>
      <h4>No mood data yet</h4>
      <p>Start tracking your mood to see trends and patterns here.</p>
    </div>
  );

  // Check if data is empty - be more lenient
  const hasValidData = processedChartData.some(d => d.moodValue && d.moodValue > 0);
  const isEmpty = !hasValidData;
  
  // Show chart only when we have real user data
  const shouldShowChart = processedChartData.length > 0 && hasValidData;
  
  // Debug logging
  console.log('🎯 Chart render state:', {
    loading,
    error,
    chartData: chartData.length,
    processedChartData: processedChartData.length,
    isEmpty,
    hasValidData,
    shouldShowChart,
    isUpdating
  });

  // Function to get mood distribution data for the pie chart
  const getMoodDistributionData = () => {
    // Use the live mood data state that gets updated when new entries are added
    const allEntries = liveMoodData.length > 0 ? liveMoodData : chartData;
    const moodCounts = {};
    
    console.log('🍰 Pie chart data source:', {
      liveMoodDataCount: liveMoodData.length,
      chartDataCount: chartData.length,
      totalEntries: allEntries.length,
      lastUpdate: new Date(lastUpdateTime).toLocaleTimeString()
    });
    
    // Count occurrences of each mood label from all entries
    allEntries.forEach(entry => {
      const moodLabel = entry.moodLabel;
      if (moodLabel) {
        moodCounts[moodLabel] = (moodCounts[moodLabel] || 0) + 1;
      }
    });

    // Define colors for each mood type
    const moodColors = {
      'Very Happy': '#10B981',
      'Happy': '#22C55E', 
      'Neutral': '#EAB308',
      'Sad': '#F97316',
      'Very Sad': '#EF4444'
    };

    // Sort by count (highest first) for better visualization
    const sortedData = Object.entries(moodCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: moodColors[name] || '#94a3b8'
      }))
      .sort((a, b) => b.value - a.value);

    console.log('🍰 Pie chart mood distribution:', sortedData);
    return sortedData;
  };

  return (
    <div className="mood-chart-container">
      {/* Header */}


              {/* Chart Container */}
        <div className="chart-content">
          {!shouldShowChart || processedChartData.length === 0 ? (
            <div className="empty-chart">
              <div className="empty-chart-icon">📊</div>
              <h4>No mood data available</h4>
              <p>
                {processedChartData.length === 0 
                  ? "We couldn't fetch your mood entries. Please try refreshing or check your connection."
                  : "Start tracking your mood to see trends and patterns here."
                }
              </p>
              <button onClick={fetchChartData} className="retry-button">
                Refresh Data
              </button>
            </div>
          ) : (
            <>
              {/* Chart Container removed - no more white box */}
              
              {/* Mood Distribution Pie Chart */}
              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                background: isDarkMode ? 'rgba(26, 32, 44, 0.9)' : 'white', 
                borderRadius: '12px', 
                border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid #e2e8f0',
                color: isDarkMode ? 'var(--text-primary)' : '#495057'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ 
                    margin: '0', 
                    color: isDarkMode ? 'var(--text-primary)' : '#495057' 
                  }}>📊 Mood Distribution</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: isDarkMode ? 'var(--text-secondary)' : '#6c757d' 
                    }}>
                      Based on {liveMoodData.length > 0 ? liveMoodData.length : chartData.length} total entries
                    </span>
                    <span style={{ 
                      fontSize: '10px', 
                      color: isDarkMode ? 'var(--text-muted)' : '#9ca3af' 
                    }}>
                      Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                    </span>
                    <button 
                      onClick={() => {
                        refreshLiveMoodData();
                        fetchChartData();
                      }}
                      style={{
                        padding: '6px 12px',
                        background: isDarkMode ? 'var(--primary-color)' : '#667eea',
                        color: isDarkMode ? '#1a202c' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {/* Pie Chart */}
                  <div style={{ flex: '1', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getMoodDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getMoodDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
          </ResponsiveContainer>
    </div>

                  {/* Legend */}
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h5 style={{ 
                      margin: '0 0 15px 0', 
                      color: isDarkMode ? 'var(--text-primary)' : '#495057' 
                    }}>Legend</h5>
                    {getMoodDistributionData().map((entry, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          backgroundColor: entry.color, 
                          borderRadius: '50%' 
                        }}></div>
                        <span style={{ 
                          fontSize: '14px', 
                          color: isDarkMode ? 'var(--text-primary)' : '#495057' 
                        }}>
                          {entry.name}: {entry.value} entries ({((entry.value / chartData.length) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Individual Entries View - Show all user entries */}
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: isDarkMode ? 'rgba(26, 32, 44, 0.8)' : '#f8f9fa', 
                borderRadius: '8px', 
                border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid #dee2e6' 
              }}>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  color: isDarkMode ? 'var(--text-primary)' : '#495057' 
                }}>📝 Individual Mood Entries (All {processedChartData.length} Entries)</h4>
                
                {/* Show all individual entries */}
                <div style={{ display: 'grid', gap: '12px' }}>
                  {processedChartData.map((entry, index) => (
                    <div key={entry.id || index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px',
                      padding: '12px',
                      background: isDarkMode ? 'rgba(26, 32, 44, 0.9)' : 'white',
                      borderRadius: '8px',
                      border: `2px solid ${entry.color}`,
                      boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ 
                        fontSize: '24px', 
                        width: '40px', 
                        textAlign: 'center' 
                      }}>
                        {entry.emoji}
                      </div>
                      <div style={{ flex: '1' }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: isDarkMode ? 'var(--text-primary)' : '#495057', 
                          fontSize: '16px' 
                        }}>
                          {entry.moodLabel} ({entry.moodValue.toFixed(1)}/5)
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: isDarkMode ? 'var(--text-secondary)' : '#6c757d', 
                          marginTop: '4px' 
                        }}>
                          📅 {entry.formatted_date}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: isDarkMode ? 'var(--text-secondary)' : '#6c757d' 
                        }}>
                          🕐 {entry.timeOfDay} • 🎯 {entry.activity}
                        </div>
                        {entry.notes && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: isDarkMode ? 'var(--text-secondary)' : '#6c757d', 
                            marginTop: '4px', 
                            fontStyle: 'italic' 
                          }}>
                            💭 {entry.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        padding: '6px 10px', 
                        background: entry.color, 
                        color: 'white', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        minWidth: '50px',
                        textAlign: 'center'
                      }}>
                        {entry.intensity}/10
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary Statistics section removed */}
              </div>
            </>
          )}
            </div>
            
    {/* Statistics Summary section removed */}
    </div>
  );
};

export default MoodChart;
