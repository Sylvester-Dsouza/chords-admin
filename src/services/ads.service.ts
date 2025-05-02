import apiClient from './api-client';

// Ads service
const adsService = {
  // Remove ads for a customer
  removeAds: async (customerId: string): Promise<any> => {
    try {
      console.log(`Removing ads for customer ${customerId}`);
      const response = await apiClient.post<any>(`/ads/${customerId}/remove`);
      console.log('Ads removed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error removing ads for customer ${customerId}:`, error);
      throw error;
    }
  },
  
  // Restore ads for a customer
  restoreAds: async (customerId: string): Promise<any> => {
    try {
      console.log(`Restoring ads for customer ${customerId}`);
      const response = await apiClient.post<any>(`/ads/${customerId}/restore`);
      console.log('Ads restored successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error restoring ads for customer ${customerId}:`, error);
      throw error;
    }
  },
  
  // Check if a customer has ads removed
  hasAdsRemoved: async (customerId: string): Promise<boolean> => {
    try {
      console.log(`Checking ads status for customer ${customerId}`);
      const response = await apiClient.get<boolean>(`/ads/${customerId}/status`);
      console.log('Ads status checked successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error checking ads status for customer ${customerId}:`, error);
      throw error;
    }
  },
};

export default adsService;
