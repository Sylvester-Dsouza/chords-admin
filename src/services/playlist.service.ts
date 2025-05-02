import apiClient from './api-client';

// Define types based on the API DTOs
export interface Playlist {
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

// Playlist service
const playlistService = {
  // Get all playlists for a customer
  getCustomerPlaylists: async (customerId: string): Promise<Playlist[]> => {
    try {
      console.log(`Fetching playlists for customer ${customerId}`);
      const response = await apiClient.get<Playlist[]>(`/customers/${customerId}/playlists`);
      console.log('Playlists fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching playlists for customer ${customerId}:`, error);
      throw error;
    }
  },
};

export default playlistService;
