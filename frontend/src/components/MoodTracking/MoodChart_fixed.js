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
  ReferenceLine
} from 'recharts';
import { moodAPI } from '../../services/api';
import { 
  validateAnalyticsResponse, 
  validateMoodValue 
} from '../../utils/moodDataValidation';
import './MoodChart.css';

const MoodChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('line');
  const [selectedPoint, setSelectedPoint] = useState(null);

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
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          moodValue: null,
          moodLabel: 'No Data',
          formatted_date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        };
      });
    }

    // Process real data
    const processed = chartData.map(entry => {
      const moodValue = validateMoodValue(entry.mood);
      const moodKey = Object.keys(moodConfig).find(key => 
        moodConfig[key].value === moodValue
      ) || 'neutral';
      
      return {
        date: entry.date,
        moodValue: moodValue,
        moodLabel: moodConfig[moodKey].label,
        emoji: moodConfig[moodKey].emoji,
        color: moodConfig[moodKey].color,
        intensity: entry.intensity || 5,
        energy: entry.energy || 3,
        stress: entry.stress || 3,
        activity: entry.activity || 'Unknown',
        note: entry.notes || '',
        formatted_date: new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });

    // Fill in missing dates for weekly view
    if (timeRange === 'weekly') {
      const filledData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const existingEntry = processed.find(entry => entry.date === dateString);
        if (existingEntry) {
          filledData.push(existingEntry);
        } else {
          filledData.push({
            date: dateString,
            moodValue: null,
            moodLabel: 'No Data',
            formatted_date: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          });
        }
      }
      return filledData;
    }

    return processed;
  }, [chartData, timeRange, moodConfig]);

  // Fetch chart data with improved error handling
  useEffect(() => {
    fetchChartData();
  }, [timeRange, refreshTrigger]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const days = timeRange === 'weekly' ? 7 : 30;
      const response = await moodAPI.getEntries({
        limit: days,
        sort: 'date',
        order: 'desc'
      });

      if (response?.data?.success && Array.isArray(response.data.data)) {
        setChartData(response.data.data);
      } else {
        console.warn('Invalid mood data structure:', response);
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching mood chart data:', error);
      setError(error.message || 'Failed to load mood data');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.moodValue) {
        return (
          <div className="chart-tooltip">
            <h4>{data.formatted_date}</h4>
            <div className="tooltip-mood">
              <span className="mood-emoji">{data.emoji}</span>
              <span className="mood-text">{data.moodLabel}</span>
            </div>
            {data.activity && (
              <p><strong>Activity:</strong> {data.activity}</p>
            )}
            {data.note && (
              <p><strong>Note:</strong> {data.note}</p>
            )}
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
          <button onClick={fetchChartData} className="retry-button">
            Try Again
          </button>
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

  // Check if data is empty
  const isEmpty = processedChartData.every(d => d.moodLabel === 'No Data');

  return (
    <div className="mood-chart-container">
      {/* Header */}
      <div className="chart-header">
        <div className="header-content">
          <div className="header-icon">
            <span>📊</span>
          </div>
          <div>
            <h2>Mood Trends</h2>
            <p>Track your emotional patterns</p>
          </div>
        </div>

        {/* Controls */}
        <div className="chart-controls">
          {/* Chart Type Toggle */}
          <div className="chart-type-toggle">
            <button
              onClick={() => setChartType('line')}
              className={chartType === 'line' ? 'active' : ''}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={chartType === 'area' ? 'active' : ''}
            >
              Area
            </button>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="weekly">7 Days</option>
            <option value="monthly">30 Days</option>
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-content">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={processedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="formatted_date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="moodValue"
                  stroke="#667eea"
                  strokeWidth={3}
                  fill="url(#moodGradient)"
                  connectNulls={false}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                />
                <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="2 2" />
              </AreaChart>
            ) : (
              <LineChart data={processedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="formatted_date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="moodValue"
                  stroke="#667eea"
                  strokeWidth={3}
                  connectNulls={false}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                />
                <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="2 2" />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistics Summary */}
      {!isEmpty && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">
              {processedChartData.filter(d => d.moodValue).length}
            </div>
            <div className="stat-label">Entries</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {processedChartData.filter(d => d.moodValue).length > 0 
                ? (processedChartData.filter(d => d.moodValue).reduce((sum, d) => sum + d.moodValue, 0) / 
                   processedChartData.filter(d => d.moodValue).length).toFixed(1)
                : '0'}
            </div>
            <div className="stat-label">Average</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {Math.max(...processedChartData.filter(d => d.moodValue).map(d => d.moodValue), 0)}
            </div>
            <div className="stat-label">Highest</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodChart;
