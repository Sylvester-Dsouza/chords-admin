'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, X, Music, Guitar, Drum, Volume2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import multiTrackService from '@/services/multi-track.service'
import songService from '@/services/song.service'

interface TrackFile {
  file: File | null
  preview: string | null
  duration: number | null
  uploading: boolean
  progress: number
  existingUrl?: string | null
}

interface MultiTrackUploadProps {
  songId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const trackTypes = [
  { key: 'vocals', label: 'Vocals', icon: Music, color: 'text-blue-500' },
  { key: 'bass', label: 'Bass', icon: Guitar, color: 'text-green-500' },
  { key: 'drums', label: 'Drums', icon: Drum, color: 'text-red-500' },
  { key: 'other', label: 'Other', icon: Volume2, color: 'text-purple-500' },
]

export default function MultiTrackUpload({ songId, onSuccess, onCancel }: MultiTrackUploadProps) {
  const [tracks, setTracks] = useState<{ [key: string]: TrackFile }>({
    vocals: { file: null, preview: null, duration: null, uploading: false, progress: 0 },
    bass: { file: null, preview: null, duration: null, uploading: false, progress: 0 },
    drums: { file: null, preview: null, duration: null, uploading: false, progress: 0 },
    other: { file: null, preview: null, duration: null, uploading: false, progress: 0 },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadExistingMultiTrack()
  }, [songId])

  const loadExistingMultiTrack = async () => {
    try {
      const song = await songService.getById(songId)
      
      if (song.multiTrack) {
        console.log('Found existing multi-track:', song.multiTrack)
        
        // Update tracks with existing URLs
        const updatedTracks = { ...tracks }
        updatedTracks.vocals.existingUrl = song.multiTrack.vocalsUrl
        updatedTracks.bass.existingUrl = song.multiTrack.bassUrl
        updatedTracks.drums.existingUrl = song.multiTrack.drumsUrl
        updatedTracks.other.existingUrl = song.multiTrack.otherUrl
        
        setTracks(updatedTracks)
      }
    } catch (error) {
      console.error('Error loading existing multi-track:', error)
    }
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
      audio.onerror = () => {
        reject(new Error('Failed to load audio metadata'))
      }
      audio.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (trackType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'audio/aac']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select an audio file.')
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 50MB.')
      return
    }

    try {
      // Get audio duration
      const audioDuration = await getAudioDuration(file)

      // Create preview URL
      const preview = URL.createObjectURL(file)

      setTracks(prev => ({
        ...prev,
        [trackType]: {
          file,
          preview,
          duration: audioDuration,
          uploading: false,
          progress: 0,
          existingUrl: prev[trackType].existingUrl,
        }
      }))

      toast.success(`${trackTypes.find(t => t.key === trackType)?.label} track selected`)
    } catch (error) {
      console.error('Error processing audio file:', error)
      toast.error('Failed to process audio file')
    }
  }

  const removeTrack = (trackType: string) => {
    setTracks(prev => ({
      ...prev,
      [trackType]: {
        file: null,
        preview: null,
        duration: null,
        uploading: false,
        progress: 0,
        existingUrl: prev[trackType].existingUrl,
      }
    }))
  }

  const uploadTrackFile = async (trackType: string, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setTracks(prev => ({
          ...prev,
          [trackType]: {
            ...prev[trackType],
            uploading: true,
            progress: Math.min(prev[trackType].progress + 10, 90)
          }
        }))
      }, 200)

      // Upload file
      multiTrackService.uploadFile(file, 'multi-track', songId)
        .then(response => {
          clearInterval(progressInterval)
          setTracks(prev => ({
            ...prev,
            [trackType]: {
              ...prev[trackType],
              uploading: false,
              progress: 100
            }
          }))
          resolve(response.url)
        })
        .catch(error => {
          clearInterval(progressInterval)
          setTracks(prev => ({
            ...prev,
            [trackType]: {
              ...prev[trackType],
              uploading: false,
              progress: 0
            }
          }))
          reject(error)
        })
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Check if we have any files to upload or existing URLs
      const hasFiles = Object.values(tracks).some(track => track.file)
      const hasExistingUrls = Object.values(tracks).some(track => track.existingUrl)
      
      if (!hasFiles && !hasExistingUrls) {
        toast.error('Please select at least one track file or have existing tracks.')
        return
      }

      // Upload new files and collect URLs
      const uploadedUrls: { [key: string]: string | null } = {}

      for (const [trackType, track] of Object.entries(tracks)) {
        if (track.file) {
          // Upload new file
          try {
            const url = await uploadTrackFile(trackType, track.file)
            uploadedUrls[trackType] = url
          } catch (error) {
            console.error(`Error uploading ${trackType}:`, error)
            toast.error(`Failed to upload ${trackType} track`)
            return
          }
        } else if (track.existingUrl) {
          // Keep existing URL
          uploadedUrls[trackType] = track.existingUrl
        } else {
          // No file and no existing URL
          uploadedUrls[trackType] = null
        }
      }

      // Save multi-track data
      const multiTrackData = {
        vocalsUrl: uploadedUrls.vocals || undefined,
        bassUrl: uploadedUrls.bass || undefined,
        drumsUrl: uploadedUrls.drums || undefined,
        otherUrl: uploadedUrls.other || undefined,
      }

      await multiTrackService.uploadMultiTrack(songId, multiTrackData)

      setSuccess('Multi-track saved successfully!')
      toast.success('Multi-track saved successfully!')
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.()
      }, 1000)

    } catch (error: any) {
      console.error('Error saving multi-track:', error)
      setError(error.response?.data?.message || 'Failed to save multi-track')
      toast.error('Failed to save multi-track')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trackTypes.map((trackType) => {
          const track = tracks[trackType.key]
          const Icon = trackType.icon
          
          return (
            <Card key={trackType.key}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-sm ${trackType.color}`}>
                  <Icon className="h-4 w-4" />
                  {trackType.label}
                  {track.existingUrl && !track.file && (
                    <Badge variant="outline" className="ml-auto">Existing</Badge>
                  )}
                  {track.file && (
                    <Badge variant="default" className="ml-auto">New</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* File Input */}
                <div>
                  <Label htmlFor={`${trackType.key}-file`} className="sr-only">
                    {trackType.label} File
                  </Label>
                  <Input
                    id={`${trackType.key}-file`}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileSelect(trackType.key, e)}
                    disabled={track.uploading || loading}
                    className="cursor-pointer"
                  />
                </div>

                {/* File Info */}
                {track.file && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{track.file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrack(trackType.key)}
                        disabled={track.uploading || loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Size: {formatFileSize(track.file.size)}</div>
                      {track.duration && <div>Duration: {formatDuration(track.duration)}</div>}
                    </div>
                  </div>
                )}

                {/* Existing URL Info */}
                {track.existingUrl && !track.file && (
                  <div className="text-xs text-muted-foreground">
                    <div>✓ Track already uploaded</div>
                  </div>
                )}

                {/* Upload Progress */}
                {track.uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...
                    </div>
                    <Progress value={track.progress} className="h-2" />
                  </div>
                )}

                {/* No file selected */}
                {!track.file && !track.existingUrl && (
                  <div className="text-center py-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No file selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Multi-Track
        </Button>
      </div>
    </div>
  )
}
