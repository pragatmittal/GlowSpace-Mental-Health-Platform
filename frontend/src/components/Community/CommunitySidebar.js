import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaUsers, FaComments, FaClock, FaTag } from 'react-icons/fa';
import { communityAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './CommunitySidebar.css';

const CommunitySidebar = ({ onCommunitySelect, onCreateCommunity, refreshTrigger }) => {
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserCommunities();
    } else {
      setLoading(false);
      setError('User not authenticated');
    }
  }, [isAuthenticated, user]);

  // Reload communities when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated && user) {
      loadUserCommunities();
    }
  }, [refreshTrigger, isAuthenticated, user]);



  const loadUserCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      

      
      const TOKEN_KEY = btoa('glow_access_token');
      const REFRESH_KEY = btoa('glow_refresh_token');
      const accessToken = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await communityAPI.getUserCommunities();
      
      if (response.data && response.data.data) {
        setUserCommunities(response.data.data);
      } else {
        setUserCommunities([]);
      }
    } catch (error) {
      console.error('Error loading user communities:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Try to redirect to login
        window.location.href = '/login';
      } else if (error.message === 'No access token available') {
        setError('No access token available. Please log in again.');
        window.location.href = '/login';
      } else {
        setError('Failed to load your communities. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = userCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '🌐',
      anxiety: '😰',
      depression: '😔',
      stress: '😤',
      relationships: '💕',
      'self-care': '🧘',
      therapy: '🛋️',
      meditation: '🧘‍♀️',
      fitness: '💪',
      nutrition: '🥗'
    };
    return icons[category] || '🏷️';
  };

  const handleCommunityClick = (community) => {
    onCommunitySelect(community);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality can be implemented here
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="community-sidebar">
        <div className="sidebar-header">
          <h3>Communities</h3>
        </div>
        <div className="auth-error">
          <p>Please log in to view your communities</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="community-sidebar">
        <div className="sidebar-header">
          <h3>Communities</h3>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-sidebar">
        <div className="sidebar-header">
          <h3>Communities</h3>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={loadUserCommunities}
            >
              Retry
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-sidebar">
      <div className="sidebar-header">
        <h3>Communities</h3>
        <button 
          className="btn btn-primary btn-sm"
          onClick={onCreateCommunity}
        >
          <FaPlus />
          Create
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <form onSubmit={handleSearch}>
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search your communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      {/* Navigation Tabs */}
      <div className="sidebar-tabs">
        <button className="tab active">My Communities</button>
        <button className="tab">Discover</button>
      </div>

      {/* Communities List */}
      <div className="communities-list">
        {filteredCommunities.length === 0 ? (
          <div className="no-communities">
            <p>You haven't joined any communities yet.</p>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/community'}
            >
              Discover Communities
            </button>
          </div>
        ) : (
          filteredCommunities.map((community) => (
            <div
              key={community._id}
              className="community-item"
              onClick={() => handleCommunityClick(community)}
            >
              <div className="community-item-header">
                <div className="community-item-title">
                  <h4>{community.name}</h4>
                  <span className="community-type public">
                    Public
                  </span>
                </div>
                <div className="community-category">
                  {getCategoryIcon(community.category)} {community.category}
                </div>
              </div>

              <div className="community-item-description">
                <p>{community.description}</p>
              </div>

              <div className="community-item-tags">
                {community.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="tag">
                    <FaTag /> {tag}
                  </span>
                ))}
                {community.tags.length > 2 && (
                  <span className="tag-more">+{community.tags.length - 2} more</span>
                )}
              </div>

              <div className="community-item-stats">
                <div className="stat">
                  <FaUsers />
                  <span>{formatMemberCount(community.stats?.totalMembers || 0)} members</span>
                </div>
                <div className="stat">
                  <FaComments />
                  <span>{formatMemberCount(community.stats?.totalMessages || 0)} messages</span>
                </div>
                <div className="stat">
                  <FaClock />
                  <span>{community.stats?.lastActivity ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={loadUserCommunities}
          >
            Refresh Communities
          </button>

        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar; 