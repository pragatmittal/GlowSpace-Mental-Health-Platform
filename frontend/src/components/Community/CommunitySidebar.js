import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaHome, FaSearch, FaBookmark, FaCog } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI } from '../../services/api';
import './CommunitySidebar.css';

const CommunitySidebar = ({ selectedCommunity, onCommunitySelect, onCreateCommunity }) => {
  const { user } = useAuth();
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-communities');

  useEffect(() => {
    loadUserCommunities();
  }, []);

  const loadUserCommunities = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getUserCommunities();
      setUserCommunities(response.data.data);
    } catch (error) {
      console.error('Error loading user communities:', error);
      setError('Failed to load your communities');
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
        <button
          className={`tab-btn ${activeTab === 'my-communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-communities')}
        >
          <FaUsers />
          My Communities
        </button>
        <button
          className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <FaSearch />
          Discover
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          <FaBookmark />
          Bookmarks
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeTab === 'my-communities' && (
          <div className="communities-list">
            {error ? (
              <div className="error-message">
                <p>{error}</p>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={loadUserCommunities}
                >
                  Try Again
                </button>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏘️</div>
                <h4>No communities yet</h4>
                <p>Join or create your first community to get started</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={onCreateCommunity}
                >
                  <FaPlus />
                  Create Community
                </button>
              </div>
            ) : (
              filteredCommunities.map((community) => (
                <div
                  key={community._id}
                  className={`community-item ${selectedCommunity === community._id ? 'active' : ''}`}
                  onClick={() => handleCommunityClick(community)}
                >
                  <div className="community-item-header">
                    <div className="community-item-icon">
                      {getCategoryIcon(community.category)}
                    </div>
                    <div className="community-item-info">
                      <h4>{community.name}</h4>
                      <p>{community.description}</p>
                    </div>
                  </div>
                  <div className="community-item-stats">
                    <span className="member-count">
                      <FaUsers />
                      {formatMemberCount(community.stats.totalMembers)}
                    </span>
                    <span className={`community-type ${community.type}`}>
                      {community.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="discover-section">
            <div className="discover-header">
              <h4>Discover Communities</h4>
              <p>Find new communities to join</p>
            </div>
            <div className="discover-categories">
              <button className="category-btn">
                🌐 General
              </button>
              <button className="category-btn">
                😰 Anxiety
              </button>
              <button className="category-btn">
                😔 Depression
              </button>
              <button className="category-btn">
                😤 Stress
              </button>
              <button className="category-btn">
                💕 Relationships
              </button>
              <button className="category-btn">
                🧘 Self-Care
              </button>
              <button className="category-btn">
                🛋️ Therapy
              </button>
              <button className="category-btn">
                🧘‍♀️ Meditation
              </button>
              <button className="category-btn">
                💪 Fitness
              </button>
              <button className="category-btn">
                🥗 Nutrition
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="bookmarks-section">
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <h4>No bookmarks yet</h4>
              <p>Bookmark communities you want to revisit later</p>
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="sidebar-footer">
        <div className="user-info">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.name}
            className="user-avatar"
          />
          <div className="user-details">
            <h4>{user?.name}</h4>
            <p>{userCommunities.length} communities</p>
          </div>
        </div>
        <button className="settings-btn">
          <FaCog />
        </button>
      </div>
    </div>
  );
};

export default CommunitySidebar; 