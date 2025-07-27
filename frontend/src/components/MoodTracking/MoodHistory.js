import React, { useState, useEffect } from 'react';
import './MoodHistory.css';

const MoodHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    mood: '',
    timeRange: '30d',
    activity: '',
    socialContext: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock data for demonstration
  useEffect(() => {
    const mockEntries = [
      {
        _id: '1',
        mood: 'happy',
        intensity: 8,
        timeOfDay: 'morning',
        activity: 'exercise',
        socialContext: 'alone',
        notes: 'Great workout session! Feeling energized.',
        tags: ['exercise', 'energized'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        entryMethod: 'quick_button'
      },
      {
        _id: '2',
        mood: 'neutral',
        intensity: 5,
        timeOfDay: 'afternoon',
        activity: 'work',
        socialContext: 'at_work',
        notes: 'Productive day at work.',
        tags: ['work', 'productive'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        entryMethod: 'mood_wheel'
      },
      {
        _id: '3',
        mood: 'very_happy',
        intensity: 9,
        timeOfDay: 'evening',
        activity: 'social',
        socialContext: 'with_friends',
        notes: 'Amazing dinner with friends!',
        tags: ['social', 'friends'],
        createdAt: new Date(),
        entryMethod: 'voice'
      }
    ];
    
    setTimeout(() => {
      setEntries(mockEntries);
      setLoading(false);
    }, 1000);
  }, []);

  const moodLabels = {
    'very_happy': 'Very Happy',
    'happy': 'Happy',
    'neutral': 'Neutral',
    'sad': 'Sad',
    'very_sad': 'Very Sad'
  };

  const moodColors = {
    'very_happy': '#27ae60',
    'happy': '#2ecc71',
    'neutral': '#f1c40f',
    'sad': '#f39c12',
    'very_sad': '#e74c3c'
  };

  const activities = [
    'work', 'study', 'exercise', 'social', 'relaxation', 'creative',
    'outdoor', 'indoor', 'travel', 'family', 'friends', 'alone', 'therapy', 'other'
  ];

  const socialContexts = [
    'alone', 'with_friends', 'with_family', 'at_work', 'in_public',
    'at_home', 'online', 'offline', 'mixed'
  ];

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const entryMethods = {
    'quick_button': '⚡ Quick',
    'mood_wheel': '🎨 Wheel',
    'voice': '🎤 Voice',
    'photo': '📸 Photo',
    'manual': '✏️ Manual'
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m ago`;
  };

  const getFilteredEntries = () => {
    let filtered = entries;

    // Filter by mood
    if (filters.mood) {
      filtered = filtered.filter(entry => entry.mood === filters.mood);
    }

    // Filter by activity
    if (filters.activity) {
      filtered = filtered.filter(entry => entry.activity === filters.activity);
    }

    // Filter by social context
    if (filters.socialContext) {
      filtered = filtered.filter(entry => entry.socialContext === filters.socialContext);
    }

    // Filter by time range
    if (filters.timeRange !== 'all') {
      const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => entry.createdAt >= cutoffDate);
    }

    // Search by notes or tags
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.notes.toLowerCase().includes(term) ||
        entry.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'mood':
          const moodOrder = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'];
          comparison = moodOrder.indexOf(a.mood) - moodOrder.indexOf(b.mood);
          break;
        case 'intensity':
          comparison = a.intensity - b.intensity;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this mood entry?')) {
      setEntries(prev => prev.filter(entry => entry._id !== entryId));
    }
  };

  const handleEditEntry = (entry) => {
    // Here you would typically open an edit modal or navigate to edit page
    console.log('Edit entry:', entry);
  };

  const filteredEntries = getFilteredEntries();

  if (loading) {
    return (
      <div className="mood-history">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading mood history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-history">
      <div className="history-header">
        <h2>Mood History</h2>
        <p>Review and manage your mood entries</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search notes or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Mood</label>
            <select
              value={filters.mood}
              onChange={(e) => setFilters(prev => ({ ...prev, mood: e.target.value }))}
            >
              <option value="">All moods</option>
              {Object.entries(moodLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Activity</label>
            <select
              value={filters.activity}
              onChange={(e) => setFilters(prev => ({ ...prev, activity: e.target.value }))}
            >
              <option value="">All activities</option>
              {activities.map(activity => (
                <option key={activity} value={activity}>
                  {activity.charAt(0).toUpperCase() + activity.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Social Context</label>
            <select
              value={filters.socialContext}
              onChange={(e) => setFilters(prev => ({ ...prev, socialContext: e.target.value }))}
            >
              <option value="">All contexts</option>
              {socialContexts.map(context => (
                <option key={context} value={context}>
                  {context.replace('_', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sort-controls">
          <div className="sort-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="mood">Mood</option>
              <option value="intensity">Intensity</option>
            </select>
          </div>

          <div className="sort-group">
            <label>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="entries-section">
        <div className="entries-header">
          <h3>Entries ({filteredEntries.length})</h3>
          <div className="entries-stats">
            <span>Total: {entries.length}</span>
            <span>Filtered: {filteredEntries.length}</span>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="no-entries">
            <div className="no-entries-icon">📝</div>
            <h4>No entries found</h4>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="entries-list">
            {filteredEntries.map(entry => (
              <div key={entry._id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-mood">
                    <div 
                      className="mood-indicator"
                      style={{ backgroundColor: moodColors[entry.mood] }}
                    >
                      {moodLabels[entry.mood]}
                    </div>
                    <div className="entry-method">
                      {entryMethods[entry.entryMethod]}
                    </div>
                  </div>
                  
                  <div className="entry-meta">
                    <div className="entry-date">
                      {formatDate(entry.createdAt)}
                    </div>
                    <div className="entry-time-ago">
                      {formatTimeAgo(entry.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="entry-content">
                  <div className="entry-details">
                    <div className="detail-item">
                      <span className="detail-label">Intensity:</span>
                      <span className="detail-value">{entry.intensity}/10</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Activity:</span>
                      <span className="detail-value">
                        {entry.activity.charAt(0).toUpperCase() + entry.activity.slice(1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Context:</span>
                      <span className="detail-value">
                        {entry.socialContext.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="entry-notes">
                      <p>{entry.notes}</p>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="entry-tags">
                      {entry.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="entry-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditEntry(entry)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteEntry(entry._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodHistory; 