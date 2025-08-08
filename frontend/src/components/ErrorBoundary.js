import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#e74c3c' }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 