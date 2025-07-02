import apiClient from './api-client';

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
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

export interface CreateFeatureRequestDto {
  title: string;
  description: string;
  category?: string;
}

export interface UpdateFeatureRequestDto {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'PENDING' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
}

class FeatureRequestService {
  private endpoint = '/feature-requests';

  async getAllFeatureRequests(status?: string): Promise<FeatureRequest[]> {
    const url = status ? `${this.endpoint}?status=${status}` : this.endpoint;
    const response = await apiClient.get<FeatureRequest[]>(url);
    return response.data;
  }

  async getFeatureRequestById(id: string): Promise<FeatureRequest> {
    const response = await apiClient.get<FeatureRequest>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createFeatureRequest(data: CreateFeatureRequestDto): Promise<FeatureRequest> {
    const response = await apiClient.post<FeatureRequest>(this.endpoint, data);
    return response.data;
  }

  async updateFeatureRequest(id: string, data: UpdateFeatureRequestDto): Promise<FeatureRequest> {
    const response = await apiClient.patch<FeatureRequest>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async deleteFeatureRequest(id: string): Promise<FeatureRequest> {
    const response = await apiClient.delete<FeatureRequest>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async upvoteFeatureRequest(id: string): Promise<void> {
    await apiClient.post(`${this.endpoint}/${id}/upvote`);
  }

  async removeUpvote(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}/upvote`);
  }

  async getCustomerFeatureRequests(customerId: string): Promise<FeatureRequest[]> {
    try {
      console.log(`Fetching feature requests for customer ${customerId}`);
      const response = await apiClient.get<FeatureRequest[]>(`/customers/${customerId}/feature-requests`);
      console.log('Feature requests fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feature requests for customer ${customerId}:`, error);
      throw error;
    }
  }
}

export default new FeatureRequestService();
