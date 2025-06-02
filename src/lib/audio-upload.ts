import apiClient from '@/services/api-client';

/**
 * Upload an audio file to the server
 *
 * @param file - The audio file to upload
 * @param folder - The folder to upload to (use STORAGE_FOLDERS.VOCALS)
 * @param entityId - Optional ID of the entity (category) to create a subfolder
 * @returns The URL of the uploaded file or null if upload failed
 */
export async function uploadAudio(
  file: File,
  folder: string,
  entityId?: string,
): Promise<string | null> {
  try {
    console.log(`Uploading audio file to folder: ${folder}`);

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/webm',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(`File size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 50MB`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Construct the URL with optional entity ID
    const uploadUrl = entityId
      ? `/upload/${folder}/${entityId}`
      : `/upload/${folder}`;

    console.log(`Uploading to: ${uploadUrl}`);

    // Upload the file
    const response = await apiClient.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.url) {
      console.log(`Audio uploaded successfully: ${response.data.url}`);
      return response.data.url;
    } else {
      console.error('Upload response missing URL:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
}

/**
 * Delete an audio file from the server
 *
 * @param url - The URL of the file to delete
 * @returns true if deletion was successful, false otherwise
 */
export async function deleteAudio(url: string): Promise<boolean> {
  try {
    console.log(`Deleting audio file: ${url}`);

    const response = await apiClient.delete('/upload/delete', {
      data: { url },
    });

    if (response.status === 200) {
      console.log('Audio deleted successfully');
      return true;
    } else {
      console.error('Failed to delete audio:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error deleting audio:', error);
    return false;
  }
}

/**
 * Get audio file duration in seconds
 *
 * @param file - The audio file
 * @returns Promise that resolves to duration in seconds
 */
export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    });

    audio.src = url;
  });
}

/**
 * Format duration in seconds to MM:SS format
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Validate audio file
 *
 * @param file - The file to validate
 * @returns Object with validation result and error message if any
 */
export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/webm',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Allowed types: MP3, WAV, OGG, AAC, M4A, WebM`,
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 50MB`,
    };
  }

  return { isValid: true };
}
