"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandYoutube,
  IconWorld,
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

import artistService, { Artist, CreateArtistDto, UpdateArtistDto } from "@/services/artist.service"
import tagService, { Tag } from "@/services/tag.service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ArtistFormProps {
  mode: 'create' | 'edit'
  initialData?: Artist
  title: string
}

export default function ArtistForm({ mode, initialData, title }: ArtistFormProps) {
  // Form state
  const [formState, setFormState] = React.useState({
    name: initialData?.name || "",
    bio: initialData?.bio || "",
    website: initialData?.website || "",
    socialLinks: {
      instagram: initialData?.socialLinks?.instagram || "",
      twitter: initialData?.socialLinks?.twitter || "",
      facebook: initialData?.socialLinks?.facebook || "",
      youtube: initialData?.socialLinks?.youtube || "",
    },
    imageUrl: initialData?.imageUrl || "",
    isFeatured: initialData?.isFeatured || false,
  })

  // State for tags
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  // State for the image file
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  // State to track if an image needs to be deleted
  const [imageToDelete, setImageToDelete] = React.useState<string | null>(null)

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch tags for the dropdown
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await tagService.getAllTags()
        setAvailableTags(data)

        // Set selected tags if editing
        if (mode === 'edit' && initialData?.id) {
          try {
            const artistTags = await tagService.getArtistTags(initialData.id)
            setSelectedTags(artistTags.map(tag => tag.id))
          } catch (err) {
            console.error('Failed to fetch artist tags:', err)
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
      if (!formState.name) {
        throw new Error("Artist name is required")
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
          // Use the artist ID as the entity ID for edit mode
          const entityId = mode === 'edit' && initialData?.id ? initialData.id : undefined;

          // Upload the file using our utility function
          const uploadedUrl = await uploadImage(imageFile, STORAGE_FOLDERS.ARTIST_COVERS, entityId);

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
      const artistData = {
        name: formState.name,
        bio: formState.bio || undefined,
        imageUrl: imageUrl || undefined,
        website: formState.website || undefined,
        isFeatured: formState.isFeatured,
        socialLinks: {
          facebook: formState.socialLinks.facebook || undefined,
          twitter: formState.socialLinks.twitter || undefined,
          instagram: formState.socialLinks.instagram || undefined,
          youtube: formState.socialLinks.youtube || undefined,
        },
      }

      console.log('Submitting artist data:', JSON.stringify(artistData, null, 2))

      let result: Artist
      if (mode === 'create') {
        // Create new artist
        result = await artistService.createArtist(artistData as CreateArtistDto)
        console.log('Artist created successfully:', result)

        // Now handle the tags separately
        if (selectedTags.length > 0) {
          try {
            // Add each tag to the artist
            for (const tagId of selectedTags) {
              await tagService.addTagToArtist(result.id, tagId)
            }
            console.log('Tags added to artist successfully')
          } catch (tagError) {
            console.error('Error adding tags to artist:', tagError)
            // We don't want to fail the whole operation if tag assignment fails
            toast.error("Warning: Some tags may not have been added", {
              description: "The artist was created, but there was an issue with tag assignment.",
            })
          }
        }

        toast.success("Artist created successfully", {
          description: `${formState.name} has been added to your artists.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      } else {
        // Update existing artist
        if (!initialData?.id) {
          throw new Error("Artist ID is missing for update")
        }
        result = await artistService.updateArtist(initialData.id, artistData as UpdateArtistDto)
        console.log('Artist updated successfully:', result)

        // Now handle the tags separately
        try {
          // First, get the current tags for the artist
          const currentTags = await tagService.getArtistTags(initialData.id)
          const currentTagIds = currentTags.map(tag => tag.id)

          // Remove tags that are no longer selected
          for (const tagId of currentTagIds) {
            if (!selectedTags.includes(tagId)) {
              await tagService.removeTagFromArtist(initialData.id, tagId)
            }
          }

          // Add newly selected tags
          for (const tagId of selectedTags) {
            if (!currentTagIds.includes(tagId)) {
              await tagService.addTagToArtist(initialData.id, tagId)
            }
          }

          console.log('Tags updated successfully')
        } catch (tagError) {
          console.error('Error updating tags:', tagError)
          // We don't want to fail the whole operation if tag assignment fails
          toast.error("Warning: Some tags may not have been updated", {
            description: "The artist was updated, but there was an issue with tag assignment.",
          })
        }

        toast.success("Artist updated successfully", {
          description: `${formState.name} has been updated.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      }

      // Redirect to artists list
      router.push("/artists")
    } catch (err: any) {
      console.error(`Failed to ${mode} artist:`, err)
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

        setError(`Failed to ${mode} artist: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} artist: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} artist: ${err.message || 'Unknown error'}`)
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
                onClick={() => router.push("/artists")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Artists
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Artist"}
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
                  <CardTitle>Artist Information</CardTitle>
                  <CardDescription>
                    Basic information about the artist
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Enter artist name"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Biography</label>
                    <textarea
                      placeholder="Enter artist biography"
                      className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formState.bio}
                      onChange={(e) => setFormState({...formState, bio: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground">
                      A short description of the artist and their work
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <div className="flex items-center gap-2">
                      <IconWorld className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://example.com"
                        value={formState.website}
                        onChange={(e) => setFormState({...formState, website: e.target.value})}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The artist's official website
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Social Media Links</label>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconBrandFacebook className="h-4 w-4 text-blue-600" />
                        <Input
                          placeholder="https://facebook.com/artist"
                          value={formState.socialLinks.facebook}
                          onChange={(e) => setFormState({
                            ...formState,
                            socialLinks: {
                              ...formState.socialLinks,
                              facebook: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <IconBrandTwitter className="h-4 w-4 text-blue-400" />
                        <Input
                          placeholder="https://twitter.com/artist"
                          value={formState.socialLinks.twitter}
                          onChange={(e) => setFormState({
                            ...formState,
                            socialLinks: {
                              ...formState.socialLinks,
                              twitter: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <IconBrandInstagram className="h-4 w-4 text-pink-500" />
                        <Input
                          placeholder="https://instagram.com/artist"
                          value={formState.socialLinks.instagram}
                          onChange={(e) => setFormState({
                            ...formState,
                            socialLinks: {
                              ...formState.socialLinks,
                              instagram: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <IconBrandYoutube className="h-4 w-4 text-red-600" />
                        <Input
                          placeholder="https://youtube.com/channel/artist"
                          value={formState.socialLinks.youtube}
                          onChange={(e) => setFormState({
                            ...formState,
                            socialLinks: {
                              ...formState.socialLinks,
                              youtube: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Social media profiles for the artist
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
                              .filter(tag => !selectedTags.includes(tag.id) && tag.forArtists !== false)
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
                      Select tags for categorizing the artist. <a href="/tags/new" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Create new tags</a>
                    </p>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      checked={formState.isFeatured}
                      onCheckedChange={(checked) => setFormState({...formState, isFeatured: !!checked})}
                    />
                    <div className="space-y-1 leading-none">
                      <label className="text-sm font-medium">Featured Artist</label>
                      <p className="text-sm text-muted-foreground">
                        This artist will be featured on the homepage
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Artist Image</CardTitle>
                  <CardDescription>
                    Artist profile image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Artist Image</label>
                    <ImageUpload
                      folder={STORAGE_FOLDERS.ARTIST_COVERS}
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
                      Upload a profile image for the artist (recommended)
                    </p>
                  </div>
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
                {isSubmitting ? "Saving..." : "Save Artist"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
