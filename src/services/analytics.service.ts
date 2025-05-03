import { apiClient } from '@/lib/api-client';

export const AnalyticsService = {
  // Get most viewed songs
  async getMostViewedSongs(limit: number = 10, period: string = 'all'): Promise<any[]> {
    try {
      const response = await apiClient.get(`/admin/analytics/songs/most-viewed?limit=${limit}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching most viewed songs:', error);
      return [];
    }
  },

  // Get most viewed artists
  async getMostViewedArtists(limit: number = 10, period: string = 'all'): Promise<any[]> {
    try {
      const response = await apiClient.get(`/admin/analytics/artists/most-viewed?limit=${limit}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching most viewed artists:', error);
      return [];
    }
  },

  // Get most viewed collections
  async getMostViewedCollections(limit: number = 10, period: string = 'all'): Promise<any[]> {
    try {
      const response = await apiClient.get(`/admin/analytics/collections/most-viewed?limit=${limit}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching most viewed collections:', error);
      return [];
    }
  },

  // Get daily metrics
  async getDailyMetrics(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/admin/analytics/metrics/daily?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily metrics:', error);
      return [];
    }
  },

  // Get user activity metrics
  async getUserActivityMetrics(period: string = 'month'): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/analytics/metrics/user-activity?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity metrics:', error);
      return {
        activeUsers: 0,
        newUsers: 0,
        totalSessions: 0,
        avgSessionDuration: 0,
        platformDistribution: {}
      };
    }
  },

  // Get content engagement metrics
  async getContentEngagementMetrics(period: string = 'month'): Promise<any> {
    try {
      const response = await apiClient.get(`/admin/analytics/metrics/content-engagement?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching content engagement metrics:', error);
      return {
        viewsByType: { song: 0, artist: 0, collection: 0 },
        totalLikes: 0,
        totalComments: 0,
        sourceDistribution: {}
      };
    }
  },

  // Update daily metrics (admin only)
  async updateDailyMetrics(): Promise<any> {
    try {
      const response = await apiClient.post('/admin/analytics/metrics/update-daily');
      return response.data;
    } catch (error) {
      console.error('Error updating daily metrics:', error);
      throw error;
    }
  },

  // Get all analytics data in one call with rate limiting
  async getAllAnalytics(period: string = 'month'): Promise<any> {
    try {
      // Add a delay between API calls to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // First check if we can access the API by making a simple request
      try {
        await apiClient.get('/admin/analytics/metrics/user-activity?period=day');
      } catch (authError: any) {
        console.error('Authentication check failed:', authError);
        if (authError.response?.status === 401 || authError.response?.status === 403) {
          // If we get an auth error, throw a specific error that can be handled by the UI
          throw new Error('AUTH_ERROR');
        }
      }

      // Instead of making all requests in parallel, make them sequentially with delays
      console.log('Fetching user activity metrics...');
      const userActivity = await this.getUserActivityMetrics(period);
      await delay(300); // Add a 300ms delay between requests

      console.log('Fetching content engagement metrics...');
      const contentEngagement = await this.getContentEngagementMetrics(period);
      await delay(300);

      console.log('Fetching most viewed songs...');
      const mostViewedSongs = await this.getMostViewedSongs(5, period);
      await delay(300);

      console.log('Fetching most viewed artists...');
      const mostViewedArtists = await this.getMostViewedArtists(5, period);
      await delay(300);

      console.log('Fetching most viewed collections...');
      const mostViewedCollections = await this.getMostViewedCollections(5, period);

      console.log('All analytics data fetched successfully');

      return {
        mostViewedSongs,
        mostViewedArtists,
        mostViewedCollections,
        userActivity,
        contentEngagement
      };
    } catch (error: any) {
      console.error('Error fetching all analytics:', error);
      // If it's our specific auth error, rethrow it
      if (error.message === 'AUTH_ERROR') {
        throw error;
      }
      // Otherwise return mock data as a fallback
      return {
        mostViewedSongs: [],
        mostViewedArtists: [],
        mostViewedCollections: [],
        userActivity: {
          activeUsers: 0,
          newUsers: 0,
          totalSessions: 0,
          avgSessionDuration: 0,
          platformDistribution: {}
        },
        contentEngagement: {
          viewsByType: { song: 0, artist: 0, collection: 0 },
          totalLikes: 0,
          totalComments: 0,
          sourceDistribution: {}
        }
      };
    }
  }
};
