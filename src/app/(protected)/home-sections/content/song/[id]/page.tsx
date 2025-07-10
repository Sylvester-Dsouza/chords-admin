"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconArrowLeft,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconCheck,
  IconGripVertical,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import homeSectionService, { HomeSection, SectionType } from "@/services/home-section.service"
import songService, { Song } from "@/services/song.service"

// Sortable table row component
interface SortableRowProps {
  song: Song;
  index: number;
  toggleSongSelection: (id: string) => Promise<void>;
}

function SortableRow({
  song,
  index,
  toggleSongSelection
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted/50" : ""}>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">{index + 1}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical className="h-4 w-4" />
            <span className="sr-only">Drag to reorder</span>
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{song.title}</div>
      </TableCell>
      <TableCell>
        {song.artist?.name || 'Unknown Artist'}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleSongSelection(song.id)}
          className="h-8 w-8"
        >
          <IconTrash className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function ManageSongSectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [loadingAllSongs, setLoadingAllSongs] = useState(true)
  const [section, setSection] = useState<HomeSection | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])

  // Load section and its content
  useEffect(() => {
    const loadSectionAndContent = async () => {
      setLoading(true)
      try {
        // Load section details
        const sectionData = await homeSectionService.getSection(sectionId)

        // Verify this is a song section or song list section
        if (sectionData.type !== SectionType.SONGS && sectionData.type !== SectionType.SONG_LIST) {
          toast.error("This section is not a song section")
          router.push('/home-sections')
          return
        }

        setSection(sectionData)
        setSelectedSongIds(sectionData.itemIds || [])

        // Load songs in the correct order
        if (sectionData.itemIds && sectionData.itemIds.length > 0) {
          // Load songs individually to handle 404 errors gracefully
          const validSongs: Song[] = []
          const validSongIds: string[] = []
          
          for (const id of sectionData.itemIds) {
            try {
              const song = await songService.getSong(id)
              if (song) {
                validSongs.push(song)
                validSongIds.push(id)
              }
            } catch (error) {
              console.warn(`Song with ID ${id} not found or error loading:`, error)
              // Skip this song and continue with others
            }
          }
          
          // Update the section with only valid song IDs
          if (validSongIds.length !== sectionData.itemIds.length) {
            try {
              // Update section to remove invalid song IDs
              await homeSectionService.updateSection(sectionData.id, {
                itemIds: validSongIds
              })
              // Update local state with valid IDs
              setSelectedSongIds(validSongIds)
            } catch (updateError) {
              console.error("Error updating section with valid song IDs:", updateError)
              // Continue anyway with the valid songs we found
            }
          }
          
          setSongs(validSongs)
        }
      } catch (error) {
        console.error("Error loading section:", error)
        toast.error("Failed to load section. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSectionAndContent()
  }, [sectionId, router])

  // Load all active songs (excluding drafts)
  useEffect(() => {
    const loadAllSongs = async () => {
      setLoadingAllSongs(true)
      try {
        // Get all songs and filter to only include active songs
        const allSongsData = await songService.getAllSongs()
        const activeSongsOnly = allSongsData.filter(song => song.status === 'ACTIVE')
        setAllSongs(activeSongsOnly)
        setFilteredSongs(activeSongsOnly)
      } catch (error) {
        console.error("Error loading all songs:", error)
        toast.error("Failed to load songs. Please try again.")
      } finally {
        setLoadingAllSongs(false)
      }
    }

    loadAllSongs()
  }, [])

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredSongs(allSongs)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      (song.artist?.name && song.artist.name.toLowerCase().includes(query))
    )
    setFilteredSongs(filtered)
  }

  // Filter songs when search query changes
  useEffect(() => {
    handleSearch()
  }, [searchQuery])

  // Check if a song is selected
  const isSongSelected = (id: string) => {
    return selectedSongIds.includes(id)
  }

  // Toggle song selection
  const toggleSongSelection = async (id: string) => {
    if (!section) return

    // Determine if we're adding or removing
    const isCurrentlySelected = isSongSelected(id)

    // Optimistically update UI first to prevent flashing
    let updatedSongIds: string[]

    if (isCurrentlySelected) {
      // Remove song
      updatedSongIds = selectedSongIds.filter(songId => songId !== id)
      // Optimistically update the songs list
      setSongs(prev => prev.filter(song => song.id !== id))
    } else {
      // Add song
      updatedSongIds = [...selectedSongIds, id]
      // Find the song in allSongs
      const songToAdd = allSongs.find(song => song.id === id)
      if (songToAdd) {
        // Optimistically add to the songs list
        setSongs(prev => [...prev, songToAdd])
      }
    }

    // Optimistically update the selected IDs
    setSelectedSongIds(updatedSongIds)

    try {
      // Update section with new song IDs
      const updatedSection = await homeSectionService.updateSection(section.id, {
        itemIds: updatedSongIds
      })

      // Update with server response
      setSection(updatedSection)
      setSelectedSongIds(updatedSection.itemIds || [])

      // Only reload from server if optimistic update might have missed something
      if (updatedSongIds.length > 0 && !isCurrentlySelected) {
        // We only need to reload if we're adding a song
        // For removals, our optimistic update is sufficient
        const loadedSongs = await Promise.all(
          (updatedSection.itemIds || []).map(id => songService.getSong(id))
        )
        // Filter out null songs but preserve order
        const validSongs = loadedSongs.filter(song => song !== null)
        // Sort songs to match the itemIds order
        validSongs.sort((a, b) => {
          const indexA = (updatedSection.itemIds || []).indexOf(a.id)
          const indexB = (updatedSection.itemIds || []).indexOf(b.id)
          return indexA - indexB
        })
        setSongs(validSongs)
      } else if (updatedSongIds.length === 0) {
        setSongs([])
      }

      toast.success(isCurrentlySelected
        ? "Song removed from section"
        : "Song added to section"
      )
    } catch (error) {
      console.error("Error updating songs:", error)
      toast.error("Failed to update songs. Please try again.")

      // Revert optimistic updates on error
      if (isCurrentlySelected) {
        // We tried to remove but failed, add back to selected IDs
        setSelectedSongIds(prev => [...prev, id])
        // Reload songs to restore state
        const loadedSongs = await Promise.all(
          selectedSongIds.map(id => songService.getSong(id))
        )
        setSongs(loadedSongs.filter(song => song !== null))
      } else {
        // We tried to add but failed, remove from selected IDs
        setSelectedSongIds(prev => prev.filter(songId => songId !== id))
        // Reload songs to restore state
        const loadedSongs = await Promise.all(
          selectedSongIds.filter(songId => songId !== id)
            .map(id => songService.getSong(id))
        )
        setSongs(loadedSongs.filter(song => song !== null))
      }
    }
  }

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    if (!section) return

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = songs.findIndex(song => song.id === active.id)
    const newIndex = songs.findIndex(song => song.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create new arrays for songs and IDs
    const newSongs = arrayMove(songs, oldIndex, newIndex)
    const newSongIds = newSongs.map(song => song.id)

    // Optimistically update UI
    setSongs(newSongs)
    setSelectedSongIds(newSongIds)

    try {
      // Update section with reordered song IDs
      const updatedSection = await homeSectionService.updateSection(section.id, {
        itemIds: newSongIds
      })

      setSection(updatedSection)
      setSelectedSongIds(updatedSection.itemIds || [])

      toast.success("Songs reordered successfully")
    } catch (error) {
      console.error("Error reordering songs:", error)
      toast.error("Failed to reorder songs. Please try again.")

      // Revert to original order on error
      setSongs(songs)
      setSelectedSongIds(selectedSongIds)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Manage Song Section" />
          <div className="flex h-[80vh] w-full items-center justify-center">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!section) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Manage Song Section" />
          <div className="flex h-[80vh] w-full items-center justify-center flex-col">
            <p className="text-muted-foreground mb-4">Section not found</p>
            <Button onClick={() => router.push('/home-sections')}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Home Sections
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={`Manage ${section.title}`} />
        <div className="space-y-6 p-6">
          {/* Header with section info and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={section.type === SectionType.SONG_LIST ? "bg-teal-50 text-teal-700 hover:bg-teal-50" : "bg-green-50 text-green-700 hover:bg-green-50"}>
                  {section.type === SectionType.SONG_LIST ? "Song List" : "Songs"}
                </Badge>
                <span className="text-muted-foreground">
                  {songs.length} songs • {section.filterType ? `Filter: ${section.filterType}` : 'No filter'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.push('/home-sections')}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>

          {/* Two-column layout for Selected Songs and All Songs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected Songs Column */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Songs</CardTitle>
                <CardDescription>
                  These songs are currently displayed in this section. Drag to reorder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {songs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      No songs in this section yet. Select songs from the right panel.
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Order</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext
                        items={songs.map(song => song.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {songs.map((song, index) => (
                            <SortableRow
                              key={song.id}
                              song={song}
                              index={index}
                              toggleSongSelection={toggleSongSelection}
                            />
                          ))}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {/* All Songs Column */}
            <Card>
              <CardHeader>
                <CardTitle>All Songs</CardTitle>
                <CardDescription>
                  Select songs to add to this section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear
                  </Button>
                </div>

                {loadingAllSongs ? (
                  <div className="flex justify-center py-8">
                    <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredSongs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      {searchQuery ? 'No songs found. Try a different search term.' : 'No songs available.'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Artist</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSongs.map((song) => (
                          <TableRow
                            key={song.id}
                            className={`${isSongSelected(song.id) ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"} cursor-pointer`}
                            onClick={() => toggleSongSelection(song.id)}
                          >
                            <TableCell>
                              <Button
                                variant={isSongSelected(song.id) ? "secondary" : "ghost"}
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSongSelection(song.id);
                                }}
                                className={`h-8 w-8 transition-all ${isSongSelected(song.id) ? "bg-primary/20 hover:bg-primary/30" : ""}`}
                              >
                                {isSongSelected(song.id) ? (
                                  <IconCheck className="h-4 w-4 text-primary" />
                                ) : (
                                  <IconPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{song.title}</div>
                            </TableCell>
                            <TableCell>
                              {song.artist?.name || 'Unknown Artist'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
  }
