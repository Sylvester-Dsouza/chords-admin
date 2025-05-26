import apiClient from './api-client';

// Define types based on the API DTOs
export interface Setlist {
  id: string;
  name: string;
  description?: string | null;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  songs: Song[];
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artist: {
    id: string;
    name: string;
  };
  album?: string | null;
  key?: string | null;
  tempo?: number | null;
  timeSignature?: string | null;
  difficulty?: string | null;
  capo?: number; // Capo position
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Setlist service
const setlistService = {
  // Get all setlists for a customer
  getCustomerSetlists: async (customerId: string): Promise<Setlist[]> => {
    try {
      console.log(`Fetching setlists for customer ${customerId}`);
      const response = await apiClient.get<Setlist[]>(`/customers/${customerId}/setlists`);
      console.log('Setlists fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching setlists for customer ${customerId}:`, error);
      throw error;
    }
  },
};

export default setlistService;
