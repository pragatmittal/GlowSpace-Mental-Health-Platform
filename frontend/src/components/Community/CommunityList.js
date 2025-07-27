import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaUsers, FaComments, FaClock, FaTag } from 'react-icons/fa';
import { communityAPI } from '../../services/api';
import './CommunityList.css';

const CommunityList = ({ onCommunitySelect, onCreateCommunity }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadCommunities();
  }, [currentPage, selectedCategory, selectedType, sortBy, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await communityAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        sortBy,
        search: searchQuery || undefined
      };

      const response = await communityAPI.getCommunities(params);
      setCommunities(response.data.data.communities);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading communities:', error);
      setError('Failed to load communities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCommunities();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const lastActivity = new Date(date);
    const diffInHours = (now - lastActivity) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return lastActivity.toLocaleDateString();
    }
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

  if (loading && communities.length === 0) {
    return (
      <div className="community-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-list-container">
      {/* Header */}
      <div className="community-list-header">
        <div className="community-list-title">
          <h2>Discover Communities</h2>
          <p>Find and join communities that match your interests</p>
        </div>
        <button className="btn btn-primary" onClick={onCreateCommunity}>
          <FaUsers />
          Create Community
        </button>
      </div>

      {/* Search and Filters */}
      <div className="community-list-controls">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        <button
          className="btn btn-secondary filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryIcon(category.id)} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="moderated">Moderated</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="lastActivity">Last Activity</option>
              <option value="name">Name</option>
              <option value="members">Members</option>
              <option value="messages">Messages</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadCommunities}>
            Try Again
          </button>
        </div>
      )}

      {/* Communities Grid */}
      {!loading && communities.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">🏘️</div>
          <h3>No communities found</h3>
          <p>Try adjusting your search or filters to find more communities.</p>
          <button className="btn btn-primary" onClick={onCreateCommunity}>
            Create the first community
          </button>
        </div>
      )}

      <div className="communities-grid">
        {communities.map((community) => (
          <div
            key={community._id}
            className="community-card"
            onClick={() => onCommunitySelect(community)}
          >
            <div className="community-card-header">
              <div className="community-card-title">
                <h3>{community.name}</h3>
                <span className={`community-type ${community.type}`}>
                  {community.type}
                </span>
              </div>
              <div className="community-category">
                {getCategoryIcon(community.category)} {community.category}
              </div>
            </div>

            <div className="community-card-description">
              <p>{community.description}</p>
            </div>

            <div className="community-card-tags">
              {community.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">
                  <FaTag /> {tag}
                </span>
              ))}
              {community.tags.length > 3 && (
                <span className="tag-more">+{community.tags.length - 3} more</span>
              )}
            </div>

            <div className="community-card-stats">
              <div className="stat">
                <FaUsers />
                <span>{formatMemberCount(community.stats.totalMembers)} members</span>
              </div>
              <div className="stat">
                <FaComments />
                <span>{formatMemberCount(community.stats.totalMessages)} messages</span>
              </div>
              <div className="stat">
                <FaClock />
                <span>{formatLastActivity(community.stats.lastActivity)}</span>
              </div>
            </div>

            <div className="community-card-footer">
              <div className="community-creator">
                <img
                  src={community.createdBy.avatar || '/default-avatar.png'}
                  alt={community.createdBy.name}
                  className="creator-avatar"
                />
                <span>Created by {community.createdBy.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            className="btn btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityList; 