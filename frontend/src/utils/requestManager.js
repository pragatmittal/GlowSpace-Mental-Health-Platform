/**
 * Request Manager - Handles rate limiting, deduplication, and caching
 * Prevents API spam and 429 errors
 */
import axios from 'axios';

class RequestManager {
  constructor() {
    this.pendingRequests = new Map(); // Track pending requests
    this.cache = new Map(); // Response cache
    this.requestCounts = new Map(); // Rate limiting counters
    this.lastRequestTime = new Map(); // For rate limiting
    this.abortControllers = new Map(); // For cleanup
    
    // Configuration
    this.config = {
      maxConcurrentRequests: 3,
      cacheTimeout: 30000, // 30 seconds
      rateLimitWindow: 1000, // 1 second
      maxRequestsPerWindow: 5,
      backoffMultiplier: 2,
      maxBackoffDelay: 10000, // 10 seconds
    };
  }

  /**
   * Generate cache key for request
   */
  getCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}?${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if request is rate limited
   */
  isRateLimited(cacheKey) {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    // Clean old entries
    for (const [key, timestamps] of this.requestCounts.entries()) {
      this.requestCounts.set(key, timestamps.filter(t => t > windowStart));
      if (this.requestCounts.get(key).length === 0) {
        this.requestCounts.delete(key);
      }
    }
    
    const requests = this.requestCounts.get(cacheKey) || [];
    return requests.length >= this.config.maxRequestsPerWindow;
  }

  /**
   * Add request to rate limit counter
   */
  addToRateLimit(cacheKey) {
    const now = Date.now();
    const requests = this.requestCounts.get(cacheKey) || [];
    requests.push(now);
    this.requestCounts.set(cacheKey, requests);
  }

  /**
   * Get cached response if available and valid
   */
  getCachedResponse(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache response
   */
  setCachedResponse(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Calculate backoff delay for retries
   */
  getBackoffDelay(retryCount) {
    const delay = Math.min(
      1000 * Math.pow(this.config.backoffMultiplier, retryCount),
      this.config.maxBackoffDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = delay * 0.1 * Math.random();
    return delay + jitter;
  }

  /**
   * Sleep function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with all protections
   */
  async executeRequest(axiosConfig) {
    const url = axiosConfig.url || `${axiosConfig.baseURL || ''}${axiosConfig.url || ''}`;
    const params = axiosConfig.params || axiosConfig.data || {};
    const cacheKey = this.getCacheKey(url, params);
    
    // Check cache first (only for GET requests)
    if (axiosConfig.method === 'GET' || !axiosConfig.method) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log(`📦 Using cached response for ${url}`);
        return cachedResponse;
      }
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Request already pending for ${url}, waiting...`);
      return this.pendingRequests.get(cacheKey);
    }
    
    // Check rate limiting
    if (this.isRateLimited(cacheKey)) {
      console.warn(`🚫 Rate limited request for ${url}`);
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Create request promise using axios
    const requestPromise = this.makeAxiosRequestWithRetry(axiosConfig, 0);
    
    // Track pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      const response = await requestPromise;
      
      // Cache successful response (only GET requests)
      if (axiosConfig.method === 'GET' || !axiosConfig.method) {
        this.setCachedResponse(cacheKey, response);
      }
      
      // Add to rate limit counter
      this.addToRateLimit(cacheKey);
      
      return response;
    } catch (error) {
      // Don't cache errors
      throw error;
    } finally {
      // Cleanup
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Make axios request with retry logic
   */
  async makeAxiosRequestWithRetry(axiosConfig, retryCount) {
    try {
      const response = await axios(axiosConfig);
      return response;
    } catch (error) {
      // Handle 429 specifically
      if (error.response?.status === 429) {
        if (retryCount < 3) {
          const delay = this.getBackoffDelay(retryCount);
          console.warn(`🔄 429 error, retrying in ${delay}ms (attempt ${retryCount + 1})`);
          await this.sleep(delay);
          return this.makeAxiosRequestWithRetry(axiosConfig, retryCount + 1);
        } else {
          throw new Error('Too many requests. Please try again later.');
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    console.log('🚫 Cancelling all pending requests');
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
    this.pendingRequests.clear();
  }

  /**
   * Cancel specific request
   */
  cancelRequest(url, params = {}) {
    const cacheKey = this.getCacheKey(url, params);
    const controller = this.abortControllers.get(cacheKey);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(cacheKey);
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Request cache cleared');
  }

  /**
   * Get stats for debugging
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      cachedResponses: this.cache.size,
      rateLimitedEndpoints: this.requestCounts.size,
      totalAbortControllers: this.abortControllers.size
    };
  }
}

// Create singleton instance
const requestManager = new RequestManager();

export default requestManager;
