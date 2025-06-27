import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Log the API base URL for debugging
console.log('API Client initialized with baseURL:', apiClient.defaults.baseURL);

// Add a request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Log the request details only in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
      }

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
          console.log('Added auth token to request headers');
        }
      } else {
        // Try to get the token from sessionStorage as a fallback
        const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;

        if (storedToken && config.headers) {
          config.headers.Authorization = `Bearer ${storedToken}`;
          console.log('Added stored auth token to request headers');
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

// Add a response interceptor to handle token expiration and log responses
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses only in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log error responses with minimal information in production
    if (process.env.NODE_ENV === 'production') {
      console.error(`API Error: ${error.response?.status || 'Unknown'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    } else {
      // Detailed logging in development
      console.error(`API Error: ${error.response?.status || 'Unknown'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        message: error.message,
        response: error.response?.data,
      });
    }

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
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export the API instance for services to use
export default apiClient;
