import apiClient from './api-client';

// Define types based on the API DTOs
export interface Song {
  id: string;
  title: string;
  artistId: string;
  artist?: {
    id: string;
    name: string;
  };
  languageId?: string | null;
  language?: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  key?: string | null;
  tempo?: number | null;
  timeSignature?: string | null;
  difficulty?: string | null;
  chordSheet: string;
  imageUrl?: string | null; // Cover image URL from Supabase Storage
  officialVideoUrl?: string | null; // URL to the official music video
  tutorialVideoUrl?: string | null; // URL to a tutorial video showing how to play the song
  capo?: number; // Capo position
  status?: 'DRAFT' | 'ACTIVE'; // Song status
  tags: string[];
  songTags?: {
    tagId: string;
    tag?: {
      id: string;
      name: string;
      color?: string;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
  // Analytics properties from database
  viewCount?: number;
  uniqueViewers?: number;
  lastViewed?: Date | null;
  // UI-specific properties (deprecated - use viewCount instead)
  views?: number;
  likes?: number;
  // SEO fields
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Karaoke relationship
  karaoke?: {
    id: string;
    songId: string;
    fileUrl: string;
    fileSize?: number | null;
    duration?: number | null;
    key?: string | null;
    uploadedBy?: string | null;
    uploadedAt: Date;
    updatedAt: Date;
    version: number;
    status: string;
    quality?: string | null;
    notes?: string | null;
  } | null;
}

export interface CreateSongDto {
  title: string;
  artistId: string;
  languageId?: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  difficulty?: string;
  chordSheet: string;
  imageUrl?: string;
  officialVideoUrl?: string; // URL to the official music video
  tutorialVideoUrl?: string; // URL to a tutorial video showing how to play the song
  capo?: number; // Capo position
  status?: 'DRAFT' | 'ACTIVE'; // Song status
  tags?: string[];
  metaTitle?: string; // Custom meta title for SEO
  metaDescription?: string; // Custom meta description for SEO
}

export interface UpdateSongDto {
  title?: string;
  artistId?: string;
  languageId?: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  difficulty?: string;
  chordSheet?: string;
  imageUrl?: string;
  officialVideoUrl?: string; // URL to the official music video
  tutorialVideoUrl?: string; // URL to a tutorial video showing how to play the song
  capo?: number; // Capo position
  status?: 'DRAFT' | 'ACTIVE'; // Song status
  tags?: string[];
  metaTitle?: string; // Custom meta title for SEO
  metaDescription?: string; // Custom meta description for SEO
}

// Song service
const songService = {
  // Get all songs
  getAllSongs: async (search?: string, artistId?: string, tags?: string): Promise<Song[]> => {
    try {
      let url = '/songs';
      const params = new URLSearchParams();

      if (search) params.append('search', search);
      if (artistId) params.append('artistId', artistId);
      if (tags) params.append('tags', tags);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      console.log('Fetching songs from:', url);
      const response = await apiClient.get<Song[]>(url);
      console.log('Songs fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  },

  // Get a song by ID
  getSongById: async (id: string): Promise<Song> => {
    try {
      console.log(`Fetching song with ID ${id}`);
      const response = await apiClient.get<Song>(`/songs/${id}`);
      console.log('Song fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching song with ID ${id}:`, error);
      throw error;
    }
  },

  // Alias for getSongById to match naming convention used in content management
  getSong: async (id: string): Promise<Song> => {
    return songService.getSongById(id);
  },

  // Another alias for backward compatibility
  getById: async (id: string): Promise<Song> => {
    return songService.getSongById(id);
  },

  // Search songs
  searchSongs: async (query: string): Promise<Song[]> => {
    try {
      console.log(`Searching songs with query: ${query}`);
      const response = await apiClient.get<Song[]>(`/songs/search?q=${encodeURIComponent(query)}`);
      console.log('Songs search results:', response.data);
      return response.data.map(song => ({ ...song, selected: false }));
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  },

  // Create a new song
  createSong: async (songData: CreateSongDto): Promise<Song> => {
    try {
      console.log('Creating new song with data:', songData);
      const response = await apiClient.post<Song>('/songs', songData);
      console.log('Song created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating song:', error);
      throw error;
    }
  },

  // Update a song
  updateSong: async (id: string, songData: UpdateSongDto): Promise<Song> => {
    try {
      console.log(`Updating song with ID ${id} with data:`, songData);
      const response = await apiClient.patch<Song>(`/songs/${id}`, songData);
      console.log('Song updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating song with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a song
  deleteSong: async (id: string): Promise<Song> => {
    try {
      console.log(`Deleting song with ID ${id}`);
      const response = await apiClient.delete<Song>(`/songs/${id}`);
      console.log('Song deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting song with ID ${id}:`, error);
      throw error;
    }
  },

  // Bulk operations
  bulkUpdateStatus: async (songIds: string[], status: 'DRAFT' | 'ACTIVE'): Promise<void> => {
    try {
      console.log(`Bulk updating status for ${songIds.length} songs to ${status}`);
      await apiClient.patch('/songs/bulk/status', { songIds, status });
      console.log('Bulk status update completed successfully');
    } catch (error) {
      console.error('Error in bulk status update:', error);
      throw error;
    }
  },

  bulkDelete: async (songIds: string[]): Promise<void> => {
    try {
      console.log(`Bulk deleting ${songIds.length} songs`);
      await apiClient.delete('/songs/bulk', { data: { songIds } });
      console.log('Bulk delete completed successfully');
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw error;
    }
  },

  bulkUpdateTags: async (songIds: string[], tagIds: string[]): Promise<void> => {
    try {
      console.log(`Bulk updating tags for ${songIds.length} songs`);
      await apiClient.patch('/songs/bulk/tags', { songIds, tagIds });
      console.log('Bulk tag update completed successfully');
    } catch (error) {
      console.error('Error in bulk tag update:', error);
      throw error;
    }
  },

  // Check if a song exists by title
  checkSongExists: async (title: string): Promise<boolean> => {
    try {
      console.log(`Checking if song with title "${title}" exists`);
      const response = await apiClient.get<{exists: boolean}>(`/songs/exists?title=${encodeURIComponent(title)}`);
      console.log('Song existence check result:', response.data.exists);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking song existence:', error);
      // If there's an error, assume the song doesn't exist
      return false;
    }
  }
};

export default songService;
