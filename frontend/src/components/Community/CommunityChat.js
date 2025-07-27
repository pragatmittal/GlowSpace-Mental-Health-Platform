import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaSmile, FaSearch, FaEllipsisV, FaHeart, FaThumbsUp, FaLaugh, FaPin, FaFlag, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI } from '../../services/api';
import './CommunityChat.css';

const CommunityChat = ({ communityId, onBackToList }) => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [userRole, setUserRole] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const emojis = ['😊', '😢', '😂', '😍', '😮', '😡', '👍', '👎', '❤️', '🎉'];
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  useEffect(() => {
    loadCommunity();
    loadMessages();
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCommunity = async () => {
    try {
      console.log('Loading community with ID:', communityId);
      const response = await communityAPI.getCommunity(communityId);
      setCommunity(response.data.data.community);
      setUserRole(response.data.data.userRole);
    } catch (error) {
      console.error('Error loading community:', error);
      setError('Failed to load community');
    }
  };

  const loadMessages = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Loading messages for community ID:', communityId);
      const response = await communityAPI.getMessages(communityId, { page, limit: 50 });
      const newMessages = response.data.data.messages;
      
      if (page === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMoreMessages(response.data.data.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        messageType: 'text'
      };

      const response = await communityAPI.sendMessage(communityId, messageData);
      const newMessageObj = response.data.data;
      
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing event to server
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit stop typing event to server
    }, 1000);
  };

  const addReaction = async (messageId, reaction) => {
    try {
      await communityAPI.addReaction(messageId, reaction);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), { userId: user.id, reaction }] }
          : msg
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId, reaction) => {
    try {
      await communityAPI.removeReaction(messageId, reaction);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions: msg.reactions.filter(r => !(r.userId === user.id && r.reaction === reaction)) }
          : msg
      ));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      await communityAPI.editMessage(messageId, { content: newContent });
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, content: newContent, edited: { isEdited: true, editedAt: new Date() } }
          : msg
      ));
      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await communityAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setShowMessageActions(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  const reportMessage = async (messageId, reason, description) => {
    try {
      await communityAPI.reportMessage(messageId, { reason, description });
      setShowMessageActions(false);
      setSelectedMessage(null);
      // Show success message
    } catch (error) {
      console.error('Error reporting message:', error);
      setError('Failed to report message');
    }
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const joinCommunity = async () => {
    try {
      await communityAPI.joinCommunity(communityId);
      // Reload community to get updated user role
      await loadCommunity();
      // Reload messages
      await loadMessages();
    } catch (error) {
      console.error('Error joining community:', error);
      setError('Failed to join community');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const isOwnMessage = (message) => {
    return message.senderId._id === user.id;
  };

  const canEditMessage = (message) => {
    return isOwnMessage(message) && !message.edited?.isEdited;
  };

  const canDeleteMessage = (message) => {
    return isOwnMessage(message) || community?.userRole?.canModerate;
  };

  if (loading && !community) {
    return (
      <div className="community-chat-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if error is due to not being a member
    if (error.includes('Must be a member') && userRole?.canJoin) {
      return (
        <div className="community-chat-container">
          <div className="join-community-prompt">
            <h3>Join {community?.name}</h3>
            <p>You need to join this community to view messages.</p>
            <button className="btn btn-primary" onClick={joinCommunity}>
              Join Community
            </button>
            <button className="btn btn-secondary" onClick={onBackToList}>
              Back to Communities
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="community-chat-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="community-chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="btn btn-secondary" onClick={onBackToList}>
            <FaArrowLeft />
            Back
          </button>
          <div className="community-info">
            <h2>{community?.name}</h2>
            <p>{community?.description}</p>
          </div>
        </div>
        <div className="chat-header-right">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch />
          </button>
          <button className="btn btn-secondary">
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {loading && messages.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            {hasMoreMessages && (
              <button 
                className="btn btn-secondary load-more-btn"
                onClick={() => loadMessages(currentPage + 1)}
              >
                Load More Messages
              </button>
            )}

            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="message-group">
                <div className="date-divider">
                  <span>{date}</span>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${isOwnMessage(message) ? 'own-message' : ''}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMessage(message);
                      setShowMessageActions(true);
                    }}
                  >
                    <div className="message-avatar">
                      <img
                        src={message.senderId.avatar || '/default-avatar.png'}
                        alt={message.senderId.name}
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">{message.senderId.name}</span>
                        <span className="message-time">{formatTime(message.createdAt)}</span>
                        {message.edited?.isEdited && (
                          <span className="message-edited">(edited)</span>
                        )}
                      </div>
                      
                      {editingMessage === message._id ? (
                        <div className="message-edit-form">
                          <input
                            type="text"
                            defaultValue={message.content}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                editMessage(message._id, e.target.value);
                              }
                            }}
                            onBlur={() => setEditingMessage(null)}
                            autoFocus
                            className="edit-input"
                          />
                        </div>
                      ) : (
                        <div className="message-text">
                          {message.content}
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="message-reactions">
                          {Object.entries(
                            message.reactions.reduce((acc, r) => {
                              acc[r.reaction] = (acc[r.reaction] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([reaction, count]) => (
                            <button
                              key={reaction}
                              className={`reaction-btn ${message.reactions.some(r => r.userId === user.id && r.reaction === reaction) ? 'active' : ''}`}
                              onClick={() => {
                                const hasReacted = message.reactions.some(r => r.userId === user.id && r.reaction === reaction);
                                if (hasReacted) {
                                  removeReaction(message._id, reaction);
                                } else {
                                  addReaction(message._id, reaction);
                                }
                              }}
                            >
                              {reaction} {count}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      <div className="message-actions">
                        {reactions.map((reaction) => (
                          <button
                            key={reaction}
                            className="action-btn"
                            onClick={() => addReaction(message._id, reaction)}
                          >
                            {reaction}
                          </button>
                        ))}
                        
                        {canEditMessage(message) && (
                          <button
                            className="action-btn"
                            onClick={() => setEditingMessage(message._id)}
                          >
                            <FaEdit />
                          </button>
                        )}
                        
                        {canDeleteMessage(message) && (
                          <button
                            className="action-btn"
                            onClick={() => deleteMessage(message._id)}
                          >
                            <FaTrash />
                          </button>
                        )}
                        
                        {!isOwnMessage(message) && (
                          <button
                            className="action-btn"
                            onClick={() => reportMessage(message._id, 'inappropriate', '')}
                          >
                            <FaFlag />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={sendMessage} className="message-input-form">
          <div className="message-input-wrapper">
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaSmile />
            </button>
            
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="message-input"
            />
            
            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </form>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span>{typingUsers.join(', ')} is typing...</span>
        </div>
      )}
    </div>
  );
};

export default CommunityChat; 