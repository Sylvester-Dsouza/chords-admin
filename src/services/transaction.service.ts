import apiClient from './api-client';
import { TransactionStatus } from '@/types/enums';

// Define types based on the API DTOs
export interface Transaction {
  id: string;
  subscriptionId: string;
  customerId: string;
  planId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: string | null;
  paymentIntentId?: string | null;
  failureReason?: string | null;
  transactionDate: Date;
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
  };
}

export interface CreateTransactionDto {
  subscriptionId: string;
  customerId: string;
  planId: string;
  amount: number;
  currency?: string;
  status?: TransactionStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
  transactionDate?: Date;
}

export interface UpdateTransactionDto {
  status?: TransactionStatus;
  failureReason?: string;
  paymentIntentId?: string;
}

export interface RevenueStats {
  totalRevenue: number;
  revenueByPlan: Record<string, number>;
  revenueByMonth: Record<string, number>;
  transactionCount: number;
}

// Transaction service
const transactionService = {
  // Get all transactions
  getAllTransactions: async (
    status?: string,
    customerId?: string,
    planId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]> => {
    try {
      console.log('Fetching all transactions');
      const response = await apiClient.get<Transaction[]>('/transactions', {
        params: { status, customerId, planId, startDate, endDate },
      });
      console.log('Transactions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  // Get a transaction by ID
  getTransactionById: async (id: string): Promise<Transaction> => {
    try {
      console.log(`Fetching transaction with ID ${id}`);
      const response = await apiClient.get<Transaction>(`/transactions/${id}`);
      console.log('Transaction fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new transaction
  createTransaction: async (transactionData: CreateTransactionDto): Promise<Transaction> => {
    try {
      console.log('Creating new transaction with data:', transactionData);
      const response = await apiClient.post<Transaction>('/transactions', transactionData);
      console.log('Transaction created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  
  // Update a transaction
  updateTransaction: async (id: string, transactionData: UpdateTransactionDto): Promise<Transaction> => {
    try {
      console.log(`Updating transaction with ID ${id} with data:`, transactionData);
      const response = await apiClient.patch<Transaction>(`/transactions/${id}`, transactionData);
      console.log('Transaction updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating transaction with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a transaction
  deleteTransaction: async (id: string): Promise<Transaction> => {
    try {
      console.log(`Deleting transaction with ID ${id}`);
      const response = await apiClient.delete<Transaction>(`/transactions/${id}`);
      console.log('Transaction deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting transaction with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all transactions for a subscription
  getSubscriptionTransactions: async (subscriptionId: string): Promise<Transaction[]> => {
    try {
      console.log(`Fetching transactions for subscription ${subscriptionId}`);
      const response = await apiClient.get<Transaction[]>(`/transactions/subscription/${subscriptionId}`);
      console.log('Subscription transactions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for subscription ${subscriptionId}:`, error);
      throw error;
    }
  },

  // Get all transactions for a customer
  getCustomerTransactions: async (customerId: string): Promise<Transaction[]> => {
    try {
      console.log(`Fetching transactions for customer ${customerId}`);
      const response = await apiClient.get<Transaction[]>(`/transactions/customer/${customerId}`);
      console.log('Customer transactions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Get revenue statistics
  getRevenueStats: async (startDate?: Date, endDate?: Date): Promise<RevenueStats> => {
    try {
      console.log('Fetching revenue statistics');
      const response = await apiClient.get<RevenueStats>('/transactions/stats/revenue', {
        params: { startDate, endDate },
      });
      console.log('Revenue statistics fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue statistics:', error);
      throw error;
    }
  },
};

export default transactionService;
