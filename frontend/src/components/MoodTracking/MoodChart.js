import React, { useMemo, useState } from 'react';
import './MoodChart.css';

const MoodChart = ({ data, timeRange }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const chartData = useMemo(() => {
    console.log('🔍 MoodTracking/MoodChart received data:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('⚠️ MoodTracking/MoodChart: No valid data provided');
      return [];
    }

    const processedData = data.filter(item => item && (item._id || item.date || item.createdAt)).map((item, index) => {
      // Handle different data structures
      let dateValue;
      
      if (item._id && typeof item._id === 'object' && item._id.date) {
        dateValue = item._id.date;
      } else if (item._id && typeof item._id === 'string') {
        dateValue = item._id;
      } else if (item.date) {
        dateValue = item.date;
      } else if (item.createdAt) {
        dateValue = new Date(item.createdAt).toISOString().split('T')[0];
      } else {
        console.warn('⚠️ Could not extract date from item:', item);
        dateValue = new Date().toISOString().split('T')[0];
      }
      
      console.log(`📊 Processing item ${index}:`, {
        original: item,
        extractedDate: dateValue,
        avgMood: item.avgMood,
        avgIntensity: item.avgIntensity
      });
      
      return {
        date: dateValue,
        avgMood: item.avgMood || 0,
        avgIntensity: item.avgIntensity || 0,
        totalEntries: item.totalEntries || 0
      };
    });
    
    console.log('✅ MoodTracking/MoodChart processed data:', processedData);
    return processedData;
  }, [data, timeRange]);

  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
  const moodColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
  const moodEmojis = ['😢', '😔', '😐', '😊', '😄'];

  const getMoodLabel = (value) => {
    const index = Math.round(value);
    return moodLabels[Math.max(0, Math.min(index, moodLabels.length - 1))];
  };

  const getMoodColor = (value) => {
    const index = Math.round(value);
    return moodColors[Math.max(0, Math.min(index, moodColors.length - 1))];
  };

  const getMoodEmoji = (value) => {
    const index = Math.round(value);
    return moodEmojis[Math.max(0, Math.min(index, moodEmojis.length - 1))];
  };

  // Handle empty data case
  if (!chartData || chartData.length === 0) {
    return (
      <div className="mood-chart">
        <div className="chart-header">
          <h3>Mood Trends</h3>
          <p>Track your daily moods to see patterns and trends</p>
        </div>
        <div className="chart-container">
          <div className="no-data-message">
            <div className="no-data-icon">📊</div>
            <h4>No mood data available yet</h4>
            <p>Start tracking your mood to see beautiful trends and insights here</p>
            <div className="no-data-features">
              <div className="feature">
                <span className="feature-icon">📈</span>
                <span>Visual mood trends</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>Pattern recognition</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💡</span>
                <span>Personalized insights</span>
              </div>
            </div>
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

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getYPosition = (value) => {
    if (range === 0) return 50;
    const normalizedValue = (value - minMood) / range;
    return 100 - (normalizedValue * 80);
  };

  const getXPosition = (index) => {
    if (chartData.length <= 1) return 50;
    
    // Calculate proper spacing to prevent overlapping
    const totalWidth = 80; // 80% of chart width
    const padding = 10; // 10% padding on each side
    
    if (chartData.length === 2) {
      // For 2 points, place them at 25% and 75% of the chart
      return index === 0 ? 25 : 75;
    } else if (chartData.length === 3) {
      // For 3 points, place them at 20%, 50%, and 80%
      return index === 0 ? 20 : index === 1 ? 50 : 80;
    } else {
      // For more points, distribute evenly
      const spacing = totalWidth / (chartData.length - 1);
      return padding + (index * spacing);
    }
  };

  const averageMood = chartData.reduce((sum, d) => sum + d.avgMood, 0) / chartData.length;
  const totalEntries = chartData.reduce((sum, d) => sum + d.totalEntries, 0);
  const bestDay = chartData.reduce((best, current) => 
    current.avgMood > best.avgMood ? current : best
  );
  const worstDay = chartData.reduce((worst, current) => 
    current.avgMood < worst.avgMood ? current : worst
  );

  return (
    <div className="mood-chart">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="header-content">
          <h3>Mood Trends</h3>
          <p>Your emotional journey over time</p>
        </div>
        <div className="time-range-indicator">
          <span className="time-badge">{timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        {/* Y-axis with mood levels */}
        <div className="y-axis">
          <div className="y-axis-title">Mood Level</div>
          {moodLabels.map((label, index) => (
            <div 
              key={index}
              className="y-label"
              style={{ 
                top: `${getYPosition(index)}%`,
                color: moodColors[index]
              }}
            >
              <span className="mood-emoji">{moodEmojis[index]}</span>
              <span className="mood-text">{label}</span>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="chart-area">
          {/* Grid lines with mood zones */}
          <div className="grid-lines">
            {moodLabels.map((_, index) => (
              <div 
                key={index}
                className="grid-line"
                style={{ 
                  top: `${getYPosition(index)}%`,
                  backgroundColor: moodColors[index],
                  opacity: 0.1
                }}
              ></div>
            ))}
          </div>

          {/* Mood zone backgrounds */}
          <div className="mood-zones">
            {moodLabels.map((_, index) => (
              <div 
                key={index}
                className="mood-zone"
                style={{ 
                  top: `${getYPosition(index + 0.5)}%`,
                  height: `${80 / moodLabels.length}%`,
                  backgroundColor: moodColors[index],
                  opacity: 0.05
                }}
              ></div>
            ))}
          </div>

          {/* SVG Chart */}
          <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#764ba2" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
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
              strokeWidth="3"
              fill="none"
              className="data-line"
              filter="url(#glow)"
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = getXPosition(index);
              const y = getYPosition(point.avgMood);
              const isHovered = hoveredPoint === index;
              const isSelected = selectedPoint === index;
              
              return (
                <g key={index}>
                  {/* Hover circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "8" : "6"}
                    fill="transparent"
                    stroke={getMoodColor(point.avgMood)}
                    strokeWidth={isHovered ? "3" : "2"}
                    className="hover-circle"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Data point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "4" : "3"}
                    fill={getMoodColor(point.avgMood)}
                    stroke="white"
                    strokeWidth="2"
                    className="data-point"
                    style={{ 
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredPoint !== null && (
            <div 
              className="chart-tooltip"
              style={{
                left: `${getXPosition(hoveredPoint)}%`,
                top: `${getYPosition(chartData[hoveredPoint].avgMood) - 10}%`
              }}
            >
              <div className="tooltip-header">
                <span className="tooltip-date">{formatFullDate(chartData[hoveredPoint].date)}</span>
                <span className="tooltip-mood">{getMoodEmoji(chartData[hoveredPoint].avgMood)} {getMoodLabel(chartData[hoveredPoint].avgMood)}</span>
              </div>
              <div className="tooltip-details">
                <div className="tooltip-item">
                  <span className="tooltip-label">Entries:</span>
                  <span className="tooltip-value">{chartData[hoveredPoint].totalEntries}</span>
                </div>
                <div className="tooltip-item">
                  <span className="tooltip-label">Intensity:</span>
                  <span className="tooltip-value">{chartData[hoveredPoint].avgIntensity.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="x-axis">
          <div className="x-axis-title">Date</div>
          {chartData.map((point, index) => {
            // Improved logic for showing labels to prevent overlap
            let shouldShow = true;
            
            if (timeRange === '7d') {
              // Show all labels for 7 days
              shouldShow = true;
            } else if (timeRange === '30d') {
              // Show every 3rd label for 30 days, but ensure first and last are shown
              shouldShow = index % 3 === 0 || index === 0 || index === chartData.length - 1;
            } else if (timeRange === '90d') {
              // Show every 7th label for 90 days, but ensure first and last are shown
              shouldShow = index % 7 === 0 || index === 0 || index === chartData.length - 1;
            }
            
            // Additional check: don't show labels if they would be too close together
            if (chartData.length <= 3) {
              shouldShow = true; // Always show for 3 or fewer points
            } else if (chartData.length <= 7) {
              shouldShow = index % 2 === 0 || index === 0 || index === chartData.length - 1;
            }
            
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

      {/* Chart Summary */}
      <div className="chart-summary">
        <div className="summary-header">
          <h4>Chart Summary</h4>
          <p>Key insights from your mood data</p>
        </div>
        
        <div className="summary-grid">
          <div className="summary-card primary">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h5>Average Mood</h5>
              <div className="summary-value">
                <span className="mood-emoji-large">{getMoodEmoji(averageMood)}</span>
                <span className="mood-text-large">{getMoodLabel(averageMood)}</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📝</div>
            <div className="summary-content">
              <h5>Total Entries</h5>
              <div className="summary-value">{totalEntries}</div>
            </div>
          </div>

          <div className="summary-card positive">
            <div className="summary-icon">⭐</div>
            <div className="summary-content">
              <h5>Best Day</h5>
              <div className="summary-value">
                <span className="mood-emoji-small">{getMoodEmoji(bestDay.avgMood)}</span>
                <span>{formatDate(bestDay.date)}</span>
              </div>
            </div>
          </div>

          <div className="summary-card negative">
            <div className="summary-icon">📉</div>
            <div className="summary-content">
              <h5>Challenging Day</h5>
              <div className="summary-value">
                <span className="mood-emoji-small">{getMoodEmoji(worstDay.avgMood)}</span>
                <span>{formatDate(worstDay.date)}</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h5>Tracking Days</h5>
              <div className="summary-value">{chartData.length}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <h5>Avg Intensity</h5>
              <div className="summary-value">{(chartData.reduce((sum, d) => sum + d.avgIntensity, 0) / chartData.length).toFixed(1)}/10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="chart-legend">
        <div className="legend-header">
          <h4>Mood Scale</h4>
          <p>Understanding your mood levels</p>
        </div>
        <div className="legend-items">
          {moodLabels.map((label, index) => (
            <div key={index} className="legend-item">
              <div className="legend-color-section">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: moodColors[index] }}
                ></div>
                <span className="legend-emoji">{moodEmojis[index]}</span>
              </div>
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodChart; 