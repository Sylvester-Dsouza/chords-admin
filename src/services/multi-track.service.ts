import apiClient from './api-client';

export interface MultiTrackSong {
  id: string;
  title: string;
  artistName: string;
  imageUrl?: string | null;
  songKey?: string | null;
  tempo?: number | null;
  difficulty?: string | null;
  viewCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  multiTrack: {
    id: string;
    songId: string;
    vocalsUrl?: string | null;
    bassUrl?: string | null;
    drumsUrl?: string | null;
    otherUrl?: string | null;
    uploadedAt: Date;
    updatedAt: Date;
  };
}

export interface MultiTrackStats {
  totalMultiTrackSongs: number;
  popularSongs: MultiTrackSong[];
  recentSongs: MultiTrackSong[];
}

export interface MultiTrackListResponse {
  songs: MultiTrackSong[];
  total: number;
  page: number;
  limit: number;
}

export interface MultiTrackUploadData {
  vocalsUrl?: string;
  bassUrl?: string;
  drumsUrl?: string;
  otherUrl?: string;
}

export interface MultiTrackDownloadResponse {
  vocalsUrl?: string | null;
  bassUrl?: string | null;
  drumsUrl?: string | null;
  otherUrl?: string | null;
}

const multiTrackService = {
  // Get all multi-track songs
  getMultiTrackSongs: async (params?: {
    search?: string;
    key?: string;
    difficulty?: string;
    artistId?: string;
    sort?: 'popular' | 'recent' | 'title' | 'artist';
    page?: number;
    limit?: number;
  }): Promise<MultiTrackListResponse> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.search) searchParams.append('search', params.search);
      if (params?.key) searchParams.append('key', params.key);
      if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
      if (params?.artistId) searchParams.append('artistId', params.artistId);
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/multi-track/songs?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching multi-track songs:', error);
      throw error;
    }
  },

  // Get multi-track for a specific song
  getMultiTrackBySongId: async (songId: string): Promise<MultiTrackSong['multiTrack']> => {
    try {
      const response = await apiClient.get(`/multi-track/songs/${songId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching multi-track by song ID:', error);
      throw error;
    }
  },

  // Upload/update multi-track URLs for a song
  uploadMultiTrack: async (
    songId: string,
    data: MultiTrackUploadData
  ): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post(`/multi-track/songs/${songId}/upload`, data);
      return response.data;
    } catch (error) {
      console.error('Error uploading multi-track:', error);
      throw error;
    }
  },

  // Update multi-track URLs for a song
  updateMultiTrack: async (
    songId: string,
    data: MultiTrackUploadData
  ): Promise<{ message: string }> => {
    try {
      const response = await apiClient.put(`/multi-track/songs/${songId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating multi-track:', error);
      throw error;
    }
  },

  // Remove multi-track from a song
  removeMultiTrack: async (songId: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete(`/multi-track/songs/${songId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing multi-track:', error);
      throw error;
    }
  },

  // Get multi-track download URLs
  getMultiTrackDownloadUrls: async (songId: string): Promise<MultiTrackDownloadResponse> => {
    try {
      const response = await apiClient.get(`/multi-track/songs/${songId}/download`);
      return response.data;
    } catch (error) {
      console.error('Error getting multi-track download URLs:', error);
      throw error;
    }
  },

  // Track multi-track analytics
  trackAnalytics: async (data: {
    songId: string;
    action: 'download' | 'play' | 'view';
    duration?: number;
  }): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/multi-track/analytics', data);
      return response.data;
    } catch (error) {
      console.error('Error tracking multi-track analytics:', error);
      throw error;
    }
  },

  // Get multi-track statistics (admin only)
  getMultiTrackStats: async (): Promise<MultiTrackStats> => {
    try {
      const response = await apiClient.get('/multi-track/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching multi-track stats:', error);
      throw error;
    }
  },

  // Upload file to storage (helper method)
  uploadFile: async (
    file: File,
    folder: string = 'multi-track',
    entityId?: string
  ): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = entityId 
        ? `/upload/${folder}/${entityId}`
        : `/upload/${folder}`;

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
};

export default multiTrackService;
