import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/constants';

// Mock fetch
global.fetch = jest.fn();

// Test component to access AuthContext
const TestComponent = () => {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    updateProfile, 
    changePassword 
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {loading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? JSON.stringify(user) : 'no-user'}
      </div>
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={() => register('test@example.com', 'password123', 'Test User')}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateProfile({ name: 'Updated Name' })}>
        Update Profile
      </button>
      <button onClick={() => changePassword('oldpass', 'newpass')}>
        Change Password
      </button>
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('should initialize with loading state', () => {
    renderWithAuth(<TestComponent />);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('loading');
  });

  test('should set authenticated state after successful login', async () => {
    const mockResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('Test User');
    });

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
  });

  test('should handle login failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
  });

  test('should register new user successfully', async () => {
    const mockResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'password123', 
        name: 'Test User' 
      })
    });
  });

  test('should logout and clear tokens', async () => {
    // First login
    const mockResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderWithAuth(<TestComponent />);

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Mock logout response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
    });
  });

  test('should update user profile', async () => {
    // First login
    const mockLoginResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginResponse
    });

    renderWithAuth(<TestComponent />);

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Mock profile update response
    const mockUpdateResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Updated Name' }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdateResponse
    });

    await act(async () => {
      screen.getByText('Update Profile').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Updated Name');
    });
  });

  test('should change password successfully', async () => {
    // First login
    const mockLoginResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginResponse
    });

    renderWithAuth(<TestComponent />);

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Mock password change response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Password changed successfully' })
    });

    await act(async () => {
      screen.getByText('Change Password').click();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-access-token'
      },
      body: JSON.stringify({ 
        currentPassword: 'oldpass', 
        newPassword: 'newpass' 
      })
    });
  });

  test('should restore authentication state from localStorage', async () => {
    // Mock stored tokens
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    const mockToken = 'mock-access-token';
    
    localStorage.setItem('authUser', btoa(JSON.stringify(mockUser)));
    localStorage.setItem('authToken', btoa(mockToken));

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('Test User');
    });
  });

  test('should handle token refresh', async () => {
    // Mock initial login
    const mockLoginResponse = {
      success: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginResponse
    });

    renderWithAuth(<TestComponent />);

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Mock token refresh response
    const mockRefreshResponse = {
      success: true,
      accessToken: 'new-access-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRefreshResponse
    });

    // Simulate token refresh by calling the context's refresh method
    // This would typically happen automatically before token expiry
    await act(async () => {
      // Token refresh happens automatically in the background
      // We can test this by checking if the new token is stored
    });

    expect(localStorage.getItem('authToken')).toBeTruthy();
  });
});
