"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
  IconMusic,
  IconSearch,
  IconX,
  IconPlus,
} from "@tabler/icons-react"

import { ImageUpload } from "@/components/ui/image-upload"
import { STORAGE_FOLDERS, uploadImage, deleteImage } from "@/lib/image-upload"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import collectionService, { Collection, CreateCollectionDto, UpdateCollectionDto } from "@/services/collection.service"
import songService, { Song } from "@/services/song.service"
import tagService, { Tag } from "@/services/tag.service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CollectionFormProps {
  mode: 'create' | 'edit'
  initialData?: Collection
  title: string
}

export default function CollectionForm({ mode, initialData, title }: CollectionFormProps) {
  // Form state
  const [formState, setFormState] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    isPublic: initialData?.isPublic !== false, // Default to true if not specified
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true, // Default to true if not specified
  })

  // State for the image file
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  // State to track if an image needs to be deleted
  const [imageToDelete, setImageToDelete] = React.useState<string | null>(null)

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [songs, setSongs] = React.useState<Song[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  // Get song IDs from the songs array if available
  const initialSongIds = initialData?.songs ? initialData.songs.map(song => song.id) : []
  const [selectedSongs, setSelectedSongs] = React.useState<string[]>(initialSongIds)

  // State for tags
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [isLoadingTags, setIsLoadingTags] = React.useState(false)

  // Fetch songs for the selection
  React.useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoadingSongs(true)
        const data = await songService.getAllSongs()
        setSongs(data)
      } catch (err) {
        console.error('Failed to fetch songs:', err)
        setError('Failed to load songs. Please try again later.')
      } finally {
        setIsLoadingSongs(false)
      }
    }

    fetchSongs()
  }, [])

  // Fetch tags for the dropdown
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true)
        const data = await tagService.getAllTags()
        setAvailableTags(data)

        // Set selected tags if editing
        if (mode === 'edit' && initialData?.id) {
          try {
            const collectionTags = await tagService.getCollectionTags(initialData.id)
            setSelectedTags(collectionTags.map(tag => tag.id))
          } catch (err) {
            console.error('Failed to fetch collection tags:', err)
          }
        }
      } catch (err) {
        console.error('Failed to fetch tags:', err)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTags()
  }, [])

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  )

  // Toggle song selection
  const toggleSongSelection = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formState.name) {
        throw new Error("Collection name is required")
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
          // Use the collection ID as the entity ID for edit mode
          const entityId = mode === 'edit' && initialData?.id ? initialData.id : undefined;

          // Upload the file using our utility function
          const uploadedUrl = await uploadImage(imageFile, STORAGE_FOLDERS.COLLECTION_COVERS, entityId);

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
      const collectionData = {
        name: formState.name,
        description: formState.description || undefined,
        imageUrl: imageUrl || undefined,
        isPublic: formState.isPublic,
        isActive: formState.isActive,
      }

      console.log('Submitting collection data:', JSON.stringify(collectionData, null, 2))

      let result
      if (mode === 'create') {
        // Create new collection
        result = await collectionService.createCollection(collectionData as CreateCollectionDto)
        console.log('Collection created successfully:', result)

        // Now add songs to the collection one by one
        if (selectedSongs.length > 0 && result.id) {
          try {
            for (const songId of selectedSongs) {
              await collectionService.addSongToCollection(result.id, songId)
            }
            console.log('All songs added to collection successfully')
          } catch (err) {
            console.error('Error adding songs to collection:', err)
            // Continue with success message even if some songs fail to add
          }
        }

        // Now handle the tags separately
        if (selectedTags.length > 0 && result.id) {
          try {
            // Add each tag to the collection
            for (const tagId of selectedTags) {
              await tagService.addTagToCollection(result.id, tagId)
            }
            console.log('Tags added to collection successfully')
          } catch (tagError) {
            console.error('Error adding tags to collection:', tagError)
            // We don't want to fail the whole operation if tag assignment fails
            toast.error("Warning: Some tags may not have been added", {
              description: "The collection was created, but there was an issue with tag assignment.",
            })
          }
        }

        toast.success("Collection created successfully", {
          description: `${formState.name} has been added to your collections.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      } else {
        // Update existing collection
        if (!initialData?.id) {
          throw new Error("Collection ID is missing for update")
        }
        result = await collectionService.updateCollection(initialData.id, collectionData as UpdateCollectionDto)

        // Handle song changes if this is an edit
        if (initialData.id) {
          // Get current songs in the collection
          const currentSongIds = initialData.songs ? initialData.songs.map(song => song.id) : []

          // Find songs to add (in selectedSongs but not in currentSongIds)
          const songsToAdd = selectedSongs.filter(id => !currentSongIds.includes(id))

          // Find songs to remove (in currentSongIds but not in selectedSongs)
          const songsToRemove = currentSongIds.filter(id => !selectedSongs.includes(id))

          // Add new songs
          for (const songId of songsToAdd) {
            try {
              await collectionService.addSongToCollection(initialData.id, songId)
            } catch (err) {
              console.error(`Error adding song ${songId} to collection:`, err)
            }
          }

          // Remove songs that were unselected
          for (const songId of songsToRemove) {
            try {
              await collectionService.removeSongFromCollection(initialData.id, songId)
            } catch (err) {
              console.error(`Error removing song ${songId} from collection:`, err)
            }
          }
        }

        console.log('Collection updated successfully:', result)

        // Now handle the tags separately
        try {
          // First, get the current tags for the collection
          const currentTags = await tagService.getCollectionTags(initialData.id)
          const currentTagIds = currentTags.map(tag => tag.id)

          // Remove tags that are no longer selected
          for (const tagId of currentTagIds) {
            if (!selectedTags.includes(tagId)) {
              await tagService.removeTagFromCollection(initialData.id, tagId)
            }
          }

          // Add newly selected tags
          for (const tagId of selectedTags) {
            if (!currentTagIds.includes(tagId)) {
              await tagService.addTagToCollection(initialData.id, tagId)
            }
          }

          console.log('Tags updated successfully')
        } catch (tagError) {
          console.error('Error updating tags:', tagError)
          // We don't want to fail the whole operation if tag assignment fails
          toast.error("Warning: Some tags may not have been updated", {
            description: "The collection was updated, but there was an issue with tag assignment.",
          })
        }

        toast.success("Collection updated successfully", {
          description: `${formState.name} has been updated.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      }

      // Redirect to collections list
      router.push("/collections")
    } catch (err: any) {
      console.error(`Failed to ${mode} collection:`, err)
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

        setError(`Failed to ${mode} collection: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} collection: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} collection: ${err.message || 'Unknown error'}`)
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
                onClick={() => router.push("/collections")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Collections
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Collection"}
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
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Information</CardTitle>
                  <CardDescription>
                    Basic information about the collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Enter collection name"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      placeholder="Enter collection description"
                      className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formState.description}
                      onChange={(e) => setFormState({...formState, description: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground">
                      A short description of the collection
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Collection Cover Image</label>
                    <ImageUpload
                      folder={STORAGE_FOLDERS.COLLECTION_COVERS}
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
                      Upload a cover image for the collection (recommended)
                    </p>
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
                              .filter(tag => !selectedTags.includes(tag.id) && tag.forCollections !== false)
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
                      Select tags for categorizing the collection. <a href="/tags/new" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Create new tags</a>
                    </p>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      checked={formState.isPublic}
                      onCheckedChange={(checked) => setFormState({...formState, isPublic: !!checked})}
                    />
                    <div className="space-y-1 leading-none">
                      <label className="text-sm font-medium">Public Collection</label>
                      <p className="text-sm text-muted-foreground">
                        Make this collection visible to all users
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      onValueChange={(value) => setFormState({...formState, isActive: value === 'active'})}
                      value={formState.isActive ? 'active' : 'inactive'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Inactive collections are hidden from the app and only visible in the admin panel.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Songs in Collection</CardTitle>
                  <CardDescription>
                    Select songs to include in this collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search songs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9"
                      />
                      <Button variant="outline" size="sm" className="h-9">
                        <IconSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedSongs.length} songs selected
                    </p>
                  </div>

                  {isLoadingSongs ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span className="ml-3">Loading songs...</span>
                    </div>
                  ) : songs.length === 0 ? (
                    <div className="text-center p-4 border rounded-md">
                      <p className="text-muted-foreground">No songs found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => router.push('/songs/new')}
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add a Song
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] border rounded-md p-4">
                      <div className="space-y-2">
                        {filteredSongs.map((song) => (
                          <div key={song.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                            <Checkbox
                              checked={selectedSongs.includes(song.id)}
                              onCheckedChange={() => toggleSongSelection(song.id)}
                            />
                            <div className="space-y-1 leading-none">
                              <div className="flex items-center">
                                <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{song.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {song.artist?.name || 'Unknown Artist'}
                              </p>
                            </div>
                          </div>
                        ))}
                        {filteredSongs.length === 0 && (
                          <div className="text-center p-4">
                            <p className="text-muted-foreground">No songs match your search</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}

                  {selectedSongs.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected Songs</p>
                      <div className="border rounded-md p-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedSongs.map((songId) => {
                            const song = songs.find(s => s.id === songId);
                            return song ? (
                              <Badge key={songId} variant="secondary" className="flex items-center gap-1">
                                {song.title}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0 ml-1"
                                  onClick={() => toggleSongSelection(songId)}
                                >
                                  <IconX className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Collection"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
