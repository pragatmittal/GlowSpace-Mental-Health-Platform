import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CommunityList from '../components/Community/CommunityList';
import CommunityChat from '../components/Community/CommunityChat';
import CreateCommunity from '../components/Community/CreateCommunity';
import CommunitySidebar from '../components/Community/CommunitySidebar';
import './Community.css';

const Community = () => {
  const { user } = useAuth();
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'chat', 'create'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set initial view based on URL params or default to list
    const urlParams = new URLSearchParams(window.location.search);
    const communityId = urlParams.get('community');
    if (communityId) {
      setSelectedCommunity(communityId);
      setView('chat');
    }
  }, []);

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community._id);
    setView('chat');
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('community', community._id);
    window.history.pushState({}, '', url);
  };

  const handleBackToList = () => {
    setSelectedCommunity(null);
    setView('list');
    // Remove community from URL
    const url = new URL(window.location);
    url.searchParams.delete('community');
    window.history.pushState({}, '', url);
  };

  const handleCreateCommunity = () => {
    setShowCreateModal(true);
    setView('create');
  };

  const handleCommunityCreated = (newCommunity) => {
    console.log('Community created, selecting:', newCommunity);
    setShowCreateModal(false);
    setView('list');
    // Optionally select the newly created community
    handleCommunitySelect(newCommunity);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setView('list');
  };

  if (!user) {
    return (
      <div className="community-container">
        <div className="community-error">
          <h2>Access Denied</h2>
          <p>Please log in to access the community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <div className="community-header-content">
          <h1>Support Community</h1>
          <p>Connect with others, share experiences, and find support in our mental health community</p>
        </div>
        <div className="community-header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateCommunity}
          >
            Create Community
          </button>
        </div>
      </div>

      <div className="community-content">
        <CommunitySidebar 
          selectedCommunity={selectedCommunity}
          onCommunitySelect={handleCommunitySelect}
          onCreateCommunity={handleCreateCommunity}
        />

        <div className="community-main">
          {view === 'list' && (
            <CommunityList 
              onCommunitySelect={handleCommunitySelect}
              onCreateCommunity={handleCreateCommunity}
            />
          )}

          {view === 'chat' && selectedCommunity && (
            <CommunityChat 
              communityId={selectedCommunity}
              onBackToList={handleBackToList}
            />
          )}

          {view === 'create' && (
            <CreateCommunity 
              onCommunityCreated={handleCommunityCreated}
              onClose={handleCloseCreateModal}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="community-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Community; 