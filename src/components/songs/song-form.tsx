"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconMusic,
} from "@tabler/icons-react"

import { ChordPreview } from "./chord-formatter"
import { ImageUpload } from "@/components/ui/image-upload"
import { STORAGE_FOLDERS, uploadImage, deleteImage } from "@/lib/image-upload"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArtistCombobox } from "@/components/artists/artist-combobox"
// Removed unused Tabs imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle } from "@tabler/icons-react"

import songService, { Song, CreateSongDto, UpdateSongDto } from "@/services/song.service"
import artistService, { Artist } from "@/services/artist.service"
import tagService, { Tag } from "@/services/tag.service"
import languageService, { Language } from "@/services/language.service"

interface SongFormProps {
  mode: 'create' | 'edit'
  initialData?: Song
  title: string
}

export default function SongForm({ mode, initialData, title }: SongFormProps) {
  // Form state
  const [formState, setFormState] = React.useState({
    title: initialData?.title || "",
    artistId: initialData?.artistId || "",
    languageId: initialData?.languageId || "none",
    key: initialData?.key || "",
    tempo: initialData?.tempo || null,
    timeSignature: initialData?.timeSignature || "",
    difficulty: initialData?.difficulty || "",
    capo: initialData?.capo || 0, // Default to 0 (no capo)
    chordSheet: initialData?.chordSheet || "",
    imageUrl: initialData?.imageUrl || "",
    tags: initialData?.tags || []
  })

  // State for the image file
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  // State to track if an image needs to be deleted
  const [imageToDelete, setImageToDelete] = React.useState<string | null>(null)

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [artists, setArtists] = React.useState<Artist[]>([])
  const [languages, setLanguages] = React.useState<Language[]>([])
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Fetch artists for the dropdown
  React.useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true)
        const data = await artistService.getAllArtists()
        setArtists(data)

        // If we have an initial artist ID but no artists loaded yet, set it
        if (initialData?.artistId && data.length > 0) {
          const artist = data.find(a => a.id === initialData.artistId)
          if (artist) {
            setFormState(prev => ({ ...prev, artistId: artist.id }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch artists:', err)
        setError('Failed to load artists. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtists()
  }, [])

  // Fetch languages for the dropdown
  React.useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await languageService.getAllLanguages(true) // Only get active languages
        setLanguages(data)

        // If we have an initial language ID but no languages loaded yet, set it
        if (initialData?.languageId && data.length > 0) {
          const language = data.find(l => l.id === initialData.languageId)
          if (language) {
            setFormState(prev => ({ ...prev, languageId: language.id }))
          }
        } else if (!initialData?.languageId) {
          // If no language is set, default to "none"
          setFormState(prev => ({ ...prev, languageId: "none" }))
        }
      } catch (err) {
        console.error('Failed to fetch languages:', err)
        // Don't set error, as languages are optional
      }
    }

    fetchLanguages()
  }, [])

  // Fetch tags for the dropdown
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await tagService.getAllTags()
        setAvailableTags(data)
        console.log('Available tags:', data)

        // Set selected tags if editing
        if (mode === 'edit' && initialData?.id) {
          try {
            // Directly fetch tags for this song from the API
            const songTags = await tagService.getSongTags(initialData.id)
            if (songTags && songTags.length > 0) {
              setSelectedTags(songTags.map(tag => tag.id))
              console.log('Fetched song tags:', songTags)
            } else {
              console.log('No tags found for this song')
              // If we have songTags relation data in initialData
              if (initialData.songTags && initialData.songTags.length > 0) {
                const tagIds = initialData.songTags.map(st => st.tagId)
                setSelectedTags(tagIds)
                console.log('Using songTags from initialData:', tagIds)
              } else if (initialData.tags && initialData.tags.length > 0) {
                // If we have legacy tags array, match by name
                const tagNames = initialData.tags
                const matchedTags = data.filter(tag => tagNames.includes(tag.name))
                const matchedTagIds = matchedTags.map(tag => tag.id)
                setSelectedTags(matchedTagIds)
                console.log('Matched tags by name:', matchedTagIds)
              }
            }
          } catch (tagErr) {
            console.error('Failed to fetch song tags:', tagErr)
          }
        }
      } catch (err) {
        console.error('Failed to fetch tags:', err)
      }
    }

    fetchTags()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formState.title) {
        throw new Error("Title is required")
      }
      if (!formState.artistId) {
        throw new Error("Artist is required")
      }
      // Chord sheet is required
      if (!formState.chordSheet) {
        throw new Error("Chord sheet is required")
      }

      // Handle image operations (delete and upload)
      let imageUrl = formState.imageUrl;

      // Delete image if marked for deletion
      if (imageToDelete) {
        try {
          console.log('Attempting to delete image:', imageToDelete);
          const deleted = await deleteImage(imageToDelete);
          if (deleted) {
            console.log('Image deleted successfully or deletion was allowed to continue:', imageToDelete);
            // Clear the image URL from the form state to ensure it's removed from the database
            imageUrl = '';
          } else {
            console.warn('Failed to delete image, but continuing with form submission:', imageToDelete);
            // Still clear the image URL to ensure consistency
            imageUrl = '';
          }
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
          // Continue with form submission even if image deletion fails
          // Still clear the image URL to ensure consistency
          imageUrl = '';
        }
      }

      // Upload image if selected
      if (imageFile) {
        try {
          // Use the song ID as the entity ID for edit mode
          const entityId = mode === 'edit' && initialData?.id ? initialData.id : undefined;

          // Upload the file using our utility function
          const uploadedUrl = await uploadImage(imageFile, STORAGE_FOLDERS.SONG_COVERS, entityId);

          if (uploadedUrl) {
            imageUrl = uploadedUrl;
            console.log('Image uploaded successfully:', imageUrl);
          } else {
            console.error('Failed to upload image');
          }
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // Continue with form submission even if image upload fails
        }
      }

      // Prepare the data
      const songData = {
        title: formState.title,
        artistId: formState.artistId,
        languageId: formState.languageId === "none" ? undefined : formState.languageId, // Add language ID
        key: formState.key || undefined,
        tempo: formState.tempo || undefined,
        timeSignature: formState.timeSignature || undefined,
        difficulty: formState.difficulty || undefined,
        capo: formState.capo, // Add capo position
        chordSheet: formState.chordSheet,
        imageUrl: imageUrl || undefined,
        // Include tag names in the legacy tags field for backward compatibility
        tags: selectedTags.map(tagId => {
          const tag = availableTags.find(t => t.id === tagId);
          return tag ? tag.name : '';
        }).filter(name => name !== ''),
      }

      console.log('Submitting song data:', JSON.stringify(songData, null, 2))

      let result: Song
      if (mode === 'create') {
        // Create new song
        result = await songService.createSong(songData as CreateSongDto)
        console.log('Song created successfully:', result)

        // Now handle the tags separately
        if (selectedTags.length > 0) {
          try {
            // Add each tag to the song
            for (const tagId of selectedTags) {
              console.log(`Adding tag ${tagId} to song ${result.id}`)
              await tagService.addTagToSong(result.id, tagId)
            }
            console.log('Tags added to song successfully')
          } catch (tagError) {
            console.error('Error adding tags to song:', tagError)
            // We don't want to fail the whole operation if tag assignment fails
            toast.error("Warning: Some tags may not have been added", {
              description: "The song was created, but there was an issue with tag assignment.",
            })
          }
        }

        toast.success("Song created successfully", {
          description: `${formState.title} has been added to your songs.`,
          icon: <IconMusic className="h-4 w-4" />,
        })
      } else {
        // Update existing song
        if (!initialData?.id) {
          throw new Error("Song ID is missing for update")
        }
        result = await songService.updateSong(initialData.id, songData as UpdateSongDto)
        console.log('Song updated successfully:', result)

        // Now handle the tags separately
        try {
          // First, get the current tags for the song
          const currentTags = await tagService.getSongTags(initialData.id)
          const currentTagIds = currentTags.map(tag => tag.id)

          console.log('Current tag IDs:', currentTagIds)
          console.log('Selected tag IDs:', selectedTags)

          // Remove tags that are no longer selected
          for (const tagId of currentTagIds) {
            if (!selectedTags.includes(tagId)) {
              console.log(`Removing tag ${tagId} from song ${initialData.id}`)
              await tagService.removeTagFromSong(initialData.id, tagId)
            }
          }

          // Add newly selected tags
          for (const tagId of selectedTags) {
            if (!currentTagIds.includes(tagId)) {
              console.log(`Adding tag ${tagId} to song ${initialData.id}`)
              await tagService.addTagToSong(initialData.id, tagId)
            }
          }

          console.log('Tags updated successfully')
        } catch (tagError) {
          console.error('Error updating tags:', tagError)
          // We don't want to fail the whole operation if tag assignment fails
          toast.error("Warning: Some tags may not have been updated", {
            description: "The song was updated, but there was an issue with tag assignment.",
          })
        }

        toast.success("Song updated successfully", {
          description: `${formState.title} has been updated.`,
          icon: <IconMusic className="h-4 w-4" />,
        })
      }

      // Redirect to songs list
      router.push("/songs")
    } catch (err: any) {
      console.error(`Failed to ${mode} song:`, err)
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)

        // Handle array of error messages
        let errorMessage = err.response.data?.message;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(', ');
        }

        setError(`Failed to ${mode} song: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} song: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} song: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/songs")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Songs
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Song"}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
            {/* Two-column layout for song info and other content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Song Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Song Information</CardTitle>
                  <CardDescription>
                    Basic information about the song
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Enter song title"
                      value={formState.title}
                      onChange={(e) => setFormState({...formState, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Artist</label>
                    <ArtistCombobox
                      artists={artists}
                      value={formState.artistId}
                      onChange={(value) => setFormState({...formState, artistId: value})}
                      isLoading={isLoading}
                      onCreateNew={() => router.push('/artists/new')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select
                      onValueChange={(value) => setFormState({...formState, languageId: value})}
                      value={formState.languageId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {languages.map((language) => (
                          <SelectItem key={language.id} value={language.id}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={() => router.push('/languages/new')}
                      >
                        Add new language
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Key</label>
                      <Select
                        onValueChange={(value) => setFormState({...formState, key: value})}
                        value={formState.key}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select key" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="A#">A#</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C#">C#</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="D#">D#</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                          <SelectItem value="F#">F#</SelectItem>
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="G#">G#</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Capo Position</label>
                      <Select
                        onValueChange={(value) => setFormState({...formState, capo: parseInt(value)})}
                        value={formState.capo.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select capo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No Capo</SelectItem>
                          <SelectItem value="-10">-10</SelectItem>
                          <SelectItem value="-9">-9</SelectItem>
                          <SelectItem value="-8">-8</SelectItem>
                          <SelectItem value="-7">-7</SelectItem>
                          <SelectItem value="-6">-6</SelectItem>
                          <SelectItem value="-5">-5</SelectItem>
                          <SelectItem value="-4">-4</SelectItem>
                          <SelectItem value="-3">-3</SelectItem>
                          <SelectItem value="-2">-2</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <Select
                        onValueChange={(value) => setFormState({...formState, difficulty: value})}
                        value={formState.difficulty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tempo (BPM)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 120"
                        value={formState.tempo || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          setFormState({...formState, tempo: value});
                        }}
                        min="1"
                        max="300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Signature</label>
                      <Select
                        onValueChange={(value) => setFormState({...formState, timeSignature: value})}
                        value={formState.timeSignature}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time signature" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4/4">4/4</SelectItem>
                          <SelectItem value="3/4">3/4</SelectItem>
                          <SelectItem value="6/8">6/8</SelectItem>
                          <SelectItem value="2/4">2/4</SelectItem>
                          <SelectItem value="5/4">5/4</SelectItem>
                          <SelectItem value="7/8">7/8</SelectItem>
                          <SelectItem value="12/8">12/8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mt-1">
                    <p>Capo: Positive values indicate capo position. Negative values indicate transposition down.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="border rounded-md p-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedTags.length > 0 ? (
                          selectedTags.map(tagId => {
                            const tag = availableTags.find(t => t.id === tagId)
                            return tag ? (
                              <div
                                key={tag.id}
                                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                                style={{
                                  backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                                  color: tag.color || 'inherit',
                                  borderWidth: '1px',
                                  borderColor: tag.color || '#d1d5db'
                                }}
                              >
                                {tag.name}
                                <button
                                  type="button"
                                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                                  onClick={() => setSelectedTags(selectedTags.filter(id => id !== tag.id))}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null
                          })
                        ) : (
                          <div className="text-sm text-muted-foreground">No tags selected</div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Select
                          onValueChange={(value) => {
                            if (!selectedTags.includes(value)) {
                              setSelectedTags([...selectedTags, value])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add a tag..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTags
                              .filter(tag => !selectedTags.includes(tag.id) && tag.forSongs !== false)
                              .map(tag => (
                                <SelectItem key={tag.id} value={tag.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: tag.color || '#d1d5db' }}
                                    ></div>
                                    {tag.name}
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select tags for categorizing the song. <a href="/tags/new" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Create new tags</a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Right column: Cover Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                  <CardDescription>
                    Upload a cover image for the song
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <ImageUpload
                      folder={STORAGE_FOLDERS.SONG_COVERS}
                      onImageSelected={(file, previewUrl) => {
                        setImageFile(file);
                        // Set a temporary preview URL for display
                        if (previewUrl) {
                          setFormState({...formState, imageUrl: previewUrl});
                        } else {
                          setFormState({...formState, imageUrl: ''});
                        }
                      }}
                      onImageRemoved={(previousUrl) => {
                        // Mark the image for deletion when the form is submitted
                        if (previousUrl.startsWith('http')) {
                          setImageToDelete(previousUrl);
                          // Also update the form state to clear the imageUrl
                          setFormState({...formState, imageUrl: ''});
                        }
                      }}
                      defaultImage={formState.imageUrl}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a square image (1:1 aspect ratio) for best results
                    </p>
                  </div>

                  <div className="space-y-2 mt-6">
                    <h3 className="text-sm font-medium">Image Guidelines</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Use a high-quality image (minimum 500x500 pixels)</li>
                      <li>Square format (1:1 aspect ratio) works best</li>
                      <li>JPG or PNG format recommended</li>
                      <li>Keep file size under 2MB for faster loading</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Full-width Chords section */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Chord Sheet</CardTitle>
                <CardDescription>
                  Enter the song chord notations with lyrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChordPreview
                  chordSheet={formState.chordSheet}
                  onChange={(value) => setFormState({...formState, chordSheet: value})}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Song"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
