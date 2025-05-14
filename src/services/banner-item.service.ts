import apiClient from './api-client';

export enum LinkType {
  NONE = 'none',
  SONG = 'song',
  ARTIST = 'artist',
  COLLECTION = 'collection',
  EXTERNAL = 'external'
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

export interface ReorderBannerItemsDto {
  bannerItemIds: string[];
}

class BannerItemService {
  async getBannerItemsBySection(homeSectionId: string, includeInactive = false): Promise<BannerItem[]> {
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

export default new BannerItemService();
