import { apiClient } from '@/lib/api-client';

export const SystemMonitoringService = {
  // Get system performance metrics
  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await apiClient.get('/admin/system/performance');
      return response.data;
    } catch (error) {
      console.error('Error fetching system performance metrics:', error);
      throw error;
    }
  },

  // Get cache metrics
  async getCacheMetrics(): Promise<any> {
    try {
      const response = await apiClient.get('/admin/system/cache');
      return response.data;
    } catch (error) {
      console.error('Error fetching cache metrics:', error);
      throw error;
    }
  },

  // Get audit logs
  async getAuditLogs(page = 1, limit = 10, filters = {}): Promise<any> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      // Log the request for debugging
      console.log(`Fetching audit logs from: /admin/system/audit-logs?${params.toString()}`);

      // Check if we have a valid token
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
      if (!token) {
        console.warn('No authentication token available for audit logs request');
      } else {
        console.log('Using token for audit logs request (first 10 chars):', token.substring(0, 10) + '...');
      }

      const response = await apiClient.get(`/admin/system/audit-logs?${params.toString()}`);

      // Log successful response
      console.log('Audit logs fetched successfully:', {
        count: response.data?.logs?.length || 0,
        pagination: response.data?.pagination
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);

      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }

      throw error;
    }
  },
};
