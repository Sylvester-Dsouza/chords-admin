import apiClient from './api-client';
// Define enums locally instead of importing from @prisma/client

export enum NotificationType {
  GENERAL = 'GENERAL',
  SONG_ADDED = 'SONG_ADDED',
  SONG_REQUEST_COMPLETED = 'SONG_REQUEST_COMPLETED',
  NEW_FEATURE = 'NEW_FEATURE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PROMOTION = 'PROMOTION'
}

export enum NotificationAudience {
  ALL = 'ALL',
  PREMIUM_USERS = 'PREMIUM_USERS',
  FREE_USERS = 'FREE_USERS',
  SPECIFIC_USER = 'SPECIFIC_USER'
}

export enum NotificationStatus {
  SENT = 'SENT',
  SCHEDULED = 'SCHEDULED',
  FAILED = 'FAILED'
}

export interface CreateNotificationDto {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: NotificationType;
  audience?: NotificationAudience;
  customerId?: string;
  schedule?: boolean;
  scheduledAt?: Date;
  sendPush?: boolean;
  sendEmail?: boolean;
}

export interface UpdateNotificationDto {
  title?: string;
  body?: string;
  data?: Record<string, any>;
  type?: NotificationType;
  status?: NotificationStatus;
  scheduledAt?: Date;
}

export interface NotificationResponseDto {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
  audience: NotificationAudience;
  status: NotificationStatus;
  customerId?: string;
  sentAt: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationHistoryResponseDto {
  id: string;
  notificationId: string;
  customerId: string;
  status: string;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notification?: NotificationResponseDto;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

// Notification service
const notificationService = {
  // Get all notifications
  getAllNotifications: async (
    status?: NotificationStatus,
    type?: NotificationType,
    audience?: NotificationAudience,
    customerId?: string
  ): Promise<NotificationResponseDto[]> => {
    try {
      console.log('Fetching all notifications');

      // Build query parameters
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (type) params.type = type;
      if (audience) params.audience = audience;
      if (customerId) params.customerId = customerId;

      const response = await apiClient.get<NotificationResponseDto[]>('/notifications', { params });
      console.log('Notifications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get a notification by ID
  getNotificationById: async (id: string): Promise<NotificationResponseDto> => {
    try {
      console.log(`Fetching notification with ID ${id}`);
      const response = await apiClient.get<NotificationResponseDto>(`/notifications/${id}`);
      console.log('Notification fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new notification
  createNotification: async (notificationData: CreateNotificationDto): Promise<NotificationResponseDto> => {
    try {
      console.log('Creating new notification with data:', notificationData);

      // Format the data for the API
      const apiNotificationData = {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        type: notificationData.type || NotificationType.GENERAL,
        audience: notificationData.audience || NotificationAudience.ALL,
        customerId: notificationData.customerId,
        schedule: notificationData.schedule || false,
        scheduledAt: notificationData.schedule ? notificationData.scheduledAt : undefined,
        sendPush: notificationData.sendPush !== undefined ? notificationData.sendPush : true,
        sendEmail: notificationData.sendEmail !== undefined ? notificationData.sendEmail : false,
      };

      const response = await apiClient.post<NotificationResponseDto>('/notifications', apiNotificationData);
      console.log('Notification created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Update a notification
  updateNotification: async (id: string, notificationData: UpdateNotificationDto): Promise<NotificationResponseDto> => {
    try {
      console.log(`Updating notification with ID ${id} with data:`, notificationData);
      const response = await apiClient.patch<NotificationResponseDto>(`/notifications/${id}`, notificationData);
      console.log('Notification updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating notification with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting notification with ID ${id}`);
      await apiClient.delete(`/notifications/${id}`);
      console.log('Notification deleted successfully');
    } catch (error) {
      console.error(`Error deleting notification with ID ${id}:`, error);
      throw error;
    }
  },

  // Process scheduled notifications
  processScheduledNotifications: async (): Promise<void> => {
    try {
      console.log('Processing scheduled notifications');
      await apiClient.post('/notifications/process-scheduled');
      console.log('Scheduled notifications processed successfully');
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  },

  // Get notification statistics
  getNotificationStatistics: async (): Promise<{
    totalSent: number;
    totalScheduled: number;
    averageOpenRate: number;
    averageClickRate: number;
  }> => {
    try {
      // Get all notifications
      const allNotifications = await notificationService.getAllNotifications();

      // Get scheduled notifications
      const scheduledNotifications = allNotifications.filter(
        notification => notification.status === NotificationStatus.SCHEDULED
      );

      // Calculate statistics (in a real implementation, this would come from the API)
      // For now, we'll use dummy values for open and click rates
      return {
        totalSent: allNotifications.filter(n => n.status === NotificationStatus.SENT).length,
        totalScheduled: scheduledNotifications.length,
        averageOpenRate: 72, // Dummy value
        averageClickRate: 43, // Dummy value
      };
    } catch (error) {
      console.error('Error getting notification statistics:', error);
      throw error;
    }
  },
};

export default notificationService;
