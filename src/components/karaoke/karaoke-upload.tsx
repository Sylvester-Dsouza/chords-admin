'use client';

import { useState } from 'react';
import karaokeService from '@/services/karaoke.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Music, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KaraokeUploadProps {
  songId: string;
  songTitle: string;
  artistName: string;
  currentKaraoke?: {
    hasKaraoke: boolean;
    karaokeFileUrl?: string;
    karaokeKey?: string;
    karaokeDuration?: number;
  };
  onUploadSuccess?: () => void;
  onRemoveSuccess?: () => void;
}

export function KaraokeUpload({
  songId,
  songTitle,
  artistName,
  currentKaraoke,
  onUploadSuccess,
  onRemoveSuccess,
}: KaraokeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [karaokeKey, setKaraokeKey] = useState(currentKaraoke?.karaokeKey || '');
  const [karaokeDuration, setKaraokeDuration] = useState(currentKaraoke?.karaokeDuration?.toString() || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const musicKeys = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please select an MP3, WAV, or M4A file.');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size too large. Maximum size is 50MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Try to extract duration from file (if possible)
    const audio = new Audio();
    const url = URL.createObjectURL(selectedFile);
    audio.src = url;
    
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setKaraokeDuration(Math.round(audio.duration).toString());
      }
      URL.revokeObjectURL(url);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a karaoke file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await karaokeService.uploadKaraoke(songId, file, {
        karaokeKey: karaokeKey && karaokeKey.trim() !== '' ? karaokeKey.trim() : undefined,
        karaokeDuration: karaokeDuration && karaokeDuration.trim() !== '' ? parseInt(karaokeDuration.trim()) : undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccess('Karaoke file uploaded successfully!');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('karaoke-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onUploadSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Failed to upload karaoke file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentKaraoke?.hasKaraoke) return;

    setIsRemoving(true);
    setError(null);
    setSuccess(null);

    try {
      await karaokeService.removeKaraoke(songId);

      setSuccess('Karaoke removed successfully!');
      onRemoveSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Failed to remove karaoke');
    } finally {
      setIsRemoving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Karaoke Upload
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">{songTitle}</p>
          <p>by {artistName}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Current Karaoke Status */}
        {currentKaraoke?.hasKaraoke && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  ✅ Karaoke Available
                </p>
                <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                  {currentKaraoke.karaokeKey && <span>Key: {currentKaraoke.karaokeKey}</span>}
                  {currentKaraoke.karaokeDuration && (
                    <span className="ml-3">Duration: {formatDuration(currentKaraoke.karaokeDuration)}</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-600 hover:text-red-700"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="karaoke-file">Karaoke Audio File</Label>
            <div className="mt-1">
              <Input
                id="karaoke-file"
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/mp4"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: MP3, WAV, M4A (Max 50MB)
              </p>
            </div>
          </div>

          {file && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">{file.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="karaoke-key">Key (Optional)</Label>
              <Select value={karaokeKey} onValueChange={setKaraokeKey} disabled={isUploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  {musicKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="karaoke-duration">Duration (seconds)</Label>
              <Input
                id="karaoke-duration"
                type="number"
                value={karaokeDuration}
                onChange={(e) => setKaraokeDuration(e.target.value)}
                placeholder="240"
                disabled={isUploading}
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Karaoke
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
