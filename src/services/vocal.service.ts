import apiClient from './api-client';

// Enums
export enum VocalType {
  WARMUP = 'WARMUP',
  EXERCISE = 'EXERCISE',
}

// Vocal Category Types
export interface VocalCategory {
  id: string;
  name: string;
  type: VocalType;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemCount?: number;
}

export interface CreateVocalCategoryDto {
  name: string;
  type: VocalType;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateVocalCategoryDto {
  name?: string;
  type?: VocalType;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface VocalCategoryWithItems extends VocalCategory {
  items: VocalItem[];
}

// Vocal Audio File Types
export interface VocalLibrary {
  id: string;
  name: string;
  fileName: string;
  audioFileUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  tags: string[];
  description: string;
  categoryId: string | null;
  displayOrder: number;
  uploadedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface CreateVocalLibraryDto {
  name: string;
  fileName: string;
  audioFileUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  tags?: string[];
  description?: string;
  isActive?: boolean;
}

export interface UpdateVocalLibraryDto {
  name?: string;
  fileName?: string;
  audioFileUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  tags?: string[];
  description?: string;
  isActive?: boolean;
}

// Vocal Item Types (Updated for centralized audio library)
export interface VocalItem {
  id: string;
  categoryId?: string | null; // Optional - items can exist without category
  audioFileId: string;
  name?: string; // Optional override
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  audioFile?: VocalLibrary; // Included when fetched with relations
  category?: VocalCategory; // Optional category relation
}

export interface CreateVocalItemDto {
  categoryId?: string; // Optional - items can exist without category
  audioFileId: string;
  name?: string; // Optional override
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateVocalItemDto {
  categoryId?: string | null;
  audioFileId?: string;
  name?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Reorder DTOs
export interface ReorderVocalCategoriesDto {
  categoryIds: string[];
}

export interface ReorderVocalItemsDto {
  itemIds: string[];
}

// Vocal service
const vocalService = {
  // Category methods
  getAllCategories: async (type?: VocalType, onlyActive?: boolean): Promise<VocalCategory[]> => {
    try {
      console.log('Fetching all vocal categories');
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (onlyActive !== undefined) params.append('onlyActive', onlyActive.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/vocal/categories?${queryString}` : '/vocal/categories';
      
      const response = await apiClient.get<VocalCategory[]>(url);
      console.log('Vocal categories fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching vocal categories:', error);
      throw error;
    }
  },

  getCategoryById: async (id: string): Promise<VocalCategory> => {
    try {
      console.log(`Fetching vocal category with ID: ${id}`);
      const response = await apiClient.get<VocalCategory>(`/vocal/categories/${id}`);
      console.log('Vocal category fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vocal category ${id}:`, error);
      throw error;
    }
  },

  getCategoryWithItems: async (id: string): Promise<VocalCategoryWithItems> => {
    try {
      console.log(`Fetching vocal category with items for ID: ${id}`);
      const response = await apiClient.get<VocalCategoryWithItems>(`/vocal/categories/${id}/with-items`);
      console.log('Vocal category with items fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vocal category with items ${id}:`, error);
      throw error;
    }
  },

  createCategory: async (categoryData: CreateVocalCategoryDto): Promise<VocalCategory> => {
    try {
      console.log('Creating vocal category:', categoryData);
      const response = await apiClient.post<VocalCategory>('/vocal/categories', categoryData);
      console.log('Vocal category created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating vocal category:', error);
      throw error;
    }
  },

  updateCategory: async (id: string, categoryData: UpdateVocalCategoryDto): Promise<VocalCategory> => {
    try {
      console.log(`Updating vocal category ${id}:`, categoryData);
      const response = await apiClient.patch<VocalCategory>(`/vocal/categories/${id}`, categoryData);
      console.log('Vocal category updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating vocal category ${id}:`, error);
      throw error;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting vocal category: ${id}`);
      await apiClient.delete(`/vocal/categories/${id}`);
      console.log('Vocal category deleted successfully');
    } catch (error) {
      console.error(`Error deleting vocal category ${id}:`, error);
      throw error;
    }
  },

  reorderCategories: async (reorderData: ReorderVocalCategoriesDto): Promise<void> => {
    try {
      console.log('Reordering vocal categories:', reorderData);
      await apiClient.post('/vocal/categories/reorder', reorderData);
      console.log('Vocal categories reordered successfully');
    } catch (error) {
      console.error('Error reordering vocal categories:', error);
      throw error;
    }
  },

  // Item methods
  getAllItems: async (categoryId?: string, onlyActive?: boolean): Promise<VocalItem[]> => {
    try {
      console.log('Fetching all vocal items');
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (onlyActive !== undefined) params.append('onlyActive', onlyActive.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/vocal/items?${queryString}` : '/vocal/items';
      
      const response = await apiClient.get<VocalItem[]>(url);
      console.log('Vocal items fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching vocal items:', error);
      throw error;
    }
  },

  getItemById: async (id: string): Promise<VocalItem> => {
    try {
      console.log(`Fetching vocal item with ID: ${id}`);
      const response = await apiClient.get<VocalItem>(`/vocal/items/${id}`);
      console.log('Vocal item fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vocal item ${id}:`, error);
      throw error;
    }
  },

  createItem: async (itemData: CreateVocalItemDto): Promise<VocalItem> => {
    try {
      console.log('Creating vocal item:', itemData);
      const response = await apiClient.post<VocalItem>('/vocal/items', itemData);
      console.log('Vocal item created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating vocal item:', error);
      throw error;
    }
  },

  updateItem: async (id: string, itemData: UpdateVocalItemDto): Promise<VocalItem> => {
    try {
      console.log(`Updating vocal item ${id}:`, itemData);
      const response = await apiClient.patch<VocalItem>(`/vocal/items/${id}`, itemData);
      console.log('Vocal item updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating vocal item ${id}:`, error);
      throw error;
    }
  },

  deleteItem: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting vocal library item: ${id}`);
      await apiClient.delete(`/vocal/audio-files/${id}`);
      console.log('Vocal library item deleted successfully');
    } catch (error) {
      console.error(`Error deleting vocal library item ${id}:`, error);
      throw error;
    }
  },

  reorderItems: async (categoryId: string, reorderData: ReorderVocalItemsDto): Promise<void> => {
    try {
      console.log(`Reordering vocal items in category ${categoryId}:`, reorderData);
      await apiClient.post(`/vocal/categories/${categoryId}/items/reorder`, reorderData);
      console.log('Vocal items reordered successfully');
    } catch (error) {
      console.error(`Error reordering vocal items in category ${categoryId}:`, error);
      throw error;
    }
  },

  // Audio File methods (Centralized Audio Library)
  getAllAudioFiles: async (onlyActive?: boolean): Promise<VocalLibrary[]> => {
    try {
      console.log('Fetching all vocal audio files');
      const params = new URLSearchParams();
      if (onlyActive !== undefined) params.append('onlyActive', onlyActive.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/vocal/audio-files?${queryString}` : '/vocal/audio-files';
      
      const response = await apiClient.get<VocalLibrary[]>(url);
      console.log('Vocal audio files fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching vocal audio files:', error);
      throw error;
    }
  },

  searchAudioFiles: async (search: string, tags?: string[]): Promise<VocalLibrary[]> => {
    try {
      console.log('Searching vocal audio files:', { search, tags });
      const params = new URLSearchParams();
      params.append('search', search);
      if (tags && tags.length > 0) {
        tags.forEach(tag => params.append('tags', tag));
      }
      
      const response = await apiClient.get<VocalLibrary[]>(`/vocal/audio-files?${params.toString()}`);
      console.log('Vocal audio files search results:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching vocal audio files:', error);
      throw error;
    }
  },

  getAudioFileById: async (id: string): Promise<VocalLibrary> => {
    try {
      console.log(`Fetching vocal audio file with ID: ${id}`);
      const response = await apiClient.get<VocalLibrary>(`/vocal/audio-files/${id}`);
      console.log('Vocal audio file fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vocal audio file ${id}:`, error);
      throw error;
    }
  },

  createAudioFile: async (audioFileData: CreateVocalLibraryDto): Promise<VocalLibrary> => {
    try {
      console.log('Creating vocal audio file:', audioFileData);
      const response = await apiClient.post<VocalLibrary>('/vocal/audio-files', audioFileData);
      console.log('Vocal audio file created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating vocal audio file:', error);
      throw error;
    }
  },

  updateAudioFile: async (id: string, audioFileData: UpdateVocalLibraryDto): Promise<VocalLibrary> => {
    try {
      console.log(`Updating vocal audio file ${id}:`, audioFileData);
      const response = await apiClient.patch<VocalLibrary>(`/vocal/audio-files/${id}`, audioFileData);
      console.log('Vocal audio file updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating vocal audio file ${id}:`, error);
      throw error;
    }
  },

  deleteAudioFile: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting vocal audio file: ${id}`);
      await apiClient.delete(`/vocal/audio-files/${id}`);
      console.log('Vocal audio file deleted successfully');
    } catch (error) {
      console.error(`Error deleting vocal audio file ${id}:`, error);
      throw error;
    }
  },

  uploadAudioFile: async (
    file: File,
    metadata: {
      name?: string;
      description?: string;
      tags?: string;
    }
  ): Promise<VocalLibrary> => {
    try {
      console.log('Uploading vocal audio file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      if (metadata.name) formData.append('name', metadata.name);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', metadata.tags);

      const response = await apiClient.post<VocalLibrary>('/vocal/audio-files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Vocal audio file uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading vocal audio file:', error);
      throw error;
    }
  },
};

export default vocalService;
