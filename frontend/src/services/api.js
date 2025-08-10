import axios from 'axios';
import { handleApiError, validateMoodData } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log('API URL being used:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const TOKEN_KEY = btoa('glow_access_token');
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log('Adding token to request:', config.url);
      config.headers.Authorization = `Bearer ${atob(token)}`;
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
      const TOKEN_KEY = btoa('glow_access_token');
      const REFRESH_KEY = btoa('glow_refresh_token');
      
      try {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', {
          refreshToken: atob(refreshToken)
        });

        if (response.data.success) {
          localStorage.setItem(TOKEN_KEY, btoa(response.data.accessToken));
          if (response.data.refreshToken) {
            localStorage.setItem(REFRESH_KEY, btoa(response.data.refreshToken));
          }
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
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

// Assessment API
export const assessmentAPI = {
  // Get assessment templates
  getTemplates: async () => {
    const response = await api.get('/assessments/templates');
    return response;
  },

  // Get specific assessment by type
  getByType: async (type) => {
    const response = await api.get(`/assessments/templates/${type}`);
    return response;
  },

  // Submit assessment
  submit: async (assessmentData) => {
    const response = await api.post('/assessments/submit', assessmentData);
    return response;
  },

  // Get assessment history
  getHistory: async (params = {}) => {
    const response = await api.get('/assessments/history', { params });
    return response;
  },

  // Get assessment results by ID
  getResults: async (id) => {
    const response = await api.get(`/assessments/${id}`);
    return response;
  },

  // Get analytics
  getAnalytics: async () => {
    const response = await api.get('/assessments/analytics');
    return response;
  }
};

export { api };
export default api; 