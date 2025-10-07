import axios from 'axios';
import requestManager from '../utils/requestManager';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Enhanced API wrapper with rate limiting and error handling
class ApiWrapper {
  constructor() {
    this.baseURL = API_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const TOKEN_KEY = btoa('glow_access_token');
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      return {
        ...this.defaultHeaders,
        Authorization: `Bearer ${atob(token)}`
      };
    }
    
    return this.defaultHeaders;
  }

  /**
   * Enhanced request method with rate limiting
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    // Create axios config
    const config = {
      method: method.toLowerCase(),
      url,
      headers,
      ...options
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    } else if (data && method === 'GET') {
      config.params = data;
    }

    try {
      // Use request manager for rate limiting and caching
      const response = await requestManager.executeRequest(config);
      return response;
    } catch (error) {
      // Handle specific error types
      if (error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Server is busy. Please try again in a few seconds.');
      }
      
      if (error.response?.status === 401) {
        // Handle unauthorized
        this.handleUnauthorized();
        throw new Error('Please log in again to continue.');
      }
      
      throw error;
    }
  }

  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    const TOKEN_KEY = btoa('glow_access_token');
    const REFRESH_KEY = btoa('glow_refresh_token');
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}, options = {}) {
    return this.request('GET', endpoint, params, options);
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  /**
   * Cancel all pending requests (useful for component cleanup)
   */
  cancelAllRequests() {
    requestManager.cancelAllRequests();
  }

  /**
   * Clear cache
   */
  clearCache() {
    requestManager.clearCache();
  }

  /**
   * Get request statistics
   */
  getStats() {
    return requestManager.getStats();
  }
}

// Create singleton instance
const apiWrapper = new ApiWrapper();

// Dashboard API with rate limiting
export const dashboardAPI = {
  getDashboardData: () => apiWrapper.get('/dashboard/data'),
  getUserProgress: () => apiWrapper.get('/dashboard/progress'),
  getEmotionTrends: () => apiWrapper.get('/dashboard/emotions/trends'),
  getActivitySummary: () => apiWrapper.get('/dashboard/activity/summary'),
  getGoalProgress: () => apiWrapper.get('/dashboard/goals/progress'),
  getRecentActivities: () => apiWrapper.get('/dashboard/activities/recent')
};

// Mood API with enhanced error handling
export const moodAPI = {
  createEntry: async (data) => {
    return apiWrapper.post('/mood/entries', data);
  },
  
  getEntries: async (params = {}) => {
    return apiWrapper.get('/mood/entries', params);
  },
  
  updateEntry: async (id, data) => {
    return apiWrapper.put(`/mood/entries/${id}`, data);
  },
  
  deleteEntry: async (id) => {
    return apiWrapper.delete(`/mood/entries/${id}`);
  },
  
  getDashboardData: async () => {
    return apiWrapper.get('/mood/dashboard');
  },
  
  getAnalytics: async (params = {}) => {
    return apiWrapper.get('/mood/analytics', params);
  },
  
  getPatterns: async (params = {}) => {
    return apiWrapper.get('/mood/patterns', params);
  },
  
  getStreaks: async () => {
    return apiWrapper.get('/mood/streaks');
  },
  
  getInsights: async (params = {}) => {
    return apiWrapper.get('/mood/insights', params);
  },
  
  getRecentMood: async () => {
    return apiWrapper.get('/mood/recent');
  },
  
  uploadVoice: async (formData) => {
    return apiWrapper.post('/mood/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadPhoto: async (formData) => {
    return apiWrapper.post('/mood/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  acknowledgeAlert: async (id) => {
    return apiWrapper.post(`/mood/alerts/${id}/acknowledge`);
  }
};

// Emotion API
export const emotionAPI = {
  analyzeEmotion: (data) => apiWrapper.post('/emotions/analyze', data),
  getEmotionHistory: () => apiWrapper.get('/emotions/history'),
  getEmotionTrends: () => apiWrapper.get('/emotions/trends'),
  getEmotionInsights: () => apiWrapper.get('/emotions/insights'),
  getEmotionDistribution: () => apiWrapper.get('/emotions/distribution'),
  getEmotionSession: (sessionId) => apiWrapper.get(`/emotions/session/${sessionId}`),
  updateEmotionContext: (id, data) => apiWrapper.put(`/emotions/${id}/context`, data),
  deleteEmotionData: (id) => apiWrapper.delete(`/emotions/${id}`)
};

// Appointment API
export const appointmentAPI = {
  getUpcoming: () => apiWrapper.get('/appointments/upcoming'),
  history: () => apiWrapper.get('/appointments/history'),
  details: (id) => apiWrapper.get(`/appointments/${id}`),
  schedule: (data) => apiWrapper.post('/appointments/schedule', data),
  reschedule: (id, data) => apiWrapper.put(`/appointments/${id}/reschedule`, data),
  cancel: (id) => apiWrapper.delete(`/appointments/${id}`),
  updateNotes: (id, data) => apiWrapper.put(`/appointments/${id}/notes`, data),
  getAvailableSlots: (date) => apiWrapper.get(`/appointments/slots`, { date })
};

// Auth API
export const authAPI = {
  login: (credentials) => apiWrapper.post('/auth/login', credentials),
  register: (userData) => apiWrapper.post('/auth/register', userData),
  logout: () => apiWrapper.post('/auth/logout'),
  getProfile: () => apiWrapper.get('/auth/me'),
  updateProfile: (data) => apiWrapper.put('/auth/profile', data),
  refreshToken: (refreshToken) => apiWrapper.post('/auth/refresh', { refreshToken }),
  changePassword: (data) => apiWrapper.put('/auth/change-password', data)
};

// Export the wrapper for advanced usage
export { apiWrapper };
export default apiWrapper;
