import apiClient from './api-client';

// Define types based on the API DTOs
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  website?: string | null;
  socialLinks?: SocialLinks | null;
  createdAt: Date;
  updatedAt: Date;
  // Analytics properties from database
  viewCount?: number;
  uniqueViewers?: number;
  lastViewed?: Date | null;
  // Extended properties added in the UI
  songCount?: number;
  totalViews?: number; // deprecated - use viewCount instead
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface CreateArtistDto {
  name: string;
  bio?: string;
  imageUrl?: string;
  website?: string;
  socialLinks?: SocialLinks;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateArtistDto {
  name?: string;
  bio?: string;
  imageUrl?: string;
  website?: string;
  socialLinks?: SocialLinks;
  isFeatured?: boolean;
  isActive?: boolean;
}

// Artist service
const artistService = {
  // Get all artists
  getAllArtists: async (): Promise<Artist[]> => {
    try {
      console.log('Fetching all artists');
      const response = await apiClient.get<Artist[]>('/artists');
      console.log('Artists fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching artists:', error);
      throw error;
    }
  },

  // Search artists
  searchArtists: async (query: string): Promise<Artist[]> => {
    try {
      console.log(`Searching artists with query: ${query}`);
      const response = await apiClient.get<Artist[]>(`/artists/search?q=${encodeURIComponent(query)}`);
      console.log('Artists search results:', response.data);
      return response.data.map(artist => ({ ...artist, selected: false }));
    } catch (error) {
      console.error('Error searching artists:', error);
      throw error;
    }
  },

  // Get an artist by ID
  getArtistById: async (id: string): Promise<Artist> => {
    try {
      console.log(`Fetching artist with ID ${id}`);
      const response = await apiClient.get<Artist>(`/artists/${id}`);
      console.log('Artist fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching artist with ID ${id}:`, error);
      throw error;
    }
  },

  // Alias for getArtistById to match naming convention used in content management
  getArtist: async (id: string): Promise<Artist> => {
    return artistService.getArtistById(id);
  },

  // Create a new artist
  createArtist: async (artistData: CreateArtistDto): Promise<Artist> => {
    try {
      console.log('Creating new artist with data:', artistData);
      const response = await apiClient.post<Artist>('/artists', artistData);
      console.log('Artist created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating artist:', error);
      throw error;
    }
  },

  // Update an artist
  updateArtist: async (id: string, artistData: UpdateArtistDto): Promise<Artist> => {
    try {
      console.log(`Updating artist with ID ${id} with data:`, artistData);
      const response = await apiClient.patch<Artist>(`/artists/${id}`, artistData);
      console.log('Artist updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating artist with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an artist
  deleteArtist: async (id: string): Promise<Artist> => {
    try {
      console.log(`Deleting artist with ID ${id}`);
      const response = await apiClient.delete<Artist>(`/artists/${id}`);
      console.log('Artist deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting artist with ID ${id}:`, error);
      throw error;
    }
  }
};

export default artistService;
