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
import collectionService, { Collection } from "@/services/collection.service"
import apiClient from "@/services/api-client"

// Sortable table row component
interface SortableRowProps {
  collection: Collection;
  index: number;
  toggleCollectionSelection: (id: string) => Promise<void>;
}

function SortableRow({
  collection,
  index,
  toggleCollectionSelection
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: collection.id });

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
        <div className="font-medium">{collection.name}</div>
      </TableCell>
      <TableCell>
        {collection.songCount || 0} songs
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleCollectionSelection(collection.id)}
          className="h-8 w-8"
        >
          <IconTrash className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function ManageCollectionSectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [loadingAllCollections, setLoadingAllCollections] = useState(true)
  const [section, setSection] = useState<HomeSection | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [allCollections, setAllCollections] = useState<Collection[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])

  // Load section and its content
  useEffect(() => {
    const loadSectionAndContent = async () => {
      setLoading(true)
      try {
        // Load section details
        const sectionData = await homeSectionService.getSection(sectionId)

        // Verify this is a collection section
        if (sectionData.type !== SectionType.COLLECTIONS) {
          toast.error("This section is not a collection section")
          router.push('/home-sections')
          return
        }

        setSection(sectionData)
        setSelectedCollectionIds(sectionData.itemIds || [])

        // Load collections in the correct order
        if (sectionData.itemIds && sectionData.itemIds.length > 0) {
          // Load collections individually to handle 404 errors gracefully
          const validCollections: Collection[] = []
          const validCollectionIds: string[] = []
          
          for (const id of sectionData.itemIds) {
            try {
              const collection = await collectionService.getCollection(id)
              if (collection) {
                validCollections.push(collection)
                validCollectionIds.push(id)
              }
            } catch (error) {
              console.warn(`Collection with ID ${id} not found or error loading:`, error)
              // Skip this collection and continue with others
            }
          }
          
          // Update the section with only valid collection IDs
          if (validCollectionIds.length !== sectionData.itemIds.length) {
            try {
              // Update section to remove invalid collection IDs
              await homeSectionService.updateSection(sectionData.id, {
                itemIds: validCollectionIds
              })
              // Update local state with valid IDs
              setSelectedCollectionIds(validCollectionIds)
            } catch (updateError) {
              console.error("Error updating section with valid collection IDs:", updateError)
              // Continue anyway with the valid collections we found
            }
          }
          
          setCollections(validCollections)
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

  // Load all collections
  useEffect(() => {
    const loadAllCollections = async () => {
      setLoadingAllCollections(true)
      try {
        // Get all collections
        const allCollectionsData = await collectionService.getAllCollections()
        
        // For now, show all collections without filtering
        // This is more efficient and ensures collections are visible
        setAllCollections(allCollectionsData)
        setFilteredCollections(allCollectionsData)
        
        // If we need to filter by active songs in the future, we can implement a more efficient approach
        // such as a batch API call to check multiple collections at once
      } catch (error) {
        console.error("Error loading all collections:", error)
        toast.error("Failed to load collections. Please try again.")
      } finally {
        setLoadingAllCollections(false)
      }
    }

    loadAllCollections()
  }, [])

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCollections(allCollections)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allCollections.filter(collection =>
      collection.name.toLowerCase().includes(query)
    )
    setFilteredCollections(filtered)
  }

  // Filter collections when search query changes
  useEffect(() => {
    handleSearch()
  }, [searchQuery])

  // Check if a collection is selected
  const isCollectionSelected = (id: string) => {
    return selectedCollectionIds.includes(id)
  }

  // Toggle collection selection
  const toggleCollectionSelection = async (id: string) => {
    if (!section) return

    // Determine if we're adding or removing
    const isCurrentlySelected = isCollectionSelected(id)

    // Optimistically update UI first to prevent flashing
    let updatedCollectionIds: string[]

    if (isCurrentlySelected) {
      // Remove collection
      updatedCollectionIds = selectedCollectionIds.filter(collectionId => collectionId !== id)
      // Optimistically update the collections list
      setCollections(prev => prev.filter(collection => collection.id !== id))
    } else {
      // Add collection
      updatedCollectionIds = [...selectedCollectionIds, id]
      // Find the collection in allCollections
      const collectionToAdd = allCollections.find(collection => collection.id === id)
      if (collectionToAdd) {
        // Optimistically add to the collections list
        setCollections(prev => [...prev, collectionToAdd])
      }
    }

    // Optimistically update the selected IDs
    setSelectedCollectionIds(updatedCollectionIds)

    try {
      // Update section with new collection IDs
      const updatedSection = await homeSectionService.updateSection(section.id, {
        itemIds: updatedCollectionIds
      })

      // Update with server response
      setSection(updatedSection)
      setSelectedCollectionIds(updatedSection.itemIds || [])

      // Only reload from server if optimistic update might have missed something
      if (updatedCollectionIds.length > 0 && !isCurrentlySelected) {
        // We only need to reload if we're adding a collection
        // For removals, our optimistic update is sufficient
        const loadedCollections = await Promise.all(
          (updatedSection.itemIds || []).map(id => collectionService.getCollection(id))
        )
        // Filter out null collections but preserve order
        const validCollections = loadedCollections.filter(collection => collection !== null)
        // Sort collections to match the itemIds order
        validCollections.sort((a, b) => {
          const indexA = (updatedSection.itemIds || []).indexOf(a.id)
          const indexB = (updatedSection.itemIds || []).indexOf(b.id)
          return indexA - indexB
        })
        setCollections(validCollections)
      } else if (updatedCollectionIds.length === 0) {
        setCollections([])
      }

      toast.success(isCurrentlySelected
        ? "Collection removed from section"
        : "Collection added to section"
      )
    } catch (error) {
      console.error("Error updating collections:", error)
      toast.error("Failed to update collections. Please try again.")

      // Revert optimistic updates on error
      if (isCurrentlySelected) {
        // We tried to remove but failed, add back to selected IDs
        setSelectedCollectionIds(prev => [...prev, id])
        // Reload collections to restore state
        const loadedCollections = await Promise.all(
          selectedCollectionIds.map(id => collectionService.getCollection(id))
        )
        setCollections(loadedCollections.filter(collection => collection !== null))
      } else {
        // We tried to add but failed, remove from selected IDs
        setSelectedCollectionIds(prev => prev.filter(collectionId => collectionId !== id))
        // Reload collections to restore state
        const loadedCollections = await Promise.all(
          selectedCollectionIds.filter(collectionId => collectionId !== id)
            .map(id => collectionService.getCollection(id))
        )
        setCollections(loadedCollections.filter(collection => collection !== null))
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

    const oldIndex = collections.findIndex(collection => collection.id === active.id)
    const newIndex = collections.findIndex(collection => collection.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create new arrays for collections and IDs
    const newCollections = arrayMove(collections, oldIndex, newIndex)
    const newCollectionIds = newCollections.map(collection => collection.id)

    // Optimistically update UI
    setCollections(newCollections)
    setSelectedCollectionIds(newCollectionIds)

    try {
      // Update section with reordered collection IDs
      const updatedSection = await homeSectionService.updateSection(section.id, {
        itemIds: newCollectionIds
      })

      setSection(updatedSection)
      setSelectedCollectionIds(updatedSection.itemIds || [])

      toast.success("Collections reordered successfully")
    } catch (error) {
      console.error("Error reordering collections:", error)
      toast.error("Failed to reorder collections. Please try again.")

      // Revert to original order on error
      setCollections(collections)
      setSelectedCollectionIds(selectedCollectionIds)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Manage Collection Section" />
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
          <SiteHeader title="Manage Collection Section" />
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
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Collections</Badge>
                <span className="text-muted-foreground">
                  {collections.length} collections • {section.filterType ? `Filter: ${section.filterType}` : 'No filter'}
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

          {/* Two-column layout for Selected Collections and All Collections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected Collections Column */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Collections</CardTitle>
                <CardDescription>
                  These collections are currently displayed in this section. Drag to reorder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      No collections in this section yet. Select collections from the right panel.
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
                          <TableHead>Songs</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext
                        items={collections.map(collection => collection.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {collections.map((collection, index) => (
                            <SortableRow
                              key={collection.id}
                              collection={collection}
                              index={index}
                              toggleCollectionSelection={toggleCollectionSelection}
                            />
                          ))}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {/* All Collections Column */}
            <Card>
              <CardHeader>
                <CardTitle>All Collections</CardTitle>
                <CardDescription>
                  Select collections to add to this section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear
                  </Button>
                </div>

                {loadingAllCollections ? (
                  <div className="flex justify-center py-8">
                    <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCollections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      {searchQuery ? 'No collections found. Try a different search term.' : 'No collections available.'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Songs</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCollections.map((collection) => (
                          <TableRow
                            key={collection.id}
                            className={`${isCollectionSelected(collection.id) ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"} cursor-pointer`}
                            onClick={() => toggleCollectionSelection(collection.id)}
                          >
                            <TableCell>
                              <Button
                                variant={isCollectionSelected(collection.id) ? "secondary" : "ghost"}
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCollectionSelection(collection.id);
                                }}
                                className={`h-8 w-8 transition-all ${isCollectionSelected(collection.id) ? "bg-primary/20 hover:bg-primary/30" : ""}`}
                              >
                                {isCollectionSelected(collection.id) ? (
                                  <IconCheck className="h-4 w-4 text-primary" />
                                ) : (
                                  <IconPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{collection.name}</div>
                            </TableCell>
                            <TableCell>
                              {collection.songCount || 0} songs
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