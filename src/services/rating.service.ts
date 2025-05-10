import apiClient from './api-client';

// Define types based on the API DTOs
export interface SongRating {
  id: string;
  songId: string;
  customerId: string;
  rating: number; // 1-5 star rating
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Extended properties with relations
  song?: {
    id: string;
    title: string;
    artist: {
      id: string;
      name: string;
    };
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
}

export interface RatingStats {
  averageRating: number;
  ratingCount: number;
  distribution: {
    [key: string]: number;
  };
}

export interface RatingFilters {
  songId?: string;
  customerId?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string; // Added for search functionality
}

export interface RatingResponse {
  data: SongRating[];
  total: number;
  page: number;
  limit: number;
}

// Rating service
const ratingService = {
  // Get all ratings with optional filters
  getAllRatings: async (filters: RatingFilters = {}): Promise<RatingResponse> => {
    try {
      console.log('Fetching ratings with filters:', filters);

      // Add detailed logging for debugging
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

      // Try both with and without the /api prefix to handle potential routing issues
      let response;

      // First, try a direct fetch to debug
      try {
        console.log('Trying direct fetch to debug API connection...');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const directResponse = await fetch(`${baseUrl}/song-ratings/public?page=${filters.page || 1}&limit=${filters.limit || 10}`);
        const directData = await directResponse.json();
        console.log('Direct fetch response:', { status: directResponse.status, data: directData });
      } catch (directErr) {
        console.error('Direct fetch failed:', directErr);
      }

      // Now try with axios using the public endpoint
      try {
        console.log('Using public endpoint for ratings');
        response = await apiClient.get<RatingResponse>('/song-ratings/public', {
          params: filters,
          timeout: 10000
        });
      } catch (err) {
        console.log('Trying with /api prefix...');
        response = await apiClient.get<RatingResponse>('/api/song-ratings/public', {
          params: filters,
          timeout: 10000
        });
      }

      console.log('Ratings API response status:', response.status);
      console.log('Ratings fetched successfully:', response.data);

      // If the response doesn't match the expected format, log it
      if (!response.data.data || !Array.isArray(response.data.data)) {
        console.warn('Unexpected response format:', response.data);
        // Return a default response to prevent errors
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 10
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      // Return a default response to prevent the UI from breaking
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  },

  // Get a rating by ID
  getRatingById: async (id: string): Promise<SongRating> => {
    try {
      console.log(`Fetching rating with ID ${id}`);
      const response = await apiClient.get<SongRating>(`/song-ratings/${id}`);
      console.log('Rating fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rating with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all ratings for a song
  getRatingsForSong: async (songId: string): Promise<SongRating[]> => {
    try {
      console.log(`Fetching ratings for song with ID ${songId}`);
      const response = await apiClient.get<SongRating[]>(`/song-ratings/songs/${songId}`);
      console.log('Ratings for song fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ratings for song with ID ${songId}:`, error);
      throw error;
    }
  },

  // Get rating statistics for a song
  getRatingStatsForSong: async (songId: string): Promise<RatingStats> => {
    try {
      console.log(`Fetching rating statistics for song with ID ${songId}`);
      const response = await apiClient.get<RatingStats>(`/song-ratings/songs/${songId}/stats`);
      console.log('Rating statistics fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rating statistics for song with ID ${songId}:`, error);
      throw error;
    }
  },

  // Get all ratings by a customer
  getRatingsByCustomer: async (customerId: string): Promise<SongRating[]> => {
    try {
      console.log(`Fetching ratings by customer with ID ${customerId}`);
      const response = await apiClient.get<SongRating[]>(`/song-ratings/customers/${customerId}`);
      console.log('Ratings by customer fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ratings by customer with ID ${customerId}:`, error);
      throw error;
    }
  },

  // Delete a rating
  deleteRating: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting rating with ID ${id}`);
      await apiClient.delete(`/song-ratings/${id}`);
      console.log('Rating deleted successfully');
    } catch (error) {
      console.error(`Error deleting rating with ID ${id}:`, error);
      throw error;
    }
  },

  // Get rating statistics
  getRatingStats: async (): Promise<{
    totalRatings: number;
    averageRating: number;
    highestRatedSongs: {
      id: string;
      title: string;
      artist: string;
      averageRating: number;
      ratingCount: number;
    }[];
  }> => {
    try {
      console.log('Fetching rating statistics');

      // Add detailed logging for debugging
      console.log('Stats API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/song-ratings/stats`);

      // Try both with and without the /api prefix to handle potential routing issues
      let response;
      try {
        console.log('Using public endpoint for stats');
        response = await apiClient.get('/song-ratings/public-stats', {
          timeout: 10000
        });
      } catch (err) {
        console.log('Trying stats with /api prefix...');
        response = await apiClient.get('/api/song-ratings/public-stats', {
          timeout: 10000
        });
      }

      console.log('Rating statistics API response status:', response.status);
      console.log('Rating statistics fetched successfully:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching rating statistics:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      // Return default values
      return {
        totalRatings: 0,
        averageRating: 0,
        highestRatedSongs: [],
      };
    }
  }
};

export default ratingService;
