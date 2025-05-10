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
import artistService, { Artist } from "@/services/artist.service"

// Sortable table row component
interface SortableRowProps {
  artist: Artist;
  index: number;
  toggleArtistSelection: (id: string) => Promise<void>;
}

function SortableRow({
  artist,
  index,
  toggleArtistSelection
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: artist.id });

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
        <div className="font-medium">{artist.name}</div>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleArtistSelection(artist.id)}
          className="h-8 w-8"
        >
          <IconTrash className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function ManageArtistSectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [loadingAllArtists, setLoadingAllArtists] = useState(true)
  const [section, setSection] = useState<HomeSection | null>(null)
  const [artists, setArtists] = useState<Artist[]>([])
  const [allArtists, setAllArtists] = useState<Artist[]>([])
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])

  // Load section and its content
  useEffect(() => {
    const loadSectionAndContent = async () => {
      setLoading(true)
      try {
        // Load section details
        const sectionData = await homeSectionService.getSection(sectionId)

        // Verify this is an artist section
        if (sectionData.type !== SectionType.ARTISTS) {
          toast.error("This section is not an artist section")
          router.push('/home-sections')
          return
        }

        setSection(sectionData)
        setSelectedArtistIds(sectionData.itemIds || [])

        // Load artists
        if (sectionData.itemIds && sectionData.itemIds.length > 0) {
          const loadedArtists = await Promise.all(
            sectionData.itemIds.map(id => artistService.getArtist(id))
          )
          setArtists(loadedArtists.filter(artist => artist !== null))
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

  // Load all artists
  useEffect(() => {
    const loadAllArtists = async () => {
      setLoadingAllArtists(true)
      try {
        const allArtistsData = await artistService.getAllArtists()
        setAllArtists(allArtistsData)
        setFilteredArtists(allArtistsData)
      } catch (error) {
        console.error("Error loading all artists:", error)
        toast.error("Failed to load artists. Please try again.")
      } finally {
        setLoadingAllArtists(false)
      }
    }

    loadAllArtists()
  }, [])

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredArtists(allArtists)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allArtists.filter(artist =>
      artist.name.toLowerCase().includes(query)
    )
    setFilteredArtists(filtered)
  }

  // Filter artists when search query changes
  useEffect(() => {
    handleSearch()
  }, [searchQuery])

  // Check if an artist is selected
  const isArtistSelected = (id: string) => {
    return selectedArtistIds.includes(id)
  }

  // Toggle artist selection
  const toggleArtistSelection = async (id: string) => {
    if (!section) return

    // Determine if we're adding or removing
    const isCurrentlySelected = isArtistSelected(id)

    // Optimistically update UI first to prevent flashing
    let updatedArtistIds: string[]

    if (isCurrentlySelected) {
      // Remove artist
      updatedArtistIds = selectedArtistIds.filter(artistId => artistId !== id)
      // Optimistically update the artists list
      setArtists(prev => prev.filter(artist => artist.id !== id))
    } else {
      // Add artist
      updatedArtistIds = [...selectedArtistIds, id]
      // Find the artist in allArtists
      const artistToAdd = allArtists.find(artist => artist.id === id)
      if (artistToAdd) {
        // Optimistically add to the artists list
        setArtists(prev => [...prev, artistToAdd])
      }
    }

    // Optimistically update the selected IDs
    setSelectedArtistIds(updatedArtistIds)

    try {
      // Update section with new artist IDs
      const updatedSection = await homeSectionService.updateSection(section.id, {
        itemIds: updatedArtistIds
      })

      // Update with server response
      setSection(updatedSection)
      setSelectedArtistIds(updatedSection.itemIds || [])

      // Only reload from server if optimistic update might have missed something
      if (updatedArtistIds.length > 0 && !isCurrentlySelected) {
        // We only need to reload if we're adding an artist
        // For removals, our optimistic update is sufficient
        const loadedArtists = await Promise.all(
          (updatedSection.itemIds || []).map(id => artistService.getArtist(id))
        )
        setArtists(loadedArtists.filter(artist => artist !== null))
      } else if (updatedArtistIds.length === 0) {
        setArtists([])
      }

      toast.success(isCurrentlySelected
        ? "Artist removed from section"
        : "Artist added to section"
      )
    } catch (error) {
      console.error("Error updating artists:", error)
      toast.error("Failed to update artists. Please try again.")

      // Revert optimistic updates on error
      if (isCurrentlySelected) {
        // We tried to remove but failed, add back to selected IDs
        setSelectedArtistIds(prev => [...prev, id])
        // Reload artists to restore state
        const loadedArtists = await Promise.all(
          selectedArtistIds.map(id => artistService.getArtist(id))
        )
        setArtists(loadedArtists.filter(artist => artist !== null))
      } else {
        // We tried to add but failed, remove from selected IDs
        setSelectedArtistIds(prev => prev.filter(artistId => artistId !== id))
        // Reload artists to restore state
        const loadedArtists = await Promise.all(
          selectedArtistIds.filter(artistId => artistId !== id)
            .map(id => artistService.getArtist(id))
        )
        setArtists(loadedArtists.filter(artist => artist !== null))
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

    const oldIndex = artists.findIndex(artist => artist.id === active.id)
    const newIndex = artists.findIndex(artist => artist.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create new arrays for artists and IDs
    const newArtists = arrayMove(artists, oldIndex, newIndex)
    const newArtistIds = newArtists.map(artist => artist.id)

    // Optimistically update UI
    setArtists(newArtists)
    setSelectedArtistIds(newArtistIds)

    try {
      // Update section with reordered artist IDs
      const updatedSection = await homeSectionService.updateSection(section.id, {
        itemIds: newArtistIds
      })

      setSection(updatedSection)
      setSelectedArtistIds(updatedSection.itemIds || [])

      toast.success("Artists reordered successfully")
    } catch (error) {
      console.error("Error reordering artists:", error)
      toast.error("Failed to reorder artists. Please try again.")

      // Revert to original order on error
      setArtists(artists)
      setSelectedArtistIds(selectedArtistIds)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Manage Artist Section" />
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
          <SiteHeader title="Manage Artist Section" />
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
                <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Artists</Badge>
                <span className="text-muted-foreground">
                  {artists.length} artists • {section.filterType ? `Filter: ${section.filterType}` : 'No filter'}
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

          {/* Two-column layout for Selected Artists and All Artists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected Artists Column */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Artists</CardTitle>
                <CardDescription>
                  These artists are currently displayed in this section. Drag to reorder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {artists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      No artists in this section yet. Select artists from the right panel.
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
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext
                        items={artists.map(artist => artist.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {artists.map((artist, index) => (
                            <SortableRow
                              key={artist.id}
                              artist={artist}
                              index={index}
                              toggleArtistSelection={toggleArtistSelection}
                            />
                          ))}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {/* All Artists Column */}
            <Card>
              <CardHeader>
                <CardTitle>All Artists</CardTitle>
                <CardDescription>
                  Select artists to add to this section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Search artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear
                  </Button>
                </div>

                {loadingAllArtists ? (
                  <div className="flex justify-center py-8">
                    <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredArtists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      {searchQuery ? 'No artists found. Try a different search term.' : 'No artists available.'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredArtists.map((artist) => (
                          <TableRow
                            key={artist.id}
                            className={`${isArtistSelected(artist.id) ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"} cursor-pointer`}
                            onClick={() => toggleArtistSelection(artist.id)}
                          >
                            <TableCell>
                              <Button
                                variant={isArtistSelected(artist.id) ? "secondary" : "ghost"}
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleArtistSelection(artist.id);
                                }}
                                className={`h-8 w-8 transition-all ${isArtistSelected(artist.id) ? "bg-primary/20 hover:bg-primary/30" : ""}`}
                              >
                                {isArtistSelected(artist.id) ? (
                                  <IconCheck className="h-4 w-4 text-primary" />
                                ) : (
                                  <IconPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{artist.name}</div>
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
