"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { IconUpload, IconMusic, IconX, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'
import { validateAudioFile, formatDuration, getAudioDuration } from '@/lib/audio-upload'
import { toast } from 'sonner'

interface AudioUploadProps {
  folder: string
  onAudioSelected: (file: File | null, previewUrl: string | null, duration?: number) => void
  onAudioRemoved?: (previousUrl: string) => void
  defaultAudio?: string
  className?: string
}

export function AudioUpload({
  folder,
  onAudioSelected,
  onAudioRemoved,
  defaultAudio,
  className = '',
}: AudioUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultAudio || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (defaultAudio) {
      setPreviewUrl(defaultAudio)
    }
  }, [defaultAudio])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [previewUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setDuration(audioDuration)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setSelectedFile(file)
      setPreviewUrl(url)
      setIsPlaying(false)
      setCurrentTime(0)

      // Notify parent component
      onAudioSelected(file, url, audioDuration)
    } catch (error) {
      console.error('Error processing audio file:', error)
      toast.error('Failed to process audio file')
    }
  }

  const handleRemove = () => {
    if (previewUrl && onAudioRemoved) {
      onAudioRemoved(previewUrl)
    }

    // Clean up object URL if it was created locally
    if (previewUrl && selectedFile) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl(null)
    setDuration(null)
    setIsPlaying(false)
    setCurrentTime(0)
    onAudioSelected(null, null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const newTime = (parseFloat(event.target.value) / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!previewUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <IconMusic className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className="mr-2 h-4 w-4" />
              Upload Audio File
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              MP3, WAV, OGG, AAC, M4A, WebM up to 50MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <IconMusic className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">
                {selectedFile?.name || 'Audio File'}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>

          {/* Audio Player */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={togglePlayback}
                disabled={!previewUrl}
              >
                {isPlaying ? (
                  <IconPlayerPause className="h-4 w-4" />
                ) : (
                  <IconPlayerPlay className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={!duration}
                />
              </div>
              
              <span className="text-xs text-gray-500 min-w-[60px]">
                {duration ? `${formatDuration(Math.floor(currentTime))} / ${formatDuration(duration)}` : '--:--'}
              </span>
            </div>

            {selectedFile && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                {duration && <div>Duration: {formatDuration(duration)}</div>}
              </div>
            )}
          </div>

          {/* Hidden audio element */}
          {previewUrl && (
            <audio
              ref={audioRef}
              src={previewUrl}
              preload="metadata"
              onLoadedMetadata={() => {
                if (audioRef.current && !duration) {
                  setDuration(Math.round(audioRef.current.duration))
                }
              }}
            />
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
