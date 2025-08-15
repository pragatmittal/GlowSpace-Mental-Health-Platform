/**
 * Data validation utilities for mood tracking components
 * Ensures consistent data formats and prevents NaN/undefined errors
 */

// Validate mood value (should be 1-5)
export const validateMoodValue = (mood) => {
  const numMood = Number(mood);
  if (isNaN(numMood) || !isFinite(numMood)) {
    return 3; // Default to neutral
  }
  return Math.max(1, Math.min(5, Math.round(numMood)));
};

// Validate intensity value (should be 1-10)
export const validateIntensityValue = (intensity) => {
  const numIntensity = Number(intensity);
  if (isNaN(numIntensity) || !isFinite(numIntensity)) {
    return 5; // Default intensity
  }
  return Math.max(1, Math.min(10, Math.round(numIntensity)));
};

// Validate date string
export const validateDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  return dateString;
};

// Validate and clean mood entry data
export const validateMoodEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  return {
    id: entry.id || entry._id || null,
    mood: validateMoodValue(entry.mood),
    intensity: validateIntensityValue(entry.intensity),
    notes: typeof entry.notes === 'string' ? entry.notes : '',
    activity: typeof entry.activity === 'string' ? entry.activity : 'other',
    timeOfDay: typeof entry.timeOfDay === 'string' ? entry.timeOfDay : 'afternoon',
    socialContext: typeof entry.socialContext === 'string' ? entry.socialContext : 'alone',
    createdAt: validateDate(entry.createdAt),
    updatedAt: validateDate(entry.updatedAt)
  };
};

// Validate and clean trend data for charts
export const validateTrendData = (trends) => {
  if (!Array.isArray(trends)) {
    return [];
  }

  return trends
    .map(trend => {
      if (!trend || typeof trend !== 'object') return null;
      
      return {
        date: validateDate(trend.date),
        avgMood: validateMoodValue(trend.avgMood),
        avgIntensity: validateIntensityValue(trend.avgIntensity),
        count: Math.max(0, Number(trend.count) || 0)
      };
    })
    .filter(trend => trend !== null);
};

// Validate analytics response structure
export const validateAnalyticsResponse = (response) => {
  if (!response || !response.data || !response.data.success) {
    return getEmptyAnalytics();
  }

  const data = response.data.data || {};

  return {
    trends: validateTrendData(data.trends),
    patterns: Array.isArray(data.patterns) ? data.patterns : [],
    streaks: validateStreaksData(data.streaks),
    summary: validateSummaryData(data.summary),
    insights: Array.isArray(data.insights) ? data.insights : []
  };
};

// Validate streaks data
export const validateStreaksData = (streaks) => {
  if (!streaks || typeof streaks !== 'object') {
    return {
      currentPositiveStreak: 0,
      maxPositiveStreak: 0,
      currentTrackingStreak: 0,
      maxTrackingStreak: 0
    };
  }

  return {
    currentPositiveStreak: Math.max(0, Number(streaks.currentPositiveStreak) || 0),
    maxPositiveStreak: Math.max(0, Number(streaks.maxPositiveStreak) || 0),
    currentTrackingStreak: Math.max(0, Number(streaks.currentTrackingStreak) || 0),
    maxTrackingStreak: Math.max(0, Number(streaks.maxTrackingStreak) || 0)
  };
};

// Validate summary data
export const validateSummaryData = (summary) => {
  if (!summary || typeof summary !== 'object') {
    return getEmptySummary();
  }

  return {
    totalEntries: Math.max(0, Number(summary.totalEntries) || 0),
    avgMood: validateMoodValue(summary.avgMood),
    avgIntensity: validateIntensityValue(summary.avgIntensity),
    moodCounts: validateMoodCounts(summary.moodCounts),
    activityCorrelation: validateCorrelationData(summary.activityCorrelation),
    timeCorrelation: validateCorrelationData(summary.timeCorrelation),
    socialCorrelation: validateCorrelationData(summary.socialCorrelation)
  };
};

// Validate mood counts
export const validateMoodCounts = (moodCounts) => {
  const defaultCounts = {
    very_sad: 0,
    sad: 0,
    neutral: 0,
    happy: 0,
    very_happy: 0
  };

  if (!moodCounts || typeof moodCounts !== 'object') {
    return defaultCounts;
  }

  Object.keys(defaultCounts).forEach(mood => {
    defaultCounts[mood] = Math.max(0, Number(moodCounts[mood]) || 0);
  });

  return defaultCounts;
};

// Validate correlation data
export const validateCorrelationData = (correlation) => {
  if (!correlation || typeof correlation !== 'object') {
    return {};
  }

  const validated = {};
  Object.keys(correlation).forEach(key => {
    const data = correlation[key];
    if (data && typeof data === 'object') {
      validated[key] = {
        total: Math.max(0, Number(data.total) || 0),
        sum: Number(data.sum) || 0,
        average: Number(data.average) || 0
      };
    }
  });

  return validated;
};

// Get empty analytics structure
export const getEmptyAnalytics = () => ({
  trends: [],
  patterns: [],
  streaks: validateStreaksData(null),
  summary: getEmptySummary(),
  insights: []
});

// Get empty summary structure
export const getEmptySummary = () => ({
  totalEntries: 0,
  avgMood: 3,
  avgIntensity: 5,
  moodCounts: validateMoodCounts(null),
  activityCorrelation: {},
  timeCorrelation: {},
  socialCorrelation: {}
});

// Check if coordinates are valid for SVG rendering
export const validateSVGCoordinates = (x, y) => {
  return (
    typeof x === 'number' && 
    typeof y === 'number' && 
    !isNaN(x) && 
    !isNaN(y) && 
    isFinite(x) && 
    isFinite(y)
  );
};

// Generate safe chart data points
export const generateSafeChartData = (data, chartWidth, chartHeight, padding) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const xStep = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1);
  const yMax = chartHeight - 2 * padding;

  return data.map((point, index) => {
    const moodValue = validateMoodValue(point?.mood);
    const x = padding + index * xStep;
    const y = padding + yMax - ((moodValue - 1) / 4) * yMax;

    return {
      ...point,
      mood: moodValue,
      x: validateSVGCoordinates(x, 0) ? x : padding,
      y: validateSVGCoordinates(0, y) ? y : padding + yMax / 2,
      isValid: validateSVGCoordinates(x, y)
    };
  }).filter(point => point.isValid);
};
