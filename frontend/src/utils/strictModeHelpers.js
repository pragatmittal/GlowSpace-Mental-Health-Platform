/**
 * React Strict Mode Compatibility Utilities
 * Helps handle double mounting and cleanup in development mode
 */

/**
 * Check if we're running in React Strict Mode
 */
export const isStrictMode = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Custom hook to handle Strict Mode double mounting
 */
export const useStrictModeCompatible = (effect, deps = []) => {
  const React = require('react');
  const { useEffect, useRef } = React;
  
  const hasRunRef = useRef(false);
  const cleanupRef = useRef(null);
  
  useEffect(() => {
    // In strict mode, this will run twice
    // We use a ref to track if we've already run
    if (hasRunRef.current) {
      console.log('🔄 Strict mode double execution detected - skipping');
      return;
    }
    
    hasRunRef.current = true;
    
    // Run the effect
    const cleanup = effect();
    
    // Store cleanup function
    if (typeof cleanup === 'function') {
      cleanupRef.current = cleanup;
    }
    
    // Return cleanup that resets the ref for next mount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      hasRunRef.current = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * Debounce function specifically for API calls
 */
export const debounceApiCall = (func, delay = 1000) => {
  let timeoutId;
  let lastCallTime = 0;
  
  return function (...args) {
    const now = Date.now();
    
    // If called too frequently, use the debounced approach
    if (now - lastCallTime < delay) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(this, args);
      }, delay);
    } else {
      // First call or after delay, execute immediately
      lastCallTime = now;
      func.apply(this, args);
    }
  };
};

/**
 * Create an abort controller that auto-cleans up
 */
export const createManagedAbortController = () => {
  const controller = new AbortController();
  
  // Auto cleanup after 30 seconds to prevent memory leaks
  const timeout = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }, 30000);
  
  // Enhanced abort method
  const originalAbort = controller.abort.bind(controller);
  controller.abort = (reason) => {
    clearTimeout(timeout);
    originalAbort(reason);
  };
  
  return controller;
};

/**
 * Smart API call wrapper that handles common issues
 */
export const createSmartApiCall = (apiFunction, options = {}) => {
  const {
    minInterval = 2000,
    maxRetries = 3,
    retryDelay = 1000,
    cacheTime = 30000
  } = options;
  
  let lastCallTime = 0;
  let cache = new Map();
  let pendingCalls = new Map();
  
  return async (...args) => {
    const cacheKey = JSON.stringify(args);
    const now = Date.now();
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    // Check if call is too frequent
    if (now - lastCallTime < minInterval) {
      console.log('🚫 API call throttled');
      throw new Error('API call throttled - please try again');
    }
    
    // Check if identical call is already pending
    if (pendingCalls.has(cacheKey)) {
      console.log('⏳ Waiting for pending API call');
      return pendingCalls.get(cacheKey);
    }
    
    // Make the call
    lastCallTime = now;
    const promise = apiFunction(...args);
    pendingCalls.set(cacheKey, promise);
    
    try {
      const result = await promise;
      
      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: now
      });
      
      // Clean up cache periodically
      if (cache.size > 50) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    } finally {
      pendingCalls.delete(cacheKey);
    }
  };
};

/**
 * Component wrapper to handle cleanup
 */
export const withCleanup = (Component) => {
  return function WrappedComponent(props) {
    const React = require('react');
    const { useEffect, useRef } = React;
    
    const isMountedRef = useRef(true);
    
    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);
    
    return React.createElement(Component, {
      ...props,
      isMountedRef
    });
  };
};

export default {
  isStrictMode,
  useStrictModeCompatible,
  debounceApiCall,
  createManagedAbortController,
  createSmartApiCall,
  withCleanup
};
