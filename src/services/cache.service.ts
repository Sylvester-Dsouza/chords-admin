import { apiClient } from '@/lib/api-client';

export const CacheService = {
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

  // Clear all cache
  async clearAllCache(): Promise<any> {
    try {
      const response = await apiClient.delete('/admin/system/cache/all');
      return response.data;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      throw error;
    }
  },

  // Clear cache by prefix
  async clearCacheByPrefix(prefix: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/admin/system/cache/${prefix}`);
      return response.data;
    } catch (error) {
      console.error(`Error clearing cache with prefix ${prefix}:`, error);
      throw error;
    }
  },

  // Clear specific cache key
  async clearCacheKey(key: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/admin/system/cache/key/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error clearing cache key ${key}:`, error);
      throw error;
    }
  },
};
