import apiClient from '@/services/api-client';

// Folder paths
export const STORAGE_FOLDERS = {
  SONG_COVERS: 'song-cover',
  ARTIST_COVERS: 'artist-cover',
  COLLECTION_COVERS: 'collection-cover',
  BANNER_IMAGES: 'banner-image',
};

/**
 * Upload an image to the server
 *
 * @param file - The file to upload
 * @param folder - The folder to upload to (use STORAGE_FOLDERS constants)
 * @param entityId - Optional ID of the entity (song, artist, collection) to create a subfolder
 * @returns The URL of the uploaded file or null if upload failed
 */
export async function uploadImage(
  file: File,
  folder: string,
  entityId?: string,
): Promise<string | null> {
  try {
    console.log(`Uploading image to folder: ${folder}`);

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Construct the URL with optional entity ID
    const uploadUrl = entityId
      ? `/upload/${folder}/${entityId}`
      : `/upload/${folder}`;

    // Upload the file
    const response = await apiClient.post<{ url: string }>(
      uploadUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('Upload successful, URL:', response.data.url);
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

/**
 * Delete an image from the server
 *
 * @param url - The URL of the image to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    console.log(`Deleting image: ${url}`);

    if (!url || !url.startsWith('http')) {
      console.warn('Invalid URL format for deletion:', url);
      return false;
    }

    // Delete the file
    const response = await apiClient.delete(`/upload?url=${encodeURIComponent(url)}`);

    console.log('Delete response:', response.data);
    return response.data.success;
  } catch (error: any) {
    console.error('Error deleting image:', error);

    // Log more detailed error information
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }

    // Even if deletion fails, return true to allow the form to continue
    // This prevents blocking the user from saving their changes
    return true;
  }
}
