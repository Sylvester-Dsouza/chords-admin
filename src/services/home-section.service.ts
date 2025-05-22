import apiClient from './api-client';

export enum SectionType {
  COLLECTIONS = 'COLLECTIONS',
  SONGS = 'SONGS',
  ARTISTS = 'ARTISTS',
  BANNER = 'BANNER',
  SONG_LIST = 'SONG_LIST'
}

export interface BannerItem {
  id: string;
  homeSectionId: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkType?: string;
  linkId?: string;
  externalUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeSection {
  id: string;
  title: string;
  type: SectionType;
  order: number;
  isActive: boolean;
  itemCount: number;
  filterType?: string;
  itemIds?: string[];
  bannerItems?: BannerItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeSectionDto {
  title: string;
  type: SectionType;
  order?: number;
  isActive?: boolean;
  itemCount?: number;
  filterType?: string;
  itemIds?: string[];
  bannerItems?: Omit<BannerItem, 'id' | 'homeSectionId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateHomeSectionDto {
  title?: string;
  type?: SectionType;
  order?: number;
  isActive?: boolean;
  itemCount?: number;
  filterType?: string;
  itemIds?: string[];
}

export interface CreateBannerItemDto {
  title: string;
  description?: string;
  imageUrl: string;
  linkType?: string;
  linkId?: string;
  externalUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateBannerItemDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkType?: string;
  linkId?: string;
  externalUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface ReorderHomeSectionsDto {
  itemIds: string[];
}

export interface ReorderBannerItemsDto {
  bannerItemIds: string[];
}

class HomeSectionService {
  // Home Section API calls
  async getAllSections(includeInactive = false): Promise<HomeSection[]> {
    const response = await apiClient.get(`/home-sections?includeInactive=${includeInactive}`);
    return response.data;
  }

  async getSection(id: string): Promise<HomeSection> {
    const response = await apiClient.get(`/home-sections/${id}`);
    return response.data;
  }

  async createSection(data: CreateHomeSectionDto): Promise<HomeSection> {
    const response = await apiClient.post('/home-sections', data);
    return response.data;
  }

  async updateSection(id: string, data: UpdateHomeSectionDto): Promise<HomeSection> {
    console.log(`Updating section ${id} with data:`, data);
    const response = await apiClient.patch(`/home-sections/${id}`, data);
    console.log(`API response for section ${id} update:`, response.data);
    return response.data;
  }

  async deleteSection(id: string): Promise<HomeSection> {
    const response = await apiClient.delete(`/home-sections/${id}`);
    return response.data;
  }

  async reorderSections(data: ReorderHomeSectionsDto): Promise<HomeSection[]> {
    // Try a different endpoint for reordering sections
    const response = await apiClient.patch('/home-sections/order', data);
    return response.data;
  }

  // Banner Item API calls
  async getBannerItems(homeSectionId: string, includeInactive = false): Promise<BannerItem[]> {
    const response = await apiClient.get(`/banner-items/section/${homeSectionId}?includeInactive=${includeInactive}`);
    return response.data;
  }

  async getBannerItem(id: string): Promise<BannerItem> {
    const response = await apiClient.get(`/banner-items/${id}`);
    return response.data;
  }

  async createBannerItem(homeSectionId: string, data: CreateBannerItemDto): Promise<BannerItem> {
    const response = await apiClient.post(`/banner-items/${homeSectionId}`, data);
    return response.data;
  }

  async updateBannerItem(id: string, data: UpdateBannerItemDto): Promise<BannerItem> {
    const response = await apiClient.patch(`/banner-items/${id}`, data);
    return response.data;
  }

  async deleteBannerItem(id: string): Promise<BannerItem> {
    const response = await apiClient.delete(`/banner-items/${id}`);
    return response.data;
  }

  async reorderBannerItems(homeSectionId: string, data: ReorderBannerItemsDto): Promise<BannerItem[]> {
    const response = await apiClient.patch(`/banner-items/reorder/${homeSectionId}`, data);
    return response.data;
  }
}

export default new HomeSectionService();
