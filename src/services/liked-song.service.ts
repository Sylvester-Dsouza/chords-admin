import apiClient from './api-client';
import { Song } from './playlist.service';

// LikedSong service
const likedSongService = {
  // Get all liked songs for a customer
  getCustomerLikedSongs: async (customerId: string): Promise<Song[]> => {
    try {
      console.log(`Fetching liked songs for customer ${customerId}`);
      const response = await apiClient.get<Song[]>(`/customers/${customerId}/liked-songs`);
      console.log('Liked songs fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching liked songs for customer ${customerId}:`, error);
      throw error;
    }
  },
};

export default likedSongService;
