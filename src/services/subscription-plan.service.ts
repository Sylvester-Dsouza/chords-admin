import apiClient from './api-client';
import { BillingCycle } from '@/types/enums';

// Define types based on the API DTOs
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriberCount?: number;
  revenue?: number;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  features?: string[];
  isActive?: boolean;
}

// Subscription plan service
const subscriptionPlanService = {
  // Get all subscription plans
  getAllPlans: async (includeInactive = false): Promise<SubscriptionPlan[]> => {
    try {
      console.log('Fetching all subscription plans');
      const response = await apiClient.get<SubscriptionPlan[]>('/subscription-plans', {
        params: { includeInactive },
      });
      console.log('Subscription plans fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },
  
  // Get a subscription plan by ID
  getPlanById: async (id: string): Promise<SubscriptionPlan> => {
    try {
      console.log(`Fetching subscription plan with ID ${id}`);
      const response = await apiClient.get<SubscriptionPlan>(`/subscription-plans/${id}`);
      console.log('Subscription plan fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription plan with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new subscription plan
  createPlan: async (planData: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> => {
    try {
      console.log('Creating new subscription plan with data:', planData);
      const response = await apiClient.post<SubscriptionPlan>('/subscription-plans', planData);
      console.log('Subscription plan created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  },
  
  // Update a subscription plan
  updatePlan: async (id: string, planData: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> => {
    try {
      console.log(`Updating subscription plan with ID ${id} with data:`, planData);
      const response = await apiClient.patch<SubscriptionPlan>(`/subscription-plans/${id}`, planData);
      console.log('Subscription plan updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription plan with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a subscription plan
  deletePlan: async (id: string): Promise<SubscriptionPlan> => {
    try {
      console.log(`Deleting subscription plan with ID ${id}`);
      const response = await apiClient.delete<SubscriptionPlan>(`/subscription-plans/${id}`);
      console.log('Subscription plan deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subscription plan with ID ${id}:`, error);
      throw error;
    }
  },

  // Toggle the active status of a subscription plan
  togglePlanActive: async (id: string, isActive: boolean): Promise<SubscriptionPlan> => {
    try {
      console.log(`Toggling subscription plan ${id} active status to ${isActive}`);
      const response = await apiClient.patch<SubscriptionPlan>(`/subscription-plans/${id}/toggle-active?isActive=${isActive}`);
      console.log('Subscription plan status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error toggling subscription plan ${id} active status:`, error);
      throw error;
    }
  },
};

export default subscriptionPlanService;
