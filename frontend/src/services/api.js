import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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
  schedule: (data) => api.post('/appointments', data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  getAvailableSlots: (doctorId) => api.get(`/appointments/slots/${doctorId}`)
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

export default api; 