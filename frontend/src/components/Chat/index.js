import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPaperPlane, FaSmile, FaSearch, FaEllipsisV, FaHeart, FaThumbsUp, FaLaugh } from 'react-icons/fa';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = ({ roomId = 'general' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showActions, setShowActions] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const emojis = ['😊', '😢', '😂', '😍', '😮', '😡', '👍', '👎', '❤️', '🎉'];
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        newSocket.emit('join_room', roomId);
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      newSocket.on('message_reaction', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        ));
      });

      newSocket.on('user_typing', (data) => {
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      });

      newSocket.on('user_stop_typing', (data) => {
        setTypingUsers(prev => prev.filter(user => user !== data.username));
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, roomId]);

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
    getUnreadCount();
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when room changes
  useEffect(() => {
    if (user && roomId) {
      markMessagesAsRead();
    }
  }, [roomId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/chat/room/${roomId}`);
      setMessages(response.data.data.messages);
      setError(null);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnreadCount = async () => {
    try {
      const response = await axios.get(`/api/chat/unread/${roomId}`);
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.put(`/api/chat/room/${roomId}/read`);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        roomId,
        messageType: 'text'
      };

      const response = await axios.post('/api/chat/send', messageData);
      
      // Emit to socket for real-time update
      if (socket) {
        socket.emit('send_message', response.data.data);
      }

      setNewMessage('');
      setShowEmojiPicker(false);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId, username: user.name });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('stop_typing', { roomId, username: user.name });
      }
      setIsTyping(false);
    }, 1000);
  };

  const addReaction = async (messageId, reaction) => {
    try {
      const response = await axios.post(`/api/chat/message/${messageId}/reaction`, {
        reaction
      });

      // Emit to socket for real-time update
      if (socket) {
        socket.emit('reaction_added', {
          messageId,
          reactions: response.data.data,
          roomId
        });
      }

      setSelectedMessage(null);
      setShowActions(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId) => {
    try {
      const response = await axios.delete(`/api/chat/message/${messageId}/reaction`);
      
      // Emit to socket for real-time update
      if (socket) {
        socket.emit('reaction_removed', {
          messageId,
          reactions: response.data.data,
          roomId
        });
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      await axios.put(`/api/chat/message/${messageId}`, {
        content: newContent
      });
      
      // Reload messages to show updated content
      loadMessages();
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    // Replace window.confirm with a custom confirmation
    const userConfirmed = window.confirm('Delete this message?'); // We'll fix this ESLint warning later
    if (userConfirmed) {
      try {
        await axios.delete(`/api/chat/message/${messageId}`);
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
    setShowActions(false);
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Please login to access chat</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Mental Health Support Chat</h2>
            <p className="text-sm opacity-90">
              {onlineUsers.length} online • {roomId} room
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-full text-sm placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: '400px' }}>
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage(message)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onDoubleClick={() => {
                    setSelectedMessage(message);
                    setShowActions(true);
                  }}
                >
                  {!isOwnMessage(message) && (
                    <div className="text-xs font-semibold mb-1">
                      {message.senderId.name}
                    </div>
                  )}
                  
                  <div className="text-sm">{message.content}</div>
                  
                  {message.edited?.isEdited && (
                    <div className="text-xs opacity-75 mt-1">(edited)</div>
                  )}
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs opacity-75">
                      {formatTime(message.createdAt)}
                    </div>
                    
                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex space-x-1 ml-2">
                        {Object.entries(message.reactionSummary || {}).map(([emoji, count]) => (
                          <span
                            key={emoji}
                            className="text-xs bg-white/20 px-1 rounded cursor-pointer"
                            onClick={() => removeReaction(message._id)}
                          >
                            {emoji} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Actions Modal */}
      {showActions && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Message Actions</h3>
            
            <div className="space-y-2">
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600">Add Reaction:</span>
                <div className="flex space-x-1">
                  {reactions.map(reaction => (
                    <button
                      key={reaction}
                      onClick={() => addReaction(selectedMessage._id, reaction)}
                      className="text-lg hover:scale-110 transition-transform"
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              </div>
              
              {isOwnMessage(selectedMessage) && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newContent = prompt('Edit message:', selectedMessage.content);
                      if (newContent) {
                        editMessage(selectedMessage._id, newContent);
                      }
                      setShowActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    Edit Message
                  </button>
                  <button
                    onClick={() => {
                      deleteMessage(selectedMessage._id);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete Message
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowActions(false)}
              className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={1000}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              <FaSmile />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </form>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 bg-white border rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-sm text-yellow-800">
        <p>
          <strong>Note:</strong> This is a public support chat. Please don't share personal information. 
          For private counseling, <a href="/counseling" className="underline">book an appointment</a>.
        </p>
      </div>
    </div>
  );
};

export default Chat;
