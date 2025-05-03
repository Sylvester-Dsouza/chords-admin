import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-hanging requests
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          // Always force refresh the token to avoid expiration issues
          // This is important for long-running sessions
          const idToken = await currentUser.getIdToken(true);

          // Log token refresh for debugging
          console.log('Token refreshed for request to:', config.url);

          // Store it for future requests
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('firebaseIdToken', idToken);
            // Store the token refresh timestamp
            sessionStorage.setItem('tokenRefreshTimestamp', Date.now().toString());
          }

          // Add the token to the headers
          if (config.headers) {
            config.headers.Authorization = `Bearer ${idToken}`;
          }
        } catch (tokenError) {
          console.error('Error refreshing token:', tokenError);

          // If token refresh fails, try to use the stored token as fallback
          const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;

          if (storedToken && config.headers) {
            console.warn('Using stored token as fallback');
            config.headers.Authorization = `Bearer ${storedToken}`;
          } else {
            console.warn('No auth token available for request');
          }
        }
      } else {
        // Try to get the token from sessionStorage as a fallback
        const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;

        if (storedToken && config.headers) {
          console.warn('No current user, using stored token');
          config.headers.Authorization = `Bearer ${storedToken}`;
        } else {
          console.warn('No auth token available for request');
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and connection errors
apiClient.interceptors.response.use(
  (response) => {
    // Clear any API error flags on successful responses
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('apiConnectionError');
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log detailed error information for debugging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      method: originalRequest?.method,
      data: error.response?.data,
    });

    // Handle token expiration (401 Unauthorized) or token verification errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('Token expired or invalid. Attempting to refresh...');
      originalRequest._retry = true;

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          console.log('Current user found, refreshing token...');

          try {
            // Get a fresh token by forcing a refresh
            const newToken = await currentUser.getIdToken(true);
            console.log('New token obtained successfully');

            // Update in session storage
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('firebaseIdToken', newToken);
              sessionStorage.setItem('tokenRefreshTimestamp', Date.now().toString());
            }

            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Retry the original request with the new token
            console.log('Retrying request with new token');
            return apiClient(originalRequest);
          } catch (tokenError) {
            console.error('Failed to refresh token:', tokenError);
            throw new Error('Token refresh failed');
          }
        } else {
          // If there's no current user, redirect to login
          console.warn('No current user found during token refresh. Redirecting to login.');
          if (typeof window !== 'undefined') {
            // Clear any stored tokens
            sessionStorage.removeItem('firebaseIdToken');
            localStorage.removeItem('isAuthenticated');

            // Set a flag to indicate token expiration
            sessionStorage.setItem('tokenExpired', 'true');

            // Redirect to login
            window.location.href = '/login?expired=true';
          }
          throw new Error('No current user');
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);

        // If token refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          // Clear any stored tokens
          sessionStorage.removeItem('firebaseIdToken');
          localStorage.removeItem('isAuthenticated');

          // Set a flag to indicate token refresh failure
          sessionStorage.setItem('tokenRefreshFailed', 'true');

          console.warn('Token refresh failed. Redirecting to login.');
          window.location.href = '/login?refresh_failed=true';
        }
        return Promise.reject(refreshError);
      }
    }

    // For 403 Forbidden errors, just log details but NEVER redirect
    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response.data);
      console.warn('Request URL:', error.config.url);
      console.warn('Request method:', error.config.method);

      // Return empty data for GET requests to prevent crashes
      if (error.config?.method?.toLowerCase() === 'get') {
        console.warn('Returning empty data for GET request with 403 error');
        return Promise.resolve({
          data: Array.isArray(error.config?.url) ? [] : {},
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config: error.config,
          _fromErrorHandler: true
        });
      }
    }

    // Handle network errors (like connection refused)
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('API connection error:', error.message);
      console.error('Request URL:', originalRequest?.url);
      console.error('Request method:', originalRequest?.method);

      // Set a flag to indicate API connection issues
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('apiConnectionError', 'true');

        // Only show the error message once per session
        if (!sessionStorage.getItem('apiErrorShown')) {
          sessionStorage.setItem('apiErrorShown', 'true');
          console.error('Cannot connect to the API server. Some features may be limited.');
          // Don't use alert as it's too intrusive
          // Instead, we'll handle this in the components
        }
      }

      // For GET requests, return empty data to prevent app crashes
      if (error.config?.method?.toLowerCase() === 'get') {
        console.warn('Returning empty data for GET request due to API connection error');
        return Promise.resolve({
          data: Array.isArray(error.config?.url) ? [] : {},
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config: error.config,
          _fromErrorHandler: true,
          _networkError: true
        });
      }
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('API request timeout:', error.message);

      // For GET requests, return empty data to prevent app crashes
      if (error.config?.method?.toLowerCase() === 'get') {
        console.warn('Returning empty data for GET request due to timeout');
        return Promise.resolve({
          data: Array.isArray(error.config?.url) ? [] : {},
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config: error.config,
          _fromErrorHandler: true,
          _timeoutError: true
        });
      }
    }

    return Promise.reject(error);
  }
);

// Export the API instance for services to use
export { apiClient };
