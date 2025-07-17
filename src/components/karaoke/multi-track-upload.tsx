'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, X, Music, Volume2, Drum, Guitar, Trash2, RefreshCw } from 'lucide-react'
import { validateAudioFile, formatDuration } from '@/lib/audio-upload'
import apiClient from '@/services/api-client'
import songService from '@/services/song.service'

interface TrackFile {
  file: File | null
  preview: string | null
  duration: number | null
  uploading: boolean
  progress: number
  existingTrackId?: string | null
  existingFileUrl?: string | null
  existingFileName?: string | null
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
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Fetch existing tracks when component loads
  useEffect(() => {
    const fetchExistingTracks = async () => {
      try {
        setIsLoading(true)
        const song = await songService.getSongById(songId)

        if (song.karaoke && song.karaoke.tracks && song.karaoke.tracks.length > 0) {
          console.log('Found existing tracks:', song.karaoke.tracks)

          // Update metadata
          setMetadata(prev => ({ ...prev, key: song.karaoke?.key || '', duration: song.karaoke?.duration?.toString() || '', quality: song.karaoke?.quality || 'HIGH', notes: song.karaoke?.notes || '' }))

          // Map existing tracks to our track types
          const updatedTracks = { ...tracks }

          song.karaoke.tracks.forEach(track => {
            const trackType = track.trackType.toLowerCase()
            if (trackTypes.some(t => t.key === trackType)) {
              // Extract filename from URL
              const urlParts = track.fileUrl.split('/')
              const fileName = urlParts[urlParts.length - 1]

              updatedTracks[trackType] = {
                ...updatedTracks[trackType],
                existingTrackId: track.id,
                existingFileUrl: track.fileUrl,
                existingFileName: fileName,
                duration: track.duration || null,
              }
            }
          })

          setTracks(updatedTracks)
        }
      } catch (error) {
        console.error('Error fetching existing tracks:', error)
        toast.error('Failed to load existing tracks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExistingTracks()
  }, [songId])

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
        existingTrackId: track.existingTrackId, // Keep reference to existing track
        existingFileUrl: track.existingFileUrl,
        existingFileName: track.existingFileName,
      }
    }))

    // Reset file input
    if (fileInputRefs.current[trackType]) {
      fileInputRefs.current[trackType]!.value = ''
    }
  }

  // Delete an existing track from the database
  const deleteExistingTrack = async (trackType: string) => {
    const track = tracks[trackType]
    if (!track.existingTrackId) return

    try {
      await apiClient.delete(`/karaoke/songs/${songId}/tracks/${track.existingTrackId}`)

      setTracks(prev => ({
        ...prev,
        [trackType]: {
          file: null,
          preview: null,
          duration: null,
          uploading: false,
          progress: 0,
          existingTrackId: null,
          existingFileUrl: null,
          existingFileName: null,
        }
      }))

      toast.success(`${trackTypes.find(t => t.key === trackType)?.label} track removed`)
    } catch (error) {
      console.error('Error deleting track:', error)
      toast.error('Failed to delete track')
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
          // If replacing existing track, include the track ID
          if (track.existingTrackId) {
            formData.append('trackIds', track.existingTrackId)
          } else {
            formData.append('trackTypes', trackType.key)
          }
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
        // Fetch the updated song data with tracks after successful upload
        try {
          // Get the updated song with karaoke tracks
          const updatedSong = await songService.getSongById(songId)

          if (updatedSong && updatedSong.karaoke && updatedSong.karaoke.tracks) {
            console.log('Fetched updated song with tracks:', updatedSong.karaoke.tracks)

            // Update local state with the new track data
            const updatedTracks = { ...tracks }

            updatedSong.karaoke.tracks.forEach(track => {
              const trackType = track.trackType.toLowerCase()
              if (trackTypes.some(t => t.key === trackType)) {
                // Extract filename from URL
                const urlParts = track.fileUrl.split('/')
                const fileName = urlParts[urlParts.length - 1]

                updatedTracks[trackType] = {
                  file: null,
                  preview: null,
                  duration: track.duration || null,
                  uploading: false,
                  progress: 0,
                  existingTrackId: track.id,
                  existingFileUrl: track.fileUrl,
                  existingFileName: fileName,
                }
              }
            })

            setTracks(updatedTracks)
            toast.success(`Multi-track karaoke uploaded successfully! ${updatedSong.karaoke.tracks.length} tracks available.`)
          } else {
            console.warn('Song fetched but no karaoke tracks found:', updatedSong)
            toast.success('Multi-track karaoke uploaded successfully!')
          }
        } catch (fetchError) {
          console.error('Error fetching updated song data:', fetchError)
          toast.success('Multi-track karaoke uploaded successfully! Refresh to see tracks.')
        }

        // Call the onSuccess callback to update parent component state
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
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading tracks...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trackTypes.map((trackType) => {
            const track = tracks[trackType.key]
            const hasExistingTrack = !!track.existingTrackId

            return (
              <Card key={trackType.key} className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                <CardHeader className="bg-muted/30 p-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <trackType.icon className={`h-5 w-5 ${trackType.color}`} />
                    {trackType.label} Track
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {/* Show existing track */}
                  {hasExistingTrack && !track.file && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[180px] inline-block">
                          {track.existingFileName || 'Existing track'}
                        </span>
                        <div className="flex gap-1">
                          {/* Replace button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (fileInputRefs.current[trackType.key]) {
                                fileInputRefs.current[trackType.key]?.click()
                              }
                            }}
                            className="h-6 w-6 p-0"
                            title="Replace track"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExistingTrack(trackType.key)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete track"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {track.duration && (
                        <p className="text-xs text-gray-500">
                          Duration: {formatDuration(track.duration)}
                        </p>
                      )}

                      {/* Audio preview if URL is available */}
                      {track.existingFileUrl && (
                        <div className="mt-3">
                          <audio 
                            controls 
                            src={track.existingFileUrl}
                            className="w-full h-10 mt-2 audio-player-dark"
                          />
                        </div>
                      )}

                      {/* Hidden file input for replacement */}
                      <Input
                        ref={(el) => {
                          fileInputRefs.current[trackType.key] = el
                        }}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileSelect(trackType.key, e)}
                        className="hidden"
                        id={`${trackType.key}-upload`}
                      />
                    </div>
                  )}

                  {/* Show upload UI if no existing track and no file selected */}
                  {!hasExistingTrack && !track.file && (
                    <div>
                      <Input
                        ref={(el) => {
                          fileInputRefs.current[trackType.key] = el
                        }}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileSelect(trackType.key, e)}
                        className="hidden"
                        id={`${trackType.key}-upload`}
                      />
                      <label
                        htmlFor={`${trackType.key}-upload`}
                        className="cursor-pointer flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-dashed border-border"
                      >
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">
                          Click to upload {trackType.label.toLowerCase()} track
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Show selected file UI */}
                  {track.file && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {hasExistingTrack ? 'Replacing: ' : ''}{track.file.name}
                        </span>
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
      )}

      {/* Metadata Section */}
      {(hasSelectedTracks || Object.values(tracks).some(t => t.existingTrackId)) && (
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="bg-muted/30">
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
      <div className="flex justify-end gap-3 mt-8">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || (!hasSelectedTracks && !Object.values(tracks).some(t => t.existingTrackId))}
          className="min-w-[120px] px-6"
          size="lg"
        >
          {isUploading ? 'Uploading...' : 'Save Tracks'}
        </Button>
      </div>
    </div>
  )
}
