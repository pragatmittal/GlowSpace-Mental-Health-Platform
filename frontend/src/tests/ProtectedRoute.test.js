import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the AuthContext
const MockAuthProvider = ({ children, authState }) => {
  const value = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    apiRequest: jest.fn(),
    getValidToken: jest.fn()
  };

  return (
    <AuthProvider value={value}>
      {children}
    </AuthProvider>
  );
};

// Test component to render inside ProtectedRoute
const TestComponent = ({ message = 'Protected content' }) => (
  <div data-testid="protected-content">{message}</div>
);

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('should show loading spinner when loading', () => {
    render(
      <BrowserRouter>
        <MockAuthProvider authState={{ loading: true, isAuthenticated: false, user: null }}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MockAuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should render protected content when authenticated', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'user' };
    
    render(
      <BrowserRouter>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MockAuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });
  });

  test('should redirect to login when not authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: false, user: null }}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MockAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should render content when user has required role', async () => {
    const mockUser = { id: 1, email: 'admin@example.com', name: 'Admin User', role: 'admin' };
    
    render(
      <BrowserRouter>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute requiredRole="admin">
            <TestComponent message="Admin content" />
          </ProtectedRoute>
        </MockAuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Admin content')).toBeInTheDocument();
    });
  });

  test('should redirect to login when user lacks required role', async () => {
    const mockUser = { id: 1, email: 'user@example.com', name: 'Regular User', role: 'user' };
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute requiredRole="admin">
            <TestComponent message="Admin content" />
          </ProtectedRoute>
        </MockAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should render content when no role is required', async () => {
    const mockUser = { id: 1, email: 'user@example.com', name: 'Regular User', role: 'user' };
    
    render(
      <BrowserRouter>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute>
            <TestComponent message="Any user content" />
          </ProtectedRoute>
        </MockAuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Any user content')).toBeInTheDocument();
    });
  });

  test('should handle user without role property', async () => {
    const mockUser = { id: 1, email: 'user@example.com', name: 'Regular User' }; // No role property
    
    render(
      <BrowserRouter>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute>
            <TestComponent message="Content for user without role" />
          </ProtectedRoute>
        </MockAuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Content for user without role')).toBeInTheDocument();
    });
  });

  test('should redirect when user without role tries to access admin content', async () => {
    const mockUser = { id: 1, email: 'user@example.com', name: 'Regular User' }; // No role property
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute requiredRole="admin">
            <TestComponent message="Admin content" />
          </ProtectedRoute>
        </MockAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should handle multiple roles', async () => {
    const mockUser = { id: 1, email: 'counselor@example.com', name: 'Counselor', role: 'counselor' };
    
    render(
      <BrowserRouter>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: true, user: mockUser }}>
          <ProtectedRoute requiredRole="counselor">
            <TestComponent message="Counselor content" />
          </ProtectedRoute>
        </MockAuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Counselor content')).toBeInTheDocument();
    });
  });

  test('should not render when user is null', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MockAuthProvider authState={{ loading: false, isAuthenticated: false, user: null }}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MockAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
