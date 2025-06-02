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

// Vocal Item Types
export interface VocalItem {
  id: string;
  categoryId: string;
  name: string;
  audioFileUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVocalItemDto {
  categoryId: string;
  name: string;
  audioFileUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateVocalItemDto {
  categoryId?: string;
  name?: string;
  audioFileUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
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
      console.log(`Deleting vocal item: ${id}`);
      await apiClient.delete(`/vocal/items/${id}`);
      console.log('Vocal item deleted successfully');
    } catch (error) {
      console.error(`Error deleting vocal item ${id}:`, error);
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
};

export default vocalService;
