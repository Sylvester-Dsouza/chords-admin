import apiClient from './api-client';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  bucket: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  usedIn: MediaUsage[];
}

export interface MediaUsage {
  type: 'song' | 'collection' | 'artist' | 'banner' | 'multi_track' | 'vocal_model';
  id: string;
  title: string;
  field: string;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  fileTypes: { [key: string]: number };
  buckets: { [key: string]: number };
  unusedFiles: number;
}

export interface MediaFilters {
  bucket?: string;
  type?: string;
  unused?: boolean;
  search?: string;
}

class MediaService {
  private endpoint = '/media';

  async getAllMediaFiles(filters?: MediaFilters): Promise<MediaFile[]> {
    const params = new URLSearchParams();
    
    if (filters?.bucket) params.append('bucket', filters.bucket);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.unused) params.append('unused', 'true');

    const url = params.toString() ? `${this.endpoint}?${params.toString()}` : this.endpoint;
    const response = await apiClient.get<MediaFile[]>(url);
    
    let files = response.data;

    // Apply client-side search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm) ||
        file.mimeType.toLowerCase().includes(searchTerm) ||
        file.usedIn.some(usage => usage.title.toLowerCase().includes(searchTerm))
      );
    }

    return files;
  }

  async getMediaStats(): Promise<MediaStats> {
    const response = await apiClient.get<MediaStats>(`${this.endpoint}/stats`);
    return response.data;
  }

  async getFileUsage(bucket: string, path: string): Promise<MediaUsage[]> {
    const response = await apiClient.get<MediaUsage[]>(`${this.endpoint}/usage/${bucket}/${path}`);
    return response.data;
  }

  async deleteMediaFile(bucket: string, path: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.endpoint}/${bucket}/${path}`);
    return response.data;
  }

  async bulkDeleteMediaFiles(files: { bucket: string; path: string }[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post<{
      success: number;
      failed: number;
      errors: string[];
    }>(`${this.endpoint}/bulk-delete`, { files });
    return response.data;
  }

  async getStorageBuckets(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.endpoint}/buckets`);
    return response.data;
  }

  async getFileTypes(): Promise<{ [key: string]: number }> {
    const response = await apiClient.get<{ [key: string]: number }>(`${this.endpoint}/file-types`);
    return response.data;
  }

  // Utility functions
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('text')) return '📝';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📁';
  }

  getUsageTypeIcon(type: string): string {
    switch (type) {
      case 'song': return '🎵';
      case 'collection': return '📚';
      case 'artist': return '👤';
      case 'banner': return '🖼️';
      case 'multi_track': return '🎤';
      case 'vocal_model': return '🎙️';
      default: return '📄';
    }
  }

  getUsageTypeColor(type: string): string {
    switch (type) {
      case 'song': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'collection': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'artist': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'banner': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'multi_track': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'vocal_model': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  getBucketColor(bucket: string): string {
    switch (bucket) {
      case 'media': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'multi-track': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'vocal-models': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  generateThumbnailUrl(file: MediaFile): string {
    // For images, return the original URL (you could implement thumbnail generation)
    if (this.isImageFile(file.mimeType)) {
      return file.url;
    }
    
    // For other file types, return a placeholder or icon
    return '';
  }
}

export default new MediaService();
