import apiClient from './api-client';

// Define types based on the API DTOs
export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  songIds?: string[];
  songs?: {
    id: string;
    title: string;
    artist?: {
      id: string;
      name: string;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
  isActive?: boolean;
  // Analytics properties from database
  viewCount?: number;
  uniqueViewers?: number;
  lastViewed?: Date | null;
  // Extended properties added in the UI
  songCount?: number;
  totalViews?: number; // deprecated - use viewCount instead
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface AddSongToCollectionDto {
  songId: string;
}

// Collection service
const collectionService = {
  // Get all collections
  getAllCollections: async (): Promise<Collection[]> => {
    try {
      console.log('Fetching all collections');
      const response = await apiClient.get<Collection[]>('/collections');
      console.log('Collections fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  // Get a collection by ID
  getCollectionById: async (id: string): Promise<Collection> => {
    try {
      console.log(`Fetching collection with ID ${id}`);
      const response = await apiClient.get<Collection>(`/collections/${id}`);
      console.log('Collection fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching collection with ID ${id}:`, error);
      throw error;
    }
  },

  // Alias for getCollectionById to match naming convention used in content management
  getCollection: async (id: string): Promise<Collection> => {
    return collectionService.getCollectionById(id);
  },

  // Search collections
  searchCollections: async (query: string): Promise<Collection[]> => {
    try {
      console.log(`Searching collections with query: ${query}`);
      const response = await apiClient.get<Collection[]>(`/collections/search?q=${encodeURIComponent(query)}`);
      console.log('Collections search results:', response.data);
      return response.data.map(collection => ({ ...collection, selected: false }));
    } catch (error) {
      console.error('Error searching collections:', error);
      throw error;
    }
  },

  // Create a new collection
  createCollection: async (collectionData: CreateCollectionDto): Promise<Collection> => {
    try {
      console.log('Creating new collection with data:', collectionData);
      const response = await apiClient.post<Collection>('/collections', collectionData);
      console.log('Collection created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  },

  // Update a collection
  updateCollection: async (id: string, collectionData: UpdateCollectionDto): Promise<Collection> => {
    try {
      console.log(`Updating collection with ID ${id} with data:`, collectionData);
      const response = await apiClient.patch<Collection>(`/collections/${id}`, collectionData);
      console.log('Collection updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating collection with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a collection
  deleteCollection: async (id: string): Promise<Collection> => {
    try {
      console.log(`Deleting collection with ID ${id}`);
      const response = await apiClient.delete<Collection>(`/collections/${id}`);
      console.log('Collection deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting collection with ID ${id}:`, error);
      throw error;
    }
  },

  // Add a song to a collection
  addSongToCollection: async (collectionId: string, songId: string): Promise<Collection> => {
    try {
      console.log(`Adding song ${songId} to collection ${collectionId}`);
      const response = await apiClient.post<Collection>(`/collections/${collectionId}/songs`, { songId });
      console.log('Song added to collection successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding song to collection:`, error);
      throw error;
    }
  },

  // Remove a song from a collection
  removeSongFromCollection: async (collectionId: string, songId: string): Promise<Collection> => {
    try {
      console.log(`Removing song ${songId} from collection ${collectionId}`);
      const response = await apiClient.delete<Collection>(`/collections/${collectionId}/songs/${songId}`);
      console.log('Song removed from collection successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error removing song from collection:`, error);
      throw error;
    }
  }
};

export default collectionService;
