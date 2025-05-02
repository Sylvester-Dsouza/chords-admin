import apiClient from './api-client';
import { SubscriptionStatus } from '@/types/enums';

// Define types based on the API DTOs
export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  startDate: Date;
  endDate?: Date | null;
  renewalDate: Date;
  status: SubscriptionStatus;
  paymentMethod?: string | null;
  paymentMethodId?: string | null;
  canceledAt?: Date | null;
  cancelReason?: string | null;
  isAutoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
}

export interface CreateSubscriptionDto {
  customerId: string;
  planId: string;
  startDate: Date;
  renewalDate: Date;
  status?: SubscriptionStatus;
  paymentMethod?: string;
  paymentMethodId?: string;
  isAutoRenew?: boolean;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  renewalDate?: Date;
  status?: SubscriptionStatus;
  paymentMethod?: string;
  paymentMethodId?: string;
  isAutoRenew?: boolean;
}

export interface CancelSubscriptionDto {
  cancelReason?: string;
  endDate?: Date;
}

// Subscription service
const subscriptionService = {
  // Get all subscriptions
  getAllSubscriptions: async (
    status?: string,
    planId?: string,
    customerId?: string,
  ): Promise<Subscription[]> => {
    try {
      console.log('Fetching all subscriptions');
      const response = await apiClient.get<Subscription[]>('/subscriptions', {
        params: { status, planId, customerId },
      });
      console.log('Subscriptions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },
  
  // Get a subscription by ID
  getSubscriptionById: async (id: string): Promise<Subscription> => {
    try {
      console.log(`Fetching subscription with ID ${id}`);
      const response = await apiClient.get<Subscription>(`/subscriptions/${id}`);
      console.log('Subscription fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new subscription
  createSubscription: async (subscriptionData: CreateSubscriptionDto): Promise<Subscription> => {
    try {
      console.log('Creating new subscription with data:', subscriptionData);
      const response = await apiClient.post<Subscription>('/subscriptions', subscriptionData);
      console.log('Subscription created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },
  
  // Update a subscription
  updateSubscription: async (id: string, subscriptionData: UpdateSubscriptionDto): Promise<Subscription> => {
    try {
      console.log(`Updating subscription with ID ${id} with data:`, subscriptionData);
      const response = await apiClient.patch<Subscription>(`/subscriptions/${id}`, subscriptionData);
      console.log('Subscription updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Cancel a subscription
  cancelSubscription: async (id: string, cancelData: CancelSubscriptionDto): Promise<Subscription> => {
    try {
      console.log(`Canceling subscription with ID ${id} with data:`, cancelData);
      const response = await apiClient.post<Subscription>(`/subscriptions/${id}/cancel`, cancelData);
      console.log('Subscription canceled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error canceling subscription with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a subscription
  deleteSubscription: async (id: string): Promise<Subscription> => {
    try {
      console.log(`Deleting subscription with ID ${id}`);
      const response = await apiClient.delete<Subscription>(`/subscriptions/${id}`);
      console.log('Subscription deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subscription with ID ${id}:`, error);
      throw error;
    }
  },

  // Get active subscription for a customer
  getCustomerActiveSubscription: async (customerId: string): Promise<Subscription | null> => {
    try {
      console.log(`Fetching active subscription for customer ${customerId}`);
      const response = await apiClient.get<Subscription>(`/subscriptions/customer/${customerId}/active`);
      console.log('Customer active subscription fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching active subscription for customer ${customerId}:`, error);
      // Return null if no active subscription is found
      if (error instanceof Error && 'response' in error && (error.response as any)?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Renew a subscription
  renewSubscription: async (id: string): Promise<Subscription> => {
    try {
      console.log(`Renewing subscription with ID ${id}`);
      const response = await apiClient.post<Subscription>(`/subscriptions/${id}/renew`);
      console.log('Subscription renewed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error renewing subscription with ID ${id}:`, error);
      throw error;
    }
  },
};

export default subscriptionService;
