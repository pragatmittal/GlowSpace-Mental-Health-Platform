import React, { useMemo } from 'react';
import './MoodChart.css';

const MoodChart = ({ data, timeRange }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return []; // Return empty array instead of mock data
    }

    return data.map(item => ({
      date: item._id.date || item._id,
      avgMood: item.avgMood || 0,
      avgIntensity: item.avgIntensity || 0,
      totalEntries: item.totalEntries || 0
    }));
  }, [data, timeRange]);

  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
  const moodColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];

  const getMoodLabel = (value) => {
    const index = Math.round(value);
    return moodLabels[Math.max(0, Math.min(index, moodLabels.length - 1))];
  };

  const getMoodColor = (value) => {
    const index = Math.round(value);
    return moodColors[Math.max(0, Math.min(index, moodColors.length - 1))];
  };

  // Handle empty data case
  if (!chartData || chartData.length === 0) {
    return (
      <div className="mood-chart">
        <div className="chart-container">
          <div className="no-data-message">
            <p>No mood data available yet</p>
            <p>Start tracking your mood to see trends here</p>
          </div>
        </div>
      </div>
    );
  }

  const maxMood = Math.max(...chartData.map(d => d.avgMood));
  const minMood = Math.min(...chartData.map(d => d.avgMood));
  const range = maxMood - minMood;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (timeRange === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeRange === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getYPosition = (value) => {
    if (range === 0) return 50; // If all values are the same, center the line
    const normalizedValue = (value - minMood) / range;
    return 100 - (normalizedValue * 80); // 80% of chart height, 10% padding top and bottom
  };

  const getXPosition = (index) => {
    if (chartData.length <= 1) return 50; // If only one data point, center it
    return (index / (chartData.length - 1)) * 80 + 10; // 80% of chart width, 10% padding left and right
  };

  return (
    <div className="mood-chart">
      <div className="chart-container">
        {/* Y-axis labels */}
        <div className="y-axis">
          {moodLabels.map((label, index) => (
            <div 
              key={index}
              className="y-label"
              style={{ 
                top: `${getYPosition(index)}%`,
                color: moodColors[index]
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="chart-area">
          {/* Grid lines */}
          <div className="grid-lines">
            {moodLabels.map((_, index) => (
              <div 
                key={index}
                className="grid-line"
                style={{ top: `${getYPosition(index)}%` }}
              ></div>
            ))}
          </div>

          {/* Data line */}
          <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#764ba2" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={chartData.map((point, index) => {
                const x = getXPosition(index);
                const y = getYPosition(point.avgMood);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ') + ` L ${getXPosition(chartData.length - 1)} 100 L ${getXPosition(0)} 100 Z`}
              fill="url(#moodGradient)"
              className="area-fill"
            />
            
            {/* Line */}
            <path
              d={chartData.map((point, index) => {
                const x = getXPosition(index);
                const y = getYPosition(point.avgMood);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#667eea"
              strokeWidth="2"
              fill="none"
              className="data-line"
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = getXPosition(index);
              const y = getYPosition(point.avgMood);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={getMoodColor(point.avgMood)}
                  stroke="white"
                  strokeWidth="2"
                  className="data-point"
                />
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="x-axis">
          {chartData.map((point, index) => {
            // Show fewer labels on smaller screens or longer time ranges
            const shouldShow = timeRange === '7d' || 
                             (timeRange === '30d' && index % 3 === 0) ||
                             (timeRange === '90d' && index % 7 === 0);
            
            return shouldShow ? (
              <div 
                key={index}
                className="x-label"
                style={{ left: `${getXPosition(index)}%` }}
              >
                {formatDate(point.date)}
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Chart legend */}
      <div className="chart-legend">
        <div className="legend-title">Mood Scale</div>
        <div className="legend-items">
          {moodLabels.map((label, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color"
                style={{ backgroundColor: moodColors[index] }}
              ></div>
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart stats */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Average Mood</span>
          <span className="stat-value">
            {getMoodLabel(chartData.reduce((sum, d) => sum + d.avgMood, 0) / chartData.length)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Entries</span>
          <span className="stat-value">
            {chartData.reduce((sum, d) => sum + d.totalEntries, 0)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best Day</span>
          <span className="stat-value">
            {formatDate(chartData.reduce((best, current) => 
              current.avgMood > best.avgMood ? current : best
            ).date)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mood Range</span>
          <span className="stat-value">
            {getMoodLabel(minMood)} - {getMoodLabel(maxMood)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tracking Days</span>
          <span className="stat-value">
            {chartData.length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Intensity</span>
          <span className="stat-value">
            {(chartData.reduce((sum, d) => sum + d.avgIntensity, 0) / chartData.length).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MoodChart; 