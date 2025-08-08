// Error handling utility for frontend
export class MoodTrackingError extends Error {
  constructor(message, code, field, details = {}) {
    super(message);
    this.name = 'MoodTrackingError';
    this.code = code;
    this.field = field;
    this.details = details;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors
          const fieldErrors = data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
          throw new MoodTrackingError(
            'Validation failed',
            'VALIDATION_ERROR',
            null,
            { fieldErrors }
          );
        } else if (data.field) {
          // Single field error
          throw new MoodTrackingError(
            data.message,
            'FIELD_ERROR',
            data.field,
            { validValues: data.validValues }
          );
        } else {
          throw new MoodTrackingError(
            data.message || 'Bad request',
            'BAD_REQUEST'
          );
        }
        
      case 401:
        throw new MoodTrackingError(
          'Authentication required',
          'UNAUTHORIZED'
        );
        
      case 403:
        throw new MoodTrackingError(
          'Access forbidden',
          'FORBIDDEN'
        );
        
      case 404:
        throw new MoodTrackingError(
          'Resource not found',
          'NOT_FOUND'
        );
        
      case 429:
        throw new MoodTrackingError(
          'Too many requests. Please try again later.',
          'RATE_LIMITED'
        );
        
      case 500:
        throw new MoodTrackingError(
          'Server error. Please try again later.',
          'SERVER_ERROR'
        );
        
      default:
        throw new MoodTrackingError(
          data.message || 'An unexpected error occurred',
          'UNKNOWN_ERROR'
        );
    }
  } else if (error.request) {
    // Network error
    throw new MoodTrackingError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR'
    );
  } else {
    // Other error
    throw new MoodTrackingError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR'
    );
  }
};

export const validateMoodData = (data) => {
  const errors = {};
  
  // Required fields
  if (!data.mood) {
    errors.mood = 'Mood is required';
  } else {
    const validMoods = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'];
    if (!validMoods.includes(data.mood)) {
      errors.mood = 'Invalid mood value';
    }
  }
  
  // Optional fields with validation
  if (data.intensity !== undefined) {
    if (typeof data.intensity !== 'number' || data.intensity < 1 || data.intensity > 10) {
      errors.intensity = 'Intensity must be between 1 and 10';
    }
  }
  
  if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }
  
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.tags = 'Tags must be an array';
    } else if (data.tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    } else {
      data.tags.forEach((tag, index) => {
        if (typeof tag !== 'string' || tag.length < 1 || tag.length > 20) {
          errors[`tags[${index}]`] = 'Each tag must be between 1 and 20 characters';
        }
      });
    }
  }
  
  if (Object.keys(errors).length > 0) {
    throw new MoodTrackingError(
      'Validation failed',
      'VALIDATION_ERROR',
      null,
      { fieldErrors: errors }
    );
  }
  
  return true;
};

export const formatErrorMessage = (error) => {
  if (error instanceof MoodTrackingError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        if (error.details.fieldErrors) {
          const fieldErrors = Object.values(error.details.fieldErrors);
          return fieldErrors.join(', ');
        }
        return error.message;
        
      case 'FIELD_ERROR':
        return `${error.field}: ${error.message}`;
        
      case 'UNAUTHORIZED':
        return 'Please log in to continue';
        
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action';
        
      case 'NOT_FOUND':
        return 'The requested resource was not found';
        
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
        
      case 'NETWORK_ERROR':
        return 'Connection error. Please check your internet connection.';
        
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.';
        
      default:
        return error.message;
    }
  }
  
  return error.message || 'An unexpected error occurred';
};

export const showErrorNotification = (error, toast) => {
  const message = formatErrorMessage(error);
  
  if (toast) {
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else {
    // Fallback to alert if toast is not available
    alert(message);
  }
};

export const logError = (error, context = '') => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    code: error.code,
    field: error.field,
    details: error.details,
    stack: error.stack
  });
}; 