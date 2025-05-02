import apiClient from './api-client';

// Define enum for user roles to match backend
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CONTRIBUTOR = 'CONTRIBUTOR',
  EDITOR = 'EDITOR',
}

// Define types based on the API DTOs
export interface User {
  id: string;
  email: string;
  name?: string | null;
  firebaseUid?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password?: string; // For Firebase user creation
  firebaseUid?: string;
  role?: UserRole;
  isActive?: boolean;
  createFirebaseUser?: boolean; // Flag to indicate if Firebase user should be created
}

export interface UpdateUserDto {
  name?: string;
  firebaseUid?: string;
  role?: UserRole;
  isActive?: boolean;
}

// User service
const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      console.log('Fetching all users');
      const response = await apiClient.get<User[]>('/users');
      console.log('Users fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get a user by ID
  getUserById: async (id: string): Promise<User> => {
    try {
      console.log(`Fetching user with ID ${id}`);
      const response = await apiClient.get<User>(`/users/${id}`);
      console.log('User fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserDto): Promise<User> => {
    try {
      // Remove createFirebaseUser flag from the data sent to the API
      const { createFirebaseUser, password, ...apiUserData } = userData;

      console.log('Creating new user with data:', apiUserData);

      // If createFirebaseUser is true, create a Firebase user first
      if (createFirebaseUser && password) {
        try {
          // Call the API endpoint that creates a Firebase user
          const firebaseResponse = await apiClient.post('/auth/create-firebase-user', {
            email: userData.email,
            password: password,
            displayName: userData.name
          });

          console.log('Firebase user created successfully:', firebaseResponse.data);

          // Add the Firebase UID to the user data
          if (firebaseResponse.data && firebaseResponse.data.uid) {
            apiUserData.firebaseUid = firebaseResponse.data.uid;
          }
        } catch (error) {
          const firebaseError = error as { response?: { data?: { message?: string } }, message?: string };
          console.error('Error creating Firebase user:', firebaseError);
          throw new Error(`Failed to create Firebase user: ${firebaseError.response?.data?.message || firebaseError.message || 'Unknown error'}`);
        }
      }

      // Create the user in the database
      const response = await apiClient.post<User>('/users', apiUserData);
      console.log('User created successfully in database:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
    try {
      console.log(`Updating user with ID ${id} with data:`, userData);
      const response = await apiClient.patch<User>(`/users/${id}`, userData);
      console.log('User updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (id: string): Promise<User> => {
    try {
      console.log(`Deleting user with ID ${id}`);
      const response = await apiClient.delete<User>(`/users/${id}`);
      console.log('User deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
};

export default userService;
