'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, X, Music, Volume2, Drum, Guitar } from 'lucide-react'
import { validateAudioFile, formatDuration } from '@/lib/audio-upload'
import apiClient from '@/services/api-client'

interface TrackFile {
  file: File | null
  preview: string | null
  duration: number | null
  uploading: boolean
  progress: number
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

  const [metadata, setMetadata] = useState({
    key: '',
    duration: '',
    quality: 'HIGH',
    notes: '',
  })

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileSelect = async (trackType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateAudioFile(file)
    if (!validation.isValid) {
      toast.error(validation.error)
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
        }
      }))

      // Auto-set duration if not already set
      if (!metadata.duration) {
        setMetadata(prev => ({ ...prev, duration: audioDuration.toString() }))
      }

      toast.success(`${trackTypes.find(t => t.key === trackType)?.label} track selected`)
    } catch (error) {
      console.error('Error processing audio file:', error)
      toast.error('Failed to process audio file')
    }
  }

  const removeTrack = (trackType: string) => {
    const track = tracks[trackType]
    if (track.preview) {
      URL.revokeObjectURL(track.preview)
    }

    setTracks(prev => ({
      ...prev,
      [trackType]: {
        file: null,
        preview: null,
        duration: null,
        uploading: false,
        progress: 0,
      }
    }))

    // Reset file input
    if (fileInputRefs.current[trackType]) {
      fileInputRefs.current[trackType]!.value = ''
    }
  }

  const handleUpload = async () => {
    const selectedTracks = Object.entries(tracks).filter(([_, track]) => track.file)
    
    if (selectedTracks.length === 0) {
      toast.error('Please select at least one track to upload')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()

      // Add track files in order
      trackTypes.forEach(trackType => {
        const track = tracks[trackType.key]
        if (track.file) {
          formData.append('tracks', track.file)
        }
      })

      // Add metadata
      if (metadata.key) formData.append('key', metadata.key)
      if (metadata.duration) formData.append('duration', metadata.duration)
      if (metadata.quality) formData.append('quality', metadata.quality)
      if (metadata.notes) formData.append('notes', metadata.notes)

      const response = await apiClient.post(
        `/karaoke/songs/${songId}/upload-multi-track`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              // Update progress for all selected tracks
              setTracks(prev => {
                const updated = { ...prev }
                selectedTracks.forEach(([trackType]) => {
                  updated[trackType] = { ...updated[trackType], progress }
                })
                return updated
              })
            }
          },
        }
      )

      if (response.status === 201) {
        toast.success('Multi-track karaoke uploaded successfully!')
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload tracks')
    } finally {
      setIsUploading(false)
    }
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url)
        resolve(Math.round(audio.duration))
      })

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load audio metadata'))
      })

      audio.src = url
    })
  }

  const hasSelectedTracks = Object.values(tracks).some(track => track.file)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Multi-Track Karaoke
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Track Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trackTypes.map((trackType) => {
              const track = tracks[trackType.key]
              const Icon = trackType.icon

              return (
                <Card key={trackType.key} className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-5 w-5 ${trackType.color}`} />
                      <Label className="font-medium">{trackType.label}</Label>
                    </div>

                    {!track.file ? (
                      <div className="text-center">
                        <input
                          ref={el => fileInputRefs.current[trackType.key] = el}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleFileSelect(trackType.key, e)}
                          className="hidden"
                          id={`${trackType.key}-upload`}
                        />
                        <label
                          htmlFor={`${trackType.key}-upload`}
                          className="cursor-pointer flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload {trackType.label.toLowerCase()} track
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{track.file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTrack(trackType.key)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {track.duration && (
                          <p className="text-xs text-gray-500">
                            Duration: {formatDuration(track.duration)}
                          </p>
                        )}

                        {track.uploading && (
                          <Progress value={track.progress} className="h-2" />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Metadata Section */}
          {hasSelectedTracks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Track Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      value={metadata.key}
                      onChange={(e) => setMetadata(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="e.g., G, Am, C#"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={metadata.duration}
                      onChange={(e) => setMetadata(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="240"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select value={metadata.quality} onValueChange={(value) => setMetadata(prev => ({ ...prev, quality: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={metadata.notes}
                    onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the karaoke tracks..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!hasSelectedTracks || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? 'Uploading...' : 'Upload Tracks'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
