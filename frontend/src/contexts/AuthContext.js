import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode'; // Changed from { jwtDecode }
import api, { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Security: Obfuscate token storage
  const TOKEN_KEY = btoa('glow_access_token');
  const REFRESH_KEY = btoa('glow_refresh_token');

  // Get obfuscated token from localStorage
  const getStoredToken = () => {
    try {
      const obfuscatedToken = localStorage.getItem(TOKEN_KEY);
      return obfuscatedToken ? atob(obfuscatedToken) : null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  // Store obfuscated token in localStorage
  const storeToken = (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, btoa(token));
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  // Get obfuscated refresh token from localStorage
  const getStoredRefreshToken = () => {
    try {
      const obfuscatedToken = localStorage.getItem(REFRESH_KEY);
      return obfuscatedToken ? atob(obfuscatedToken) : null;
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  };

  // Store obfuscated refresh token in localStorage
  const storeRefreshToken = (token) => {
    try {
      if (token) {
        localStorage.setItem(REFRESH_KEY, btoa(token));
      } else {
        localStorage.removeItem(REFRESH_KEY);
      }
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      const data = response.data;
      
      if (data.success) {
        storeToken(data.accessToken);
        if (data.refreshToken) {
          storeRefreshToken(data.refreshToken);
        }
        return data.accessToken;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth state and redirect to login
      setIsAuthenticated(false);
      setUser(null);
      storeToken(null);
      storeRefreshToken(null);
      window.location.href = '/login';
      return null;
    }
  };

  // Get valid token (refresh if needed)
  const getValidToken = async () => {
    let token = getStoredToken();
    
    if (!token) {
      return null;
    }

    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
    }

    return token;
  };

  // API request with automatic token refresh
  const apiRequest = async (url, options = {}) => {
    const token = await getValidToken();
    
    if (!token) {
      throw new Error('No valid token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await authAPI({
      url,
      ...options,
      headers,
    });

    return response;
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const data = response.data;

      if (data.success) {
        storeToken(data.accessToken);
        storeRefreshToken(data.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          message: data.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your connection and try again.'
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const data = response.data;

      if (data.success) {
        if (data.accessToken) {
          storeToken(data.accessToken);
        }
        if (data.refreshToken) {
          storeRefreshToken(data.refreshToken);
        }
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      storeToken(null);
      storeRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Load user on app start
  const loadUser = async () => {
    try {
      const token = await getValidToken();
      
      if (token) {
        const response = await authAPI.getProfile();
        const data = response.data;

        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Load user error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const data = response.data;

      if (data.success) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profile update failed. Please try again.' };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      const data = response.data;

      if (data.success) {
        return { success: true, message: 'Password changed successfully' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Password change failed. Please try again.' };
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    apiRequest,
    getValidToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
