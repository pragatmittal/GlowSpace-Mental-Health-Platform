import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaTag, FaCog, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI } from '../../services/api';
import './CreateCommunity.css';

const CreateCommunity = ({ onCommunityCreated, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    type: 'public',
    tags: []
  });
  const [settings, setSettings] = useState({
    allowAnonymous: false,
    requireApproval: false,
    maxMembers: 1000,
    allowFileSharing: true,
    allowReactions: true,
    allowEditing: true,
    allowDeleting: true
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await communityAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.name.length < 3) {
      setError('Community name must be at least 3 characters long');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const communityData = {
        ...formData,
        settings
      };

      console.log('Sending community data:', communityData);

      const response = await communityAPI.createCommunity(communityData);
      console.log('Community creation response:', response);
      const newCommunity = response.data.data;
      console.log('New community object:', newCommunity);
      
      onCommunityCreated(newCommunity);
    } catch (error) {
      console.error('Error creating community:', error);
      setError(error.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
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

  const getTypeIcon = (type) => {
    const icons = {
      public: <FaEye />,
      private: <FaEyeSlash />,
      moderated: <FaShieldAlt />
    };
    return icons[type];
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      public: 'Anyone can join and view messages',
      private: 'Only invited members can join',
      moderated: 'Membership requires approval'
    };
    return descriptions[type];
  };

  return (
    <div className="create-community-container">
      <div className="create-community-header">
        <h2>Create New Community</h2>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-community-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Community Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter community name"
              maxLength={100}
              required
            />
            <small>3-100 characters, letters, numbers, spaces, hyphens, and underscores only</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your community"
              maxLength={500}
              rows={4}
              required
            />
            <small>{formData.description.length}/500 characters</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryIcon(category.id)} {category.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="general">🌐 General</option>
                    <option value="anxiety">😰 Anxiety</option>
                    <option value="depression">😔 Depression</option>
                    <option value="stress">😤 Stress</option>
                    <option value="relationships">💕 Relationships</option>
                    <option value="self-care">🧘 Self-Care</option>
                    <option value="therapy">🛋️ Therapy</option>
                    <option value="meditation">🧘‍♀️ Meditation</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="nutrition">🥗 Nutrition</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="moderated">Moderated</option>
              </select>
              <small>{getTypeDescription(formData.type)}</small>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3>Tags</h3>
          <p>Add tags to help people find your community (optional)</p>
          
          <div className="tags-input">
            <div className="tags-input-group">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || formData.tags.length >= 10}
                className="btn btn-secondary"
              >
                <FaTag />
                Add
              </button>
            </div>
            <small>Maximum 10 tags, 20 characters each</small>
          </div>

          {formData.tags.length > 0 && (
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  <FaTag />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag"
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="form-section">
          <h3>Community Settings</h3>
          
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="allowAnonymous"
                  checked={settings.allowAnonymous}
                  onChange={() => handleSettingChange('allowAnonymous')}
                />
                <label htmlFor="allowAnonymous">Allow Anonymous Posts</label>
              </div>
              <small>Members can post without revealing their identity</small>
            </div>

            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={settings.requireApproval}
                  onChange={() => handleSettingChange('requireApproval')}
                />
                <label htmlFor="requireApproval">Require Approval</label>
              </div>
              <small>New members must be approved by moderators</small>
            </div>

            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="allowFileSharing"
                  checked={settings.allowFileSharing}
                  onChange={() => handleSettingChange('allowFileSharing')}
                />
                <label htmlFor="allowFileSharing">Allow File Sharing</label>
              </div>
              <small>Members can share images and files</small>
            </div>

            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="allowReactions"
                  checked={settings.allowReactions}
                  onChange={() => handleSettingChange('allowReactions')}
                />
                <label htmlFor="allowReactions">Allow Reactions</label>
              </div>
              <small>Members can react to messages with emojis</small>
            </div>

            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="allowEditing"
                  checked={settings.allowEditing}
                  onChange={() => handleSettingChange('allowEditing')}
                />
                <label htmlFor="allowEditing">Allow Message Editing</label>
              </div>
              <small>Members can edit their own messages</small>
            </div>

            <div className="setting-item">
              <div className="setting-header">
                <input
                  type="checkbox"
                  id="allowDeleting"
                  checked={settings.allowDeleting}
                  onChange={() => handleSettingChange('allowDeleting')}
                />
                <label htmlFor="allowDeleting">Allow Message Deletion</label>
              </div>
              <small>Members can delete their own messages</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="maxMembers">Maximum Members</label>
            <input
              type="number"
              id="maxMembers"
              value={settings.maxMembers}
              onChange={(e) => setSettings(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
              min="10"
              max="10000"
              step="10"
            />
            <small>Maximum number of members allowed (10-10,000)</small>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Creating...
              </>
            ) : (
              <>
                <FaUsers />
                Create Community
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunity; 