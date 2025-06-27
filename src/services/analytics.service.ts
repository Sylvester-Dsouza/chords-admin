import { apiClient } from '@/lib/api-client';

// Cache implementation for analytics data
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class AnalyticsCache {
  private cache: Record<string, CacheItem<any>> = {};
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;
    
    // Check if the item has expired
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return null;
    }
    
    return item.data as T;
  }

  invalidate(key: string): void {
    delete this.cache[key];
  }

  invalidateAll(): void {
    this.cache = {};
  }
}

const analyticsCache = new AnalyticsCache();

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

  // Get user activity metrics with caching
  async getUserActivityMetrics(period: string = 'month'): Promise<any> {
    const cacheKey = `user-activity-${period}`;
    const cachedData = analyticsCache.get(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      console.log('Using cached user activity metrics');
      return cachedData;
    }
    
    try {
      const response = await apiClient.get(`/admin/analytics/metrics/user-activity?period=${period}`);
      // Cache the response data for 5 minutes
      analyticsCache.set(cacheKey, response.data);
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

  // Get content engagement metrics with caching
  async getContentEngagementMetrics(period: string = 'month'): Promise<any> {
    const cacheKey = `content-engagement-${period}`;
    const cachedData = analyticsCache.get(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      console.log('Using cached content engagement metrics');
      return cachedData;
    }
    
    try {
      const response = await apiClient.get(`/admin/analytics/metrics/content-engagement?period=${period}`);
      // Cache the response data for 5 minutes
      analyticsCache.set(cacheKey, response.data);
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

  // Get all analytics data in one call with optimized parallel fetching and caching
  async getAllAnalytics(period: string = 'month'): Promise<any> {
    const cacheKey = `all-analytics-${period}`;
    const cachedData = analyticsCache.get(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      console.log('Using cached analytics data');
      return cachedData;
    }
    
    try {
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

      // Fetch all data in parallel instead of sequentially
      console.log('Fetching all analytics data in parallel...');
      const [
        userActivity,
        contentEngagement,
        mostViewedSongs,
        mostViewedArtists,
        mostViewedCollections
      ] = await Promise.all([
        this.getUserActivityMetrics(period),
        this.getContentEngagementMetrics(period),
        this.getMostViewedSongs(5, period),
        this.getMostViewedArtists(5, period),
        this.getMostViewedCollections(5, period)
      ]);

      console.log('All analytics data fetched successfully');

      const result = {
        mostViewedSongs,
        mostViewedArtists,
        mostViewedCollections,
        userActivity,
        contentEngagement
      };
      
      // Cache the combined results
      analyticsCache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes TTL
      
      return result;
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
  },
  
  // Method to manually invalidate cache
  invalidateCache(): void {
    analyticsCache.invalidateAll();
    console.log('Analytics cache invalidated');
  }
};
