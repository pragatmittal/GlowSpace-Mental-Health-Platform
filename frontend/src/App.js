import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Chat from './components/Chat';
import EmotionDetector from './components/EmotionDetector';
import Community from './pages/Community';
import MoodTracking from './pages/MoodTracking';

// Assessment Page
import Assessment from './pages/Assessment';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Styles
import './App.css';

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/emotion-detector"
                  element={
                    <ProtectedRoute>
                      <EmotionDetector />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/moodtracking"
                  element={
                    <ProtectedRoute>
                      <MoodTracking />
                    </ProtectedRoute>
                  }
                />
                
                {/* Assessment Routes */}
                <Route
                  path="/assessments"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments/:view"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments/take/:type"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments/results/:assessmentId"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments/history"
                  element={
                    <ProtectedRoute>
                      <Assessment />
                    </ProtectedRoute>
                  }
                />
                
                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
