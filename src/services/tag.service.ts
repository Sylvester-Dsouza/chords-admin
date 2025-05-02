import apiClient from './api-client';

// Define types based on the API DTOs
export interface Tag {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Entity type flags
  forSongs?: boolean;
  forArtists?: boolean;
  forCollections?: boolean;
}

export interface CreateTagDto {
  name: string;
  description?: string;
  color?: string;
  forSongs?: boolean;
  forArtists?: boolean;
  forCollections?: boolean;
}

export interface UpdateTagDto {
  name?: string;
  description?: string;
  color?: string;
  forSongs?: boolean;
  forArtists?: boolean;
  forCollections?: boolean;
}

export interface SongTagDto {
  songId: string;
  tagId: string;
}

export interface ArtistTagDto {
  artistId: string;
  tagId: string;
}

export interface CollectionTagDto {
  collectionId: string;
  tagId: string;
}

// Tag service
const tagService = {
  // Get all tags
  getAllTags: async (search?: string): Promise<Tag[]> => {
    try {
      console.log('Fetching all tags');
      const response = await apiClient.get<Tag[]>('/tags', {
        params: { search },
      });
      console.log('Tags fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Return empty array instead of throwing to prevent form loading failures
      return [];
    }
  },

  // Get a tag by ID
  getTagById: async (id: string): Promise<Tag> => {
    try {
      console.log(`Fetching tag with ID ${id}`);
      const response = await apiClient.get<Tag>(`/tags/${id}`);
      console.log('Tag fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tag with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new tag
  createTag: async (tagData: CreateTagDto): Promise<Tag> => {
    try {
      console.log('Creating new tag with data:', tagData);
      const response = await apiClient.post<Tag>('/tags', tagData);
      console.log('Tag created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  // Update a tag
  updateTag: async (id: string, tagData: UpdateTagDto): Promise<Tag> => {
    try {
      console.log(`Updating tag with ID ${id} with data:`, tagData);
      const response = await apiClient.patch<Tag>(`/tags/${id}`, tagData);
      console.log('Tag updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating tag with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a tag
  deleteTag: async (id: string): Promise<Tag> => {
    try {
      console.log(`Deleting tag with ID ${id}`);
      const response = await apiClient.delete<Tag>(`/tags/${id}`);
      console.log('Tag deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting tag with ID ${id}:`, error);
      throw error;
    }
  },

  // Add a tag to a song
  addTagToSong: async (songId: string, tagId: string): Promise<void> => {
    try {
      console.log(`Adding tag ${tagId} to song ${songId}`);
      // Log the full request details for debugging
      console.log('Request details:', { url: '/tags/song', data: { songId, tagId } });
      await apiClient.post('/tags/song', { songId, tagId });
      console.log('Tag added to song successfully');
    } catch (error) {
      console.error(`Error adding tag ${tagId} to song ${songId}:`, error);
      throw error;
    }
  },

  // Remove a tag from a song
  removeTagFromSong: async (songId: string, tagId: string): Promise<void> => {
    try {
      console.log(`Removing tag ${tagId} from song ${songId}`);
      // Log the full request details for debugging
      console.log('Request details:', { url: '/tags/song', data: { songId, tagId } });
      await apiClient.delete('/tags/song', { data: { songId, tagId } });
      console.log('Tag removed from song successfully');
    } catch (error) {
      console.error(`Error removing tag ${tagId} from song ${songId}:`, error);
      throw error;
    }
  },

  // Get all tags for a song
  getSongTags: async (songId: string): Promise<Tag[]> => {
    try {
      console.log(`Fetching tags for song ${songId}`);
      // Log the full request details for debugging
      console.log('Request details:', { url: `/tags/song/${songId}` });
      const response = await apiClient.get<Tag[]>(`/tags/song/${songId}`);
      console.log('Song tags fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tags for song ${songId}:`, error);
      // Return empty array instead of throwing to prevent form loading failures
      console.log('Returning empty array as fallback');
      return [];
    }
  },

  // Get all songs for a tag
  getTagSongs: async (tagId: string): Promise<string[]> => {
    try {
      console.log(`Fetching songs for tag ${tagId}`);
      const response = await apiClient.get<string[]>(`/tags/${tagId}/songs`);
      console.log('Tag songs fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching songs for tag ${tagId}:`, error);
      throw error;
    }
  },

  // Artist tag methods
  // Add a tag to an artist
  addTagToArtist: async (artistId: string, tagId: string): Promise<void> => {
    try {
      console.log(`Adding tag ${tagId} to artist ${artistId}`);
      await apiClient.post('/tags/artist', { artistId, tagId });
      console.log('Tag added to artist successfully');
    } catch (error) {
      console.error(`Error adding tag ${tagId} to artist ${artistId}:`, error);
      throw error;
    }
  },

  // Remove a tag from an artist
  removeTagFromArtist: async (artistId: string, tagId: string): Promise<void> => {
    try {
      console.log(`Removing tag ${tagId} from artist ${artistId}`);
      await apiClient.delete('/tags/artist', { data: { artistId, tagId } });
      console.log('Tag removed from artist successfully');
    } catch (error) {
      console.error(`Error removing tag ${tagId} from artist ${artistId}:`, error);
      throw error;
    }
  },

  // Get all tags for an artist
  getArtistTags: async (artistId: string): Promise<Tag[]> => {
    try {
      console.log(`Fetching tags for artist ${artistId}`);
      const response = await apiClient.get<Tag[]>(`/tags/artist/${artistId}`);
      console.log('Artist tags fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tags for artist ${artistId}:`, error);
      throw error;
    }
  },

  // Get all artists for a tag
  getTagArtists: async (tagId: string): Promise<string[]> => {
    try {
      console.log(`Fetching artists for tag ${tagId}`);
      const response = await apiClient.get<string[]>(`/tags/${tagId}/artists`);
      console.log('Tag artists fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching artists for tag ${tagId}:`, error);
      throw error;
    }
  },

  // Collection tag methods
  // Add a tag to a collection
  addTagToCollection: async (collectionId: string, tagId: string): Promise<void> => {
    try {
      console.log(`Adding tag ${tagId} to collection ${collectionId}`);
      await apiClient.post('/tags/collection', { collectionId, tagId });
      console.log('Tag added to collection successfully');
    } catch (error) {
      console.error(`Error adding tag ${tagId} to collection ${collectionId}:`, error);
      throw error;
    }
  },

  // Remove a tag from a collection
  removeTagFromCollection: async (collectionId: string, tagId: string): Promise<void> => {
    try {
      console.log(`Removing tag ${tagId} from collection ${collectionId}`);
      await apiClient.delete('/tags/collection', { data: { collectionId, tagId } });
      console.log('Tag removed from collection successfully');
    } catch (error) {
      console.error(`Error removing tag ${tagId} from collection ${collectionId}:`, error);
      throw error;
    }
  },

  // Get all tags for a collection
  getCollectionTags: async (collectionId: string): Promise<Tag[]> => {
    try {
      console.log(`Fetching tags for collection ${collectionId}`);
      const response = await apiClient.get<Tag[]>(`/tags/collection/${collectionId}`);
      console.log('Collection tags fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tags for collection ${collectionId}:`, error);
      throw error;
    }
  },

  // Get all collections for a tag
  getTagCollections: async (tagId: string): Promise<string[]> => {
    try {
      console.log(`Fetching collections for tag ${tagId}`);
      const response = await apiClient.get<string[]>(`/tags/${tagId}/collections`);
      console.log('Tag collections fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching collections for tag ${tagId}:`, error);
      throw error;
    }
  }
};

export default tagService;
