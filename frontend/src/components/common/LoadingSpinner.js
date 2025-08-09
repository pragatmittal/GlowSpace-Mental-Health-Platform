import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  type = 'default',
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const typeClasses = {
    default: 'spinner-default',
    pulse: 'spinner-pulse',
    dots: 'spinner-dots',
    wave: 'spinner-wave'
  };

  if (type === 'dots') {
    return (
      <div className={`loading-container ${overlay ? 'loading-overlay' : ''}`}>
        <div className="dots-spinner">
          <div className="dot1"></div>
          <div className="dot2"></div>
          <div className="dot3"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  if (type === 'wave') {
    return (
      <div className={`loading-container ${overlay ? 'loading-overlay' : ''}`}>
        <div className="wave-spinner">
          <div className="wave1"></div>
          <div className="wave2"></div>
          <div className="wave3"></div>
          <div className="wave4"></div>
          <div className="wave5"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`loading-container ${overlay ? 'loading-overlay' : ''}`}>
        <div className={`pulse-spinner ${sizeClasses[size]}`}>
          <div className="pulse-circle pulse-1"></div>
          <div className="pulse-circle pulse-2"></div>
          <div className="pulse-circle pulse-3"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`loading-container ${overlay ? 'loading-overlay' : ''}`}>
      <div className={`spinner ${sizeClasses[size]} ${typeClasses[type]}`}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
