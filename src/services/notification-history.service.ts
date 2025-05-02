import apiClient from './api-client';

// Define types based on the API DTOs
export interface NotificationHistory {
  id: string;
  notificationId: string;
  customerId: string;
  status: 'DELIVERED' | 'READ' | 'CLICKED' | 'DISMISSED';
  deliveredAt?: Date | null;
  readAt?: Date | null;
  clickedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    sentAt: Date;
  };
}

// NotificationHistory service
const notificationHistoryService = {
  // Get all notification history for a customer
  getCustomerNotificationHistory: async (customerId: string): Promise<NotificationHistory[]> => {
    try {
      console.log(`Fetching notification history for customer ${customerId}`);
      const response = await apiClient.get<NotificationHistory[]>(`/customers/${customerId}/notification-history`);
      console.log('Notification history fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification history for customer ${customerId}:`, error);
      throw error;
    }
  },
};

export default notificationHistoryService;
