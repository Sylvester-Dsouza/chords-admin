import apiClient from './api-client';

export interface KaraokeSong {
  id: string;
  title: string;
  artistName: string;
  karaokeFileUrl: string;
  karaokeFileSize: number;
  karaokeDuration: number;
  karaokeKey?: string | null;
  karaokeUploadedAt: Date;
  imageUrl?: string | null;
  key?: string | null;
  tempo?: number | null;
  difficulty?: string | null;
  viewCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
}

export interface KaraokeStats {
  totalKaraokeSongs: number;
  totalDownloads: number;
  totalPlays: number;
  totalStorageUsed: number;
  popularSongs: KaraokeSong[];
  recentSongs: KaraokeSong[];
}

export interface KaraokeListResponse {
  songs: KaraokeSong[];
  total: number;
  page: number;
  limit: number;
}

export interface KaraokeUploadData {
  karaokeKey?: string;
  karaokeDuration?: number;
}

const karaokeService = {
  // Get all karaoke songs
  getKaraokeSongs: async (params?: {
    search?: string;
    key?: string;
    difficulty?: string;
    artistId?: string;
    sort?: 'popular' | 'recent' | 'title' | 'artist';
    page?: number;
    limit?: number;
  }): Promise<KaraokeListResponse> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.search) searchParams.append('search', params.search);
      if (params?.key) searchParams.append('key', params.key);
      if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
      if (params?.artistId) searchParams.append('artistId', params.artistId);
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `/karaoke/songs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching karaoke songs:', error);
      throw error;
    }
  },

  // Get popular karaoke songs
  getPopularKaraokeSongs: async (limit: number = 10): Promise<{ songs: KaraokeSong[] }> => {
    try {
      const response = await apiClient.get(`/karaoke/songs/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular karaoke songs:', error);
      throw error;
    }
  },

  // Get recent karaoke songs
  getRecentKaraokeSongs: async (limit: number = 10): Promise<{ songs: KaraokeSong[] }> => {
    try {
      const response = await apiClient.get(`/karaoke/songs/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent karaoke songs:', error);
      throw error;
    }
  },

  // Upload karaoke file for a song
  uploadKaraoke: async (
    songId: string,
    file: File,
    data: KaraokeUploadData
  ): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      formData.append('karaokeFile', file);

      // Use the correct field names that match the server-side DTO
      if (data.karaokeKey && data.karaokeKey.trim() !== '') {
        formData.append('key', data.karaokeKey.trim());
      }

      if (data.karaokeDuration && data.karaokeDuration > 0) {
        formData.append('duration', data.karaokeDuration.toString());
      }

      const response = await apiClient.post(`/karaoke/songs/${songId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading karaoke:', error);
      throw error;
    }
  },

  // Remove karaoke from a song
  removeKaraoke: async (songId: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete(`/karaoke/songs/${songId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing karaoke:', error);
      throw error;
    }
  },

  // Get karaoke download URL
  getKaraokeDownloadUrl: async (songId: string): Promise<{
    downloadUrl: string;
    fileSize: number;
    duration: number;
  }> => {
    try {
      const response = await apiClient.get(`/karaoke/songs/${songId}/download`);
      return response.data;
    } catch (error) {
      console.error('Error getting karaoke download URL:', error);
      throw error;
    }
  },

  // Track karaoke analytics
  trackAnalytics: async (data: {
    songId: string;
    action: 'download' | 'play' | 'complete';
    duration?: number;
  }): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/karaoke/analytics', data);
      return response.data;
    } catch (error) {
      console.error('Error tracking karaoke analytics:', error);
      throw error;
    }
  },

  // Get karaoke statistics (admin only)
  getKaraokeStats: async (): Promise<KaraokeStats> => {
    try {
      const response = await apiClient.get('/karaoke/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching karaoke stats:', error);
      throw error;
    }
  },
};

export default karaokeService;
