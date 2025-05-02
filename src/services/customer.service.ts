import apiClient from './api-client';

// Define types based on the API DTOs
export interface Customer {
  id: string;
  email: string;
  name?: string | null;
  firebaseUid?: string | null;
  phoneNumber?: string | null;
  country?: string | null;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface CreateCustomerDto {
  email: string;
  name: string;
  password?: string; // For Firebase user creation
  firebaseUid?: string;
  phoneNumber?: string;
  country?: string;
  isActive?: boolean;
  isPremium?: boolean;
  createFirebaseUser?: boolean; // Flag to indicate if Firebase user should be created
}

export interface UpdateCustomerDto {
  name?: string;
  firebaseUid?: string;
  phoneNumber?: string;
  country?: string;
  isActive?: boolean;
  isPremium?: boolean;
}

// Customer service
const customerService = {
  // Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      console.log('Fetching all customers');
      const response = await apiClient.get<Customer[]>('/customers');
      console.log('Customers fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },
  
  // Get a customer by ID
  getCustomerById: async (id: string): Promise<Customer> => {
    try {
      console.log(`Fetching customer with ID ${id}`);
      const response = await apiClient.get<Customer>(`/customers/${id}`);
      console.log('Customer fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new customer
  createCustomer: async (customerData: CreateCustomerDto): Promise<Customer> => {
    try {
      // Remove createFirebaseUser flag from the data sent to the API
      const { createFirebaseUser, password, ...apiCustomerData } = customerData;
      
      console.log('Creating new customer with data:', apiCustomerData);
      
      // If createFirebaseUser is true, create a Firebase user first
      if (createFirebaseUser && password) {
        try {
          // Call the API endpoint that creates a Firebase user
          const firebaseResponse = await apiClient.post('/auth/create-firebase-user', {
            email: customerData.email,
            password: password,
            displayName: customerData.name
          });
          
          console.log('Firebase user created successfully:', firebaseResponse.data);
          
          // Add the Firebase UID to the customer data
          if (firebaseResponse.data && firebaseResponse.data.uid) {
            apiCustomerData.firebaseUid = firebaseResponse.data.uid;
          }
        } catch (firebaseError) {
          console.error('Error creating Firebase user:', firebaseError);
          throw new Error(`Failed to create Firebase user: ${
            (firebaseError as { response?: { data?: { message?: string } }, message?: string })?.response?.data?.message || 
            (firebaseError as { message?: string })?.message || 
            'Unknown error'
          }`);
        }
      }
      
      // Create the customer in the database
      const response = await apiClient.post<Customer>('/customers', apiCustomerData);
      console.log('Customer created successfully in database:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },
  
  // Update a customer
  updateCustomer: async (id: string, customerData: UpdateCustomerDto): Promise<Customer> => {
    try {
      console.log(`Updating customer with ID ${id} with data:`, customerData);
      const response = await apiClient.patch<Customer>(`/customers/${id}`, customerData);
      console.log('Customer updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a customer
  deleteCustomer: async (id: string): Promise<Customer> => {
    try {
      console.log(`Deleting customer with ID ${id}`);
      const response = await apiClient.delete<Customer>(`/customers/${id}`);
      console.log('Customer deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  }
};

export default customerService;
