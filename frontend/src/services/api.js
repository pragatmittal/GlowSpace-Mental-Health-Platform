import axios from 'axios';
import { handleApiError, validateMoodData } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
console.log('API URL being used:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper functions for token management
const getStoredToken = () => {
  try {
    const TOKEN_KEY = btoa('glow_access_token');
    const obfuscatedToken = localStorage.getItem(TOKEN_KEY);
    return obfuscatedToken ? atob(obfuscatedToken) : null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

const getStoredRefreshToken = () => {
  try {
    const REFRESH_KEY = btoa('glow_refresh_token');
    const obfuscatedToken = localStorage.getItem(REFRESH_KEY);
    return obfuscatedToken ? atob(obfuscatedToken) : null;
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

const storeToken = (token) => {
  try {
    const TOKEN_KEY = btoa('glow_access_token');
    if (token) {
      localStorage.setItem(TOKEN_KEY, btoa(token));
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

const storeRefreshToken = (token) => {
  try {
    const REFRESH_KEY = btoa('glow_refresh_token');
    if (token) {
      localStorage.setItem(REFRESH_KEY, btoa(token));
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

// Create a separate axios instance for token refresh to avoid circular dependency
const refreshApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  async (config) => {
    const token = getStoredToken();
    if (token) {
      console.log('Adding token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getStoredRefreshToken();
        if (!refreshToken) {
          console.error('No refresh token available');
          // Clear tokens and redirect to login
          storeToken(null);
          storeRefreshToken(null);
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('Attempting token refresh...');
        
        // Use the separate refresh API instance to avoid circular dependency
        const response = await refreshApi.post('/auth/refresh', {
          refreshToken: refreshToken
        });

        if (response.data.success) {
          console.log('Token refresh successful');
          storeToken(response.data.accessToken);
          if (response.data.refreshToken) {
            storeRefreshToken(response.data.refreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        storeToken(null);
        storeRefreshToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard/data'),
  getUserProgress: () => api.get('/dashboard/progress'),
  getEmotionTrends: () => api.get('/dashboard/emotions/trends'),
  getActivitySummary: () => api.get('/dashboard/activity/summary'),
  getGoalProgress: () => api.get('/dashboard/goals/progress'),
  getRecentActivities: () => api.get('/dashboard/activities/recent')
};

export const emotionAPI = {
  analyzeEmotion: (data) => api.post('/emotions/analyze', data),
  getEmotionHistory: () => api.get('/emotions/history'),
  getEmotionTrends: () => api.get('/emotions/trends'),
  getEmotionInsights: () => api.get('/emotions/insights'),
  getEmotionDistribution: () => api.get('/emotions/distribution'),
  getEmotionSession: (sessionId) => api.get(`/emotions/session/${sessionId}`),
  updateEmotionContext: (id, data) => api.put(`/emotions/${id}/context`, data),
  deleteEmotionData: (id) => api.delete(`/emotions/${id}`)
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const appointmentAPI = {
  getUpcoming: () => api.get('/appointments/upcoming'),
  history: () => api.get('/appointments/history'),
  details: (id) => api.get(`/appointments/${id}`),
  schedule: (data) => api.post('/appointments/schedule', data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
  updateNotes: (id, data) => api.put(`/appointments/${id}/notes`, data),
  getAvailableSlots: (date) => api.get(`/appointments/slots?date=${date}`)
};

export const moodAPI = {
  // Mood entry operations
  createEntry: async (data) => {
    try {
      // Validate data before sending
      validateMoodData(data);
      const response = await api.post('/mood/entry', data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getEntries: async (params) => {
    try {
      const response = await api.get('/mood/entries', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  updateEntry: async (id, data) => {
    try {
      // Validate data before sending
      validateMoodData(data);
      const response = await api.put(`/mood/entry/${id}`, data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  deleteEntry: async (id) => {
    try {
      const response = await api.delete(`/mood/entry/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Analytics and insights
  getDashboardData: async () => {
    try {
      const response = await api.get('/mood/dashboard');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getAnalytics: async (params) => {
    try {
      const response = await api.get('/mood/analytics', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getPatterns: async (params) => {
    try {
      const response = await api.get('/mood/patterns', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getStreaks: async () => {
    try {
      const response = await api.get('/mood/streaks');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getInsights: async (params) => {
    try {
      const response = await api.get('/mood/insights', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  getRecentMood: async () => {
    try {
      const response = await api.get('/mood/recent');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // File uploads
  uploadVoice: async (formData) => {
    try {
      const response = await api.post('/mood/upload/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  uploadPhoto: async (formData) => {
    try {
      const response = await api.post('/mood/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Alerts
  acknowledgeAlert: async (id) => {
    try {
      const response = await api.put(`/mood/alert/${id}/acknowledge`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export const communityAPI = {
  // Community management
  getCommunities: (params) => api.get('/community', { params }),
  getCommunity: (id) => api.get(`/community/${id}`),
  createCommunity: (data) => api.post('/community', data),
  updateCommunity: (id, data) => api.put(`/community/${id}`, data),
  deleteCommunity: (id) => api.delete(`/community/${id}`),
  joinCommunity: (id) => api.post(`/community/${id}/join`),
  leaveCommunity: (id) => api.post(`/community/${id}/leave`),
  getUserCommunities: () => api.get('/community/user/me'),
  searchCommunities: (query) => api.get('/community/search', { params: { q: query } }),
  getCategories: () => api.get('/community/categories'),

  // Community messages
  getMessages: (communityId, params) => api.get(`/community/${communityId}/messages`, { params }),
  sendMessage: (communityId, data) => api.post(`/community/${communityId}/messages`, data),
  editMessage: (messageId, data) => api.put(`/community/message/${messageId}`, data),
  deleteMessage: (messageId) => api.delete(`/community/message/${messageId}`),
  
  // Message interactions
  addReaction: (messageId, reaction) => api.post(`/community/message/${messageId}/reaction`, { reaction }),
  removeReaction: (messageId, reaction) => api.delete(`/community/message/${messageId}/reaction`, { data: { reaction } }),
  reportMessage: (messageId, data) => api.post(`/community/message/${messageId}/report`, data),
  moderateMessage: (messageId, data) => api.post(`/community/message/${messageId}/moderate`, data),
  togglePinMessage: (messageId) => api.post(`/community/message/${messageId}/pin`),
  voteInPoll: (messageId, optionIndex) => api.post(`/community/message/${messageId}/vote`, { optionIndex }),
  
  // Additional features
  getPinnedMessages: (communityId) => api.get(`/community/${communityId}/pinned`),
  getReportedMessages: (communityId, status) => api.get(`/community/${communityId}/reports`, { params: { status } }),
  searchMessages: (communityId, query) => api.get(`/community/${communityId}/search`, { params: { q: query } })
};

// Goal API
export const goalAPI = {
  // Get all goals
  getGoals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/goals?${queryString}` : '/goals';
    const response = await api.get(url);
    return response;
  },

  // Get single goal
  getGoal: async (id) => {
    const response = await api.get(`/goals/${id}`);
    return response;
  },

  // Create goal
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response;
  },

  // Update goal
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response;
  },

  // Update goal progress
  updateProgress: async (id, increment = 1) => {
    const response = await api.put(`/goals/${id}/progress`, { increment });
    return response;
  },

  // Delete goal
  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response;
  },

  // Get goal statistics
  getStats: async () => {
    const response = await api.get('/goals/stats');
    return response;
  },

  // Reset goal progress
  resetProgress: async (id) => {
    const response = await api.put(`/goals/${id}/reset`);
    return response;
  }
};

// Assessment API - Comprehensive Mental Health Assessment
export const assessmentAPI = {
  // Get assessment templates
  getTemplates: async () => {
    try {
      const response = await api.get('/assessments/templates');
      return response;
    } catch (error) {
      console.error('Error fetching assessment templates:', error);
      throw error;
    }
  },

  // Get specific assessment by type
  getByType: async (type, sections = null) => {
    try {
      const url = sections ? 
        `/assessments/templates/${type}?sections=${sections.join(',')}` : 
        `/assessments/templates/${type}`;
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching assessment template:', error);
      throw error;
    }
  },

  // Submit assessment
  submit: async (assessmentData) => {
    try {
      const response = await api.post('/assessments/submit', assessmentData);
      return response;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  },

  // Get assessment history
  getHistory: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/assessments/history?${queryString}` : '/assessments/history';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      throw error;
    }
  },

  // Get assessment results by ID
  getResults: async (id) => {
    try {
      const response = await api.get(`/assessments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      throw error;
    }
  },

  // Get analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/assessments/analytics');
      return response;
    } catch (error) {
      console.error('Error fetching assessment analytics:', error);
      throw error;
    }
  }
};

export { api };
export default api; 