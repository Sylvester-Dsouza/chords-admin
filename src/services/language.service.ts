import apiClient from './api-client';

// Define types based on the API DTOs
export interface Language {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLanguageDto {
  name: string;
  isActive?: boolean;
}

export interface UpdateLanguageDto {
  name?: string;
  isActive?: boolean;
}

// Language service
const languageService = {
  // Get all languages
  getAllLanguages: async (onlyActive?: boolean): Promise<Language[]> => {
    try {
      let url = '/languages';
      if (onlyActive !== undefined) {
        url += `?onlyActive=${onlyActive}`;
      }
      
      console.log('Fetching languages from:', url);
      const response = await apiClient.get<Language[]>(url);
      console.log('Languages fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  },

  // Get a language by ID
  getLanguage: async (id: string): Promise<Language> => {
    try {
      console.log(`Fetching language with ID ${id}`);
      const response = await apiClient.get<Language>(`/languages/${id}`);
      console.log('Language fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching language with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new language
  createLanguage: async (data: CreateLanguageDto): Promise<Language> => {
    try {
      console.log('Creating language with data:', data);
      const response = await apiClient.post<Language>('/languages', data);
      console.log('Language created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating language:', error);
      throw error;
    }
  },

  // Update a language
  updateLanguage: async (id: string, data: UpdateLanguageDto): Promise<Language> => {
    try {
      console.log(`Updating language with ID ${id} with data:`, data);
      const response = await apiClient.patch<Language>(`/languages/${id}`, data);
      console.log('Language updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating language with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a language
  deleteLanguage: async (id: string): Promise<Language> => {
    try {
      console.log(`Deleting language with ID ${id}`);
      const response = await apiClient.delete<Language>(`/languages/${id}`);
      console.log('Language deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting language with ID ${id}:`, error);
      throw error;
    }
  }
};

export default languageService;
