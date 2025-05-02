import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Always get a fresh Firebase ID token to avoid expiration issues
        const idToken = await currentUser.getIdToken(true);

        // Store it for future requests
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('firebaseIdToken', idToken);
        }

        // Add the token to the headers
        if (config.headers) {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
      } else {
        // Try to get the token from sessionStorage as a fallback
        const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;

        if (storedToken && config.headers) {
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

    // If the error is due to an expired token (401 Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Force refresh the token
          const newToken = await currentUser.getIdToken(true);

          // Update in session storage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('firebaseIdToken', newToken);
          }

          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request with the new token
          return apiClient(originalRequest);
        } else {
          // If there's no current user, redirect to login
          if (typeof window !== 'undefined') {
            console.warn('No current user found during token refresh. Redirecting to login.');
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);

        // If token refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          console.warn('Token refresh failed. Redirecting to login.');
          window.location.href = '/login';
        }
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
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.error('API connection error:', error.message);

      // Set a flag to indicate API connection issues
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('apiConnectionError', 'true');

        // Only show the error message once per session
        if (!sessionStorage.getItem('apiErrorShown')) {
          sessionStorage.setItem('apiErrorShown', 'true');
          alert('Cannot connect to the API server. Some features may be limited.');
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
          _fromErrorHandler: true
        });
      }
    }

    return Promise.reject(error);
  }
);

// Export the API instance for services to use
export { apiClient };
