import React, { useState, useEffect } from 'react';
import './MoodChart.css';

const MoodChart = ({ data, timeRange = '7d' }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange);

  useEffect(() => {
    console.log('📊 MoodChart received data:', data);
    
    if (data && Array.isArray(data) && data.length > 0) {
      // Process real data
      const processedData = data.map(entry => ({
        date: entry.date,
        mood: parseInt(entry.mood) || 3,
        intensity: parseInt(entry.intensity) || 5,
        label: entry.label || new Date(entry.date).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        timeOfDay: entry.timeOfDay,
        activity: entry.activity,
        notes: entry.notes
      }));
      
      setChartData(processedData);
      setLoading(false);
      console.log('✅ MoodChart data processed:', processedData);
    } else {
      // No data available - show empty state
      setLoading(false);
      setChartData([]);
      console.log('ℹ️ MoodChart: No data available, showing empty state');
    }
  }, [data]);

  const generateMockData = () => {
    // This function is kept for fallback but shouldn't be used with real data
    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const days = periods[selectedPeriod] || 7;
    const mockData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split('T')[0],
        mood: Math.floor(Math.random() * 5) + 1,
        intensity: Math.floor(Math.random() * 10) + 1,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    
    return mockData;
  };

  const getMoodColor = (mood) => {
    const colors = {
      1: '#e74c3c', // Very low - Red
      2: '#f39c12', // Low - Orange
      3: '#f1c40f', // Neutral - Yellow
      4: '#2ecc71', // Good - Green
      5: '#27ae60'  // Excellent - Dark Green
    };
    return colors[mood] || '#bdc3c7';
  };

  const getMoodLabel = (mood) => {
    const labels = {
      1: 'Very Low',
      2: 'Low',
      3: 'Neutral',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[mood] || 'Unknown';
  };

  const getAverageMood = () => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.mood, 0);
    return (sum / chartData.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (chartData.length < 2) return 'stable';
    const recent = chartData.slice(-7);
    const older = chartData.slice(-14, -7);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, item) => acc + item.mood, 0) / recent.length;
    const olderAvg = older.reduce((acc, item) => acc + item.mood, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 0.3) return 'improving';
    if (diff < -0.3) return 'declining';
    return 'stable';
  };

  const maxMood = 5;
  const chartHeight = 200;

  if (loading) {
    return (
      <div className="mood-chart loading">
        <div className="chart-header">
          <div className="loading-skeleton title-skeleton"></div>
          <div className="loading-skeleton subtitle-skeleton"></div>
        </div>
        <div className="chart-container">
          <div className="loading-skeleton chart-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h3>Mood Tracking</h3>
          <p>Your emotional journey over time</p>
        </div>
        <div className="chart-controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        {chartData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h4>No Mood Data Yet</h4>
            <p>Start tracking your mood to see your emotional journey over time</p>
            <button 
              className="cta-button"
              onClick={() => window.location.href = '/moodtracking'}
            >
              📝 Track Your Mood Now
            </button>
          </div>
        ) : (
          <>
            <div className="chart-y-axis">
              {[5, 4, 3, 2, 1].map(level => (
                <div key={level} className="y-axis-label">
                  <span>{getMoodLabel(level)}</span>
                </div>
              ))}
            </div>
            
            <div className="chart-content">
              <svg width="100%" height={chartHeight} className="mood-chart-svg">
                {/* Grid lines */}
                {[1, 2, 3, 4, 5].map(level => (
                  <line
                    key={level}
                    x1="0"
                    y1={chartHeight - (level * chartHeight / maxMood)}
                    x2="100%"
                    y2={chartHeight - (level * chartHeight / maxMood)}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Mood line */}
                {chartData.length > 1 && (
                  <polyline
                    points={chartData.map((item, index) => 
                      `${(index * 100) / (chartData.length - 1)},${chartHeight - (item.mood * chartHeight / maxMood)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                
                {/* Mood points */}
                {chartData.map((item, index) => (
                  <g key={index}>
                    <circle
                      cx={`${(index * 100) / (chartData.length - 1)}%`}
                      cy={chartHeight - (item.mood * chartHeight / maxMood)}
                      r="6"
                      fill={getMoodColor(item.mood)}
                      stroke="#fff"
                      strokeWidth="2"
                      className="mood-point"
                      data-mood={item.mood}
                      data-date={item.date}
                      data-label={item.label}
                    />
                    <text
                      x={`${(index * 100) / (chartData.length - 1)}%`}
                      y={chartHeight + 15}
                      textAnchor="middle"
                      className="x-axis-label"
                      fontSize="12"
                      fill="#7f8c8d"
                    >
                      {item.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </>
        )}
      </div>

      {chartData.length > 0 && (
        <>
          <div className="chart-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Average Mood</span>
                <span className="stat-value" style={{ color: getMoodColor(Math.round(getAverageMood())) }}>
                  {getAverageMood()}/5
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trend</span>
                <span className={`stat-value trend-${getMoodTrend()}`}>
                  {getMoodTrend() === 'improving' && '📈 Improving'}
                  {getMoodTrend() === 'declining' && '📉 Declining'}
                  {getMoodTrend() === 'stable' && '📊 Stable'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Entries</span>
                <span className="stat-value">{chartData.length}</span>
              </div>
            </div>
          </div>

          <div className="mood-legend">
            <h4>Mood Scale</h4>
            <div className="legend-items">
              {[1, 2, 3, 4, 5].map(mood => (
                <div key={mood} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: getMoodColor(mood) }}
                  ></div>
                  <span>{getMoodLabel(mood)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodChart;
