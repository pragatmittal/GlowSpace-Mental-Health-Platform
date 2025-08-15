import React from 'react';
import './DashboardErrorBoundary.css';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('🚨 Dashboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log to external service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const isApiError = error?.message?.includes('429') || 
                        error?.message?.includes('Too many requests') ||
                        error?.message?.includes('Rate limit');

      return (
        <div className="dashboard-error-boundary">
          <div className="error-container">
            <div className="error-icon">
              {isApiError ? '🚦' : '😵'}
            </div>
            
            <h2 className="error-title">
              {isApiError ? 'Server Busy' : 'Something went wrong'}
            </h2>
            
            <p className="error-message">
              {isApiError 
                ? 'Our servers are experiencing high traffic. Please wait a moment and try again.'
                : 'We encountered an unexpected error while loading your dashboard.'
              }
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Technical Details (Development)</summary>
                <div className="error-stack">
                  <strong>Error:</strong> {error && error.toString()}
                  <br />
                  <strong>Component Stack:</strong>
                  <pre>{errorInfo.componentStack}</pre>
                  <strong>Error Stack:</strong>
                  <pre>{error && error.stack}</pre>
                </div>
              </details>
            )}

            <div className="error-actions">
              {retryCount < 3 && (
                <button 
                  onClick={this.handleRetry}
                  className="retry-button primary"
                >
                  {isApiError ? '⏳ Wait & Retry' : '🔄 Try Again'}
                </button>
              )}
              
              <button 
                onClick={this.handleRefresh}
                className="refresh-button secondary"
              >
                🔄 Refresh Page
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="home-button tertiary"
              >
                🏠 Go Home
              </button>
            </div>

            {retryCount >= 3 && (
              <div className="persistent-error">
                <p>
                  <strong>Persistent Issue Detected</strong><br />
                  If this problem continues, please try refreshing the page or contact support.
                </p>
              </div>
            )}

            <div className="error-tips">
              <h4>💡 Quick Tips:</h4>
              <ul>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache if issues persist</li>
                {isApiError && <li>Wait 30 seconds before trying again</li>}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
