"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
  IconTag,
  IconColorSwatch,
  IconPalette,
  IconInfoCircle,
  IconMusic,
  IconUser,
  IconFolder,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import tagService, { Tag, CreateTagDto, UpdateTagDto } from "@/services/tag.service"
import songService, { Song } from "@/services/song.service"
import artistService, { Artist } from "@/services/artist.service"
import collectionService, { Collection } from "@/services/collection.service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TagFormProps {
  mode: 'create' | 'edit'
  initialData?: Tag
  title: string
}

export default function TagForm({ mode, initialData, title }: TagFormProps) {
  // Form state
  const [formState, setFormState] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || "#6366F1", // Default to indigo
    forSongs: initialData?.forSongs !== false, // Default to true if not specified
    forArtists: initialData?.forArtists !== false, // Default to true if not specified
    forCollections: initialData?.forCollections !== false, // Default to true if not specified
  })

  // State for songs, artists, and collections
  const [songs, setSongs] = React.useState<Song[]>([])
  const [artists, setArtists] = React.useState<Artist[]>([])
  const [collections, setCollections] = React.useState<Collection[]>([])

  // State for selected items
  const [selectedSongs, setSelectedSongs] = React.useState<string[]>([])
  const [selectedArtists, setSelectedArtists] = React.useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>([])

  // State for search queries
  const [songSearchQuery, setSongSearchQuery] = React.useState('')
  const [artistSearchQuery, setArtistSearchQuery] = React.useState('')
  const [collectionSearchQuery, setCollectionSearchQuery] = React.useState('')

  // Loading states
  const [isLoadingSongs, setIsLoadingSongs] = React.useState(false)
  const [isLoadingArtists, setIsLoadingArtists] = React.useState(false)
  const [isLoadingCollections, setIsLoadingCollections] = React.useState(false)

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formState.name) {
        throw new Error("Tag name is required")
      }

      // Validate color format (hex color)
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (formState.color && !hexColorRegex.test(formState.color)) {
        throw new Error("Color must be a valid hex color (e.g., #FF5733)")
      }

      // Prepare the data
      let tagData: CreateTagDto | UpdateTagDto = {
        name: formState.name,
        description: formState.description || undefined,
        color: formState.color || undefined,
        forSongs: formState.forSongs,
        forArtists: formState.forArtists,
        forCollections: formState.forCollections,
      }

      console.log('Submitting tag data:', JSON.stringify(tagData, null, 2))

      let result
      if (mode === 'create') {
        // Create new tag
        result = await tagService.createTag(tagData as CreateTagDto)
        console.log('Tag created successfully:', result)

        // Add songs to the tag
        if (selectedSongs.length > 0 && result.id) {
          try {
            for (const songId of selectedSongs) {
              await tagService.addTagToSong(songId, result.id)
            }
            console.log('Songs added to tag successfully')
          } catch (err) {
            console.error('Error adding songs to tag:', err)
            // Continue with success message even if some songs fail to add
          }
        }

        // Add artists to the tag
        if (selectedArtists.length > 0 && result.id) {
          try {
            for (const artistId of selectedArtists) {
              await tagService.addTagToArtist(artistId, result.id)
            }
            console.log('Artists added to tag successfully')
          } catch (err) {
            console.error('Error adding artists to tag:', err)
            // Continue with success message even if some artists fail to add
          }
        }

        // Add collections to the tag
        if (selectedCollections.length > 0 && result.id) {
          try {
            for (const collectionId of selectedCollections) {
              await tagService.addTagToCollection(collectionId, result.id)
            }
            console.log('Collections added to tag successfully')
          } catch (err) {
            console.error('Error adding collections to tag:', err)
            // Continue with success message even if some collections fail to add
          }
        }

        toast.success("Tag created successfully", {
          description: `${formState.name} has been added.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      } else {
        // Update existing tag
        if (!initialData?.id) {
          throw new Error("Tag ID is missing for update")
        }
        result = await tagService.updateTag(initialData.id, tagData as UpdateTagDto)
        console.log('Tag updated successfully:', result)

        // Update song relationships
        try {
          // Get current songs for this tag
          const currentSongs = await tagService.getSongTags(initialData.id)
          const currentSongIds = currentSongs.map(song => song.id)

          // Remove songs that are no longer selected
          for (const songId of currentSongIds) {
            if (!selectedSongs.includes(songId)) {
              await tagService.removeTagFromSong(songId, initialData.id)
            }
          }

          // Add newly selected songs
          for (const songId of selectedSongs) {
            if (!currentSongIds.includes(songId)) {
              await tagService.addTagToSong(songId, initialData.id)
            }
          }

          console.log('Song relationships updated successfully')
        } catch (err) {
          console.error('Error updating song relationships:', err)
          // Continue with success message even if some updates fail
        }

        // Update artist relationships
        try {
          // Get current artists for this tag
          const currentArtists = await tagService.getArtistTags(initialData.id)
          const currentArtistIds = currentArtists.map(artist => artist.id)

          // Remove artists that are no longer selected
          for (const artistId of currentArtistIds) {
            if (!selectedArtists.includes(artistId)) {
              await tagService.removeTagFromArtist(artistId, initialData.id)
            }
          }

          // Add newly selected artists
          for (const artistId of selectedArtists) {
            if (!currentArtistIds.includes(artistId)) {
              await tagService.addTagToArtist(artistId, initialData.id)
            }
          }

          console.log('Artist relationships updated successfully')
        } catch (err) {
          console.error('Error updating artist relationships:', err)
          // Continue with success message even if some updates fail
        }

        // Update collection relationships
        try {
          // Get current collections for this tag
          const currentCollections = await tagService.getCollectionTags(initialData.id)
          const currentCollectionIds = currentCollections.map(collection => collection.id)

          // Remove collections that are no longer selected
          for (const collectionId of currentCollectionIds) {
            if (!selectedCollections.includes(collectionId)) {
              await tagService.removeTagFromCollection(collectionId, initialData.id)
            }
          }

          // Add newly selected collections
          for (const collectionId of selectedCollections) {
            if (!currentCollectionIds.includes(collectionId)) {
              await tagService.addTagToCollection(collectionId, initialData.id)
            }
          }

          console.log('Collection relationships updated successfully')
        } catch (err) {
          console.error('Error updating collection relationships:', err)
          // Continue with success message even if some updates fail
        }

        toast.success("Tag updated successfully", {
          description: `${initialData.name} has been updated.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      }

      // Redirect to tags list
      router.push("/tags")
    } catch (err: any) {
      console.error(`Failed to ${mode} tag:`, err)
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

        setError(`Failed to ${mode} tag: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} tag: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} tag: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate a random color
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    setFormState({ ...formState, color });
  };

  // Fetch songs, artists, and collections
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch songs if forSongs is enabled
        if (formState.forSongs) {
          setIsLoadingSongs(true)
          const songsData = await songService.getAllSongs()
          setSongs(songsData)
          setIsLoadingSongs(false)
        }

        // Fetch artists if forArtists is enabled
        if (formState.forArtists) {
          setIsLoadingArtists(true)
          const artistsData = await artistService.getAllArtists()
          setArtists(artistsData)
          setIsLoadingArtists(false)
        }

        // Fetch collections if forCollections is enabled
        if (formState.forCollections) {
          setIsLoadingCollections(true)
          const collectionsData = await collectionService.getAllCollections()
          setCollections(collectionsData)
          setIsLoadingCollections(false)
        }

        // If in edit mode, fetch existing relationships
        if (mode === 'edit' && initialData?.id) {
          try {
            // Fetch songs for this tag
            const tagSongs = await tagService.getSongTags(initialData.id)
            setSelectedSongs(tagSongs.map(song => song.id))

            // Fetch artists for this tag
            const tagArtists = await tagService.getArtistTags(initialData.id)
            setSelectedArtists(tagArtists.map(artist => artist.id))

            // Fetch collections for this tag
            const tagCollections = await tagService.getCollectionTags(initialData.id)
            setSelectedCollections(tagCollections.map(collection => collection.id))
          } catch (err) {
            console.error('Failed to fetch tag relationships:', err)
            setError('Failed to load tag relationships. Some data may be missing.')
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data. Please try again later.')
      }
    }

    fetchData()
  }, [formState.forSongs, formState.forArtists, formState.forCollections, initialData?.id, mode])

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
                onClick={() => router.push("/tags")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Tags
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Tag"}
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
            <Card>
              <CardHeader>
                <CardTitle>Tag Information</CardTitle>
                <CardDescription>
                  Basic information about the tag
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                    <IconTag className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Worship"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      className="border-0 focus-visible:ring-0"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The name of the tag that will be displayed to users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Songs suitable for worship services"
                    value={formState.description}
                    onChange={(e) => setFormState({...formState, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional description of what this tag represents
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring flex-1">
                      <IconColorSwatch className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="color"
                        type="text"
                        placeholder="#FF5733"
                        value={formState.color}
                        onChange={(e) => setFormState({...formState, color: e.target.value})}
                        className="border-0 focus-visible:ring-0"
                      />
                    </div>
                    <div
                      className="h-10 w-10 rounded-md border"
                      style={{ backgroundColor: formState.color }}
                    ></div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomColor}
                    >
                      <IconPalette className="mr-2 h-4 w-4" />
                      Random
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hex color code for displaying the tag (e.g., #FF5733)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tag Usage</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select which content types this tag can be applied to
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox
                          id="forSongs"
                          checked={formState.forSongs}
                          onCheckedChange={(checked) => setFormState({...formState, forSongs: !!checked})}
                        />
                        <div className="space-y-1 leading-none">
                          <label htmlFor="forSongs" className="text-sm font-medium cursor-pointer">Songs</label>
                          <p className="text-sm text-muted-foreground">
                            This tag can be applied to songs
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox
                          id="forArtists"
                          checked={formState.forArtists}
                          onCheckedChange={(checked) => setFormState({...formState, forArtists: !!checked})}
                        />
                        <div className="space-y-1 leading-none">
                          <label htmlFor="forArtists" className="text-sm font-medium cursor-pointer">Artists</label>
                          <p className="text-sm text-muted-foreground">
                            This tag can be applied to artists
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox
                          id="forCollections"
                          checked={formState.forCollections}
                          onCheckedChange={(checked) => setFormState({...formState, forCollections: !!checked})}
                        />
                        <div className="space-y-1 leading-none">
                          <label htmlFor="forCollections" className="text-sm font-medium cursor-pointer">Collections</label>
                          <p className="text-sm text-muted-foreground">
                            This tag can be applied to collections
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 border rounded-md bg-muted/50">
                    <div className="flex items-start gap-2">
                      <IconInfoCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Tag Preview</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          This is how the tag will appear in the application
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: formState.color ? `${formState.color}20` : '#6366F120',
                              color: formState.color || '#6366F1',
                              borderColor: formState.color || '#6366F1',
                              borderWidth: '1px'
                            }}
                          >
                            <IconTag className="mr-1 h-3 w-3" />
                            {formState.name || 'Tag Name'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tag Assignments Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Tag Assignments</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Assign this tag to songs, artists, and collections
                    </p>

                    <Tabs defaultValue="songs" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="songs" disabled={!formState.forSongs}>
                          <IconMusic className="mr-2 h-4 w-4" />
                          Songs
                        </TabsTrigger>
                        <TabsTrigger value="artists" disabled={!formState.forArtists}>
                          <IconUser className="mr-2 h-4 w-4" />
                          Artists
                        </TabsTrigger>
                        <TabsTrigger value="collections" disabled={!formState.forCollections}>
                          <IconFolder className="mr-2 h-4 w-4" />
                          Collections
                        </TabsTrigger>
                      </TabsList>

                      {/* Songs Tab */}
                      <TabsContent value="songs" className="border rounded-md p-4">
                        {formState.forSongs ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="search"
                                  placeholder="Search songs..."
                                  className="pl-8"
                                  value={songSearchQuery}
                                  onChange={(e) => setSongSearchQuery(e.target.value)}
                                />
                              </div>
                              <Select
                                onValueChange={(value) => {
                                  if (!selectedSongs.includes(value)) {
                                    setSelectedSongs([...selectedSongs, value])
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[220px]">
                                  <SelectValue placeholder="Add a song..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <ScrollArea className="h-[200px]">
                                    {songs
                                      .filter(song =>
                                        !selectedSongs.includes(song.id) &&
                                        (songSearchQuery === '' ||
                                          song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
                                          song.artist?.name.toLowerCase().includes(songSearchQuery.toLowerCase())
                                        )
                                      )
                                      .map(song => (
                                        <SelectItem key={song.id} value={song.id}>
                                          {song.title} - {song.artist?.name}
                                        </SelectItem>
                                      ))
                                    }
                                  </ScrollArea>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="border rounded-md p-2">
                              <h5 className="text-sm font-medium mb-2">Selected Songs</h5>
                              {selectedSongs.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedSongs.map(songId => {
                                    const song = songs.find(s => s.id === songId)
                                    return song ? (
                                      <div key={song.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                        <div className="flex items-center gap-2">
                                          <IconMusic className="h-4 w-4 text-muted-foreground" />
                                          <span>{song.title} - {song.artist?.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedSongs(selectedSongs.filter(id => id !== song.id))}
                                        >
                                          <IconX className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No songs selected</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">Enable "Songs" in Tag Usage to assign this tag to songs</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Artists Tab */}
                      <TabsContent value="artists" className="border rounded-md p-4">
                        {formState.forArtists ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="search"
                                  placeholder="Search artists..."
                                  className="pl-8"
                                  value={artistSearchQuery}
                                  onChange={(e) => setArtistSearchQuery(e.target.value)}
                                />
                              </div>
                              <Select
                                onValueChange={(value) => {
                                  if (!selectedArtists.includes(value)) {
                                    setSelectedArtists([...selectedArtists, value])
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[220px]">
                                  <SelectValue placeholder="Add an artist..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <ScrollArea className="h-[200px]">
                                    {artists
                                      .filter(artist =>
                                        !selectedArtists.includes(artist.id) &&
                                        (artistSearchQuery === '' ||
                                          artist.name.toLowerCase().includes(artistSearchQuery.toLowerCase())
                                        )
                                      )
                                      .map(artist => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                          {artist.name}
                                        </SelectItem>
                                      ))
                                    }
                                  </ScrollArea>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="border rounded-md p-2">
                              <h5 className="text-sm font-medium mb-2">Selected Artists</h5>
                              {selectedArtists.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedArtists.map(artistId => {
                                    const artist = artists.find(a => a.id === artistId)
                                    return artist ? (
                                      <div key={artist.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                        <div className="flex items-center gap-2">
                                          <IconUser className="h-4 w-4 text-muted-foreground" />
                                          <span>{artist.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedArtists(selectedArtists.filter(id => id !== artist.id))}
                                        >
                                          <IconX className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No artists selected</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">Enable "Artists" in Tag Usage to assign this tag to artists</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Collections Tab */}
                      <TabsContent value="collections" className="border rounded-md p-4">
                        {formState.forCollections ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="search"
                                  placeholder="Search collections..."
                                  className="pl-8"
                                  value={collectionSearchQuery}
                                  onChange={(e) => setCollectionSearchQuery(e.target.value)}
                                />
                              </div>
                              <Select
                                onValueChange={(value) => {
                                  if (!selectedCollections.includes(value)) {
                                    setSelectedCollections([...selectedCollections, value])
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[220px]">
                                  <SelectValue placeholder="Add a collection..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <ScrollArea className="h-[200px]">
                                    {collections
                                      .filter(collection =>
                                        !selectedCollections.includes(collection.id) &&
                                        (collectionSearchQuery === '' ||
                                          collection.name.toLowerCase().includes(collectionSearchQuery.toLowerCase())
                                        )
                                      )
                                      .map(collection => (
                                        <SelectItem key={collection.id} value={collection.id}>
                                          {collection.name}
                                        </SelectItem>
                                      ))
                                    }
                                  </ScrollArea>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="border rounded-md p-2">
                              <h5 className="text-sm font-medium mb-2">Selected Collections</h5>
                              {selectedCollections.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedCollections.map(collectionId => {
                                    const collection = collections.find(c => c.id === collectionId)
                                    return collection ? (
                                      <div key={collection.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                        <div className="flex items-center gap-2">
                                          <IconFolder className="h-4 w-4 text-muted-foreground" />
                                          <span>{collection.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedCollections(selectedCollections.filter(id => id !== collection.id))}
                                        >
                                          <IconX className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No collections selected</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">Enable "Collections" in Tag Usage to assign this tag to collections</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Tag"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
