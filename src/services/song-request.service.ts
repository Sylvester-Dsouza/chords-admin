import apiClient from './api-client';

export interface SongRequest {
  id: string;
  songName: string;
  artistName?: string;
  youtubeLink?: string;
  spotifyLink?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  upvotes: number;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  hasUpvoted?: boolean;
}

export interface CreateSongRequestDto {
  songName: string;
  artistName?: string;
  youtubeLink?: string;
  spotifyLink?: string;
  notes?: string;
}

export interface UpdateSongRequestDto {
  songName?: string;
  artistName?: string;
  youtubeLink?: string;
  spotifyLink?: string;
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
}

class SongRequestService {
  private endpoint = '/song-requests';

  async getAllSongRequests(status?: string): Promise<SongRequest[]> {
    const url = status ? `${this.endpoint}?status=${status}` : this.endpoint;
    const response = await apiClient.get<SongRequest[]>(url);
    return response.data;
  }

  async getSongRequestById(id: string): Promise<SongRequest> {
    const response = await apiClient.get<SongRequest>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createSongRequest(data: CreateSongRequestDto): Promise<SongRequest> {
    const response = await apiClient.post<SongRequest>(this.endpoint, data);
    return response.data;
  }

  async updateSongRequest(id: string, data: UpdateSongRequestDto): Promise<SongRequest> {
    const response = await apiClient.patch<SongRequest>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async deleteSongRequest(id: string): Promise<SongRequest> {
    const response = await apiClient.delete<SongRequest>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async upvoteSongRequest(id: string): Promise<void> {
    await apiClient.post(`${this.endpoint}/${id}/upvote`);
  }

  async removeUpvote(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}/upvote`);
  }

  async getCustomerSongRequests(customerId: string): Promise<SongRequest[]> {
    try {
      console.log(`Fetching song requests for customer ${customerId}`);
      const response = await apiClient.get<SongRequest[]>(`/customers/${customerId}/song-requests`);
      console.log('Song requests fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching song requests for customer ${customerId}:`, error);
      throw error;
    }
  }
}

export default new SongRequestService();
