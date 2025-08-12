"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconPlus,
  IconMusic,
  IconPlayerPlay,
  IconPlayerPause,
  IconGripVertical,
  IconSearch,
  IconFilter,
  IconX,
} from "@tabler/icons-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import vocalService, { VocalCategoryWithItems, VocalItem } from "@/services/vocal.service"
import { formatDuration } from "@/lib/audio-upload"

export default function VocalCategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = React.useState<VocalCategoryWithItems | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [playingItemId, setPlayingItemId] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  
  // State for managing all vocal items
  const [allVocalItems, setAllVocalItems] = React.useState<VocalItem[]>([])
  const [loadingAllItems, setLoadingAllItems] = React.useState(false)
  const [updatingItems, setUpdatingItems] = React.useState(false)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [durationFilter, setDurationFilter] = React.useState<string>('all')

  // Fetch category with items
  const fetchCategory = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await vocalService.getCategoryWithItems(categoryId)
      setCategory(data)
    } catch (err) {
      console.error('Error fetching vocal category:', err)
      setError('Failed to load vocal category. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  React.useEffect(() => {
    fetchCategory()
  }, [fetchCategory])

  // Fetch all vocal items
  const fetchAllVocalItems = React.useCallback(async () => {
    try {
      setLoadingAllItems(true)
      const data = await vocalService.getAllItems()
      setAllVocalItems(data)
    } catch (err) {
      console.error('Error fetching all vocal items:', err)
      toast.error('Failed to load vocal items')
    } finally {
      setLoadingAllItems(false)
    }
  }, [])

  // Load all vocal items on component mount
  React.useEffect(() => {
    fetchAllVocalItems()
  }, [fetchAllVocalItems])

  // Filter and search functions
  const getFilteredItems = React.useCallback(() => {
    console.log('Filtering items. Total items:', allVocalItems.length, 'Category items:', category?.items?.length || 0)
    let filtered = allVocalItems.filter(item => !isItemInCategory(item.id))
    console.log('Items after category filter:', filtered.length)

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => {
        const name = (item.name || item.audioFile?.name || '').toLowerCase()
        const tags = (item.audioFile?.tags || []).join(' ').toLowerCase()
        return name.includes(query) || tags.includes(query)
      })
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'uncategorized') {
        filtered = filtered.filter(item => !item.categoryId)
      } else if (categoryFilter === 'categorized') {
        filtered = filtered.filter(item => item.categoryId)
      }
    }

    // Duration filter
    if (durationFilter !== 'all') {
      filtered = filtered.filter(item => {
        const duration = item.audioFile?.durationSeconds || 0
        switch (durationFilter) {
          case 'short': return duration <= 30
          case 'medium': return duration > 30 && duration <= 120
          case 'long': return duration > 120
          default: return true
        }
      })
    }

    return filtered
  }, [allVocalItems, searchQuery, categoryFilter, durationFilter, category])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setDurationFilter('all')
  }

  // Remove item from category (not delete from database)
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    try {
      setUpdatingItems(true)
      await vocalService.updateItem(itemId, { categoryId: null })
      toast.success('Item removed from category successfully')
      fetchCategory()
      fetchAllVocalItems() // Refresh the list
    } catch (error) {
      console.error('Error removing item from category:', error)
      toast.error('Failed to remove item from category. Please try again.')
    } finally {
      setUpdatingItems(false)
    }
  }

  // Add item to category
  const handleAddItemToCategory = async (itemId: string) => {
    if (!category) return
    console.log('Adding item to category:', itemId, 'Category ID:', category.id)
    
    // Find the item to add
    const itemToAdd = allVocalItems.find(item => item.id === itemId)
    if (!itemToAdd) return
    
    try {
      setUpdatingItems(true)
      
      // Optimistic UI update - add to category immediately
      const updatedItem = { ...itemToAdd, categoryId: category.id }
      setCategory(prev => prev ? {
        ...prev,
        items: [...prev.items, updatedItem]
      } : prev)
      
      // Remove from available items list immediately
      setAllVocalItems(prev => 
        prev.map(item => 
          item.id === itemId ? updatedItem : item
        )
      )
      
      // Make API call in background
      await vocalService.updateItem(itemId, { categoryId: category.id })
      console.log('Item added successfully to backend')
      toast.success('Item added to category successfully')
      
    } catch (error) {
      console.error('Error adding item to category:', error)
      toast.error('Failed to add item to category')
      
      // Revert optimistic update on error
      fetchCategory()
      fetchAllVocalItems()
    } finally {
      setUpdatingItems(false)
    }
  }

  // Remove item from category
  const handleRemoveItemFromCategory = async (itemId: string) => {
    console.log('Removing item from category:', itemId)
    
    // Find the item to remove
    const itemToRemove = category?.items.find(item => item.id === itemId)
    if (!itemToRemove) return
    
    try {
      setUpdatingItems(true)
      
      // Optimistic UI update - remove from category immediately
      if (category) {
        setCategory({
          ...category,
          items: category.items.filter(item => item.id !== itemId)
        })
      }
      
      // Add to available items list immediately
      const updatedItem = { ...itemToRemove, categoryId: null }
      setAllVocalItems(prev => {
        const exists = prev.find(item => item.id === itemId)
        if (exists) {
          // Update existing item
          return prev.map(item => 
            item.id === itemId ? updatedItem : item
          )
        } else {
          // Add new item
          return [...prev, updatedItem]
        }
      })
      
      // Make API call in background
      await vocalService.updateItem(itemId, { categoryId: null })
      console.log('Item removed successfully from backend')
      toast.success('Item removed from category successfully')
      
    } catch (error) {
      console.error('Error removing item from category:', error)
      toast.error('Failed to remove item from category')
      
      // Revert optimistic update on error
      fetchCategory()
      fetchAllVocalItems()
    } finally {
      setUpdatingItems(false)
    }
  }

  // Check if item is in current category
  const isItemInCategory = (itemId: string) => {
    if (!category || !category.items) return false
    return category.items.some(item => item.id === itemId)
  }

  // Get items not in current category
  const getAvailableItems = () => {
    return allVocalItems.filter(item => !isItemInCategory(item.id))
  }

  // Play/pause audio
  const toggleAudio = (item: VocalItem) => {
    const audio = audioRef.current
    if (!audio) return

    if (playingItemId === item.id) {
      // Pause current audio
      audio.pause()
      setPlayingItemId(null)
    } else {
      // Play new audio
      audio.src = item.audioFile?.audioFileUrl || ''
      audio.play()
      setPlayingItemId(item.id)
    }
  }

  // Handle audio ended
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setPlayingItemId(null)
    audio.addEventListener('ended', handleEnded)

    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

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

  // Handle drag end for reordering items
  const handleDragEnd = async (event: DragEndEvent) => {
    if (!category) return

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = category.items.findIndex(item => item.id === active.id)
    const newIndex = category.items.findIndex(item => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Update local state immediately for better UX
    const newItems = arrayMove(category.items, oldIndex, newIndex)
    setCategory({
      ...category,
      items: newItems
    })

    try {
      // Send reorder request to backend
      const itemIds = newItems.map(item => item.id)
      await vocalService.reorderItems(categoryId, { itemIds })
      toast.success('Items reordered successfully')
    } catch (error) {
      console.error('Error reordering items:', error)
      toast.error('Failed to reorder items. Please try again.')
      // Revert the local state on error
      fetchCategory()
    }
  }

  // Sortable Item Component
  const SortableItemRow = ({ item, index }: { item: VocalItem; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 bg-card border-border ${
          isDragging
            ? 'opacity-50 shadow-lg scale-105 z-50'
            : 'hover:bg-accent/50 hover:shadow-sm hover:border-primary/20'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent/30 transition-colors"
            >
              <IconGripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-sm text-gray-500 w-8">{index + 1}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAudio(item)}
          >
            {playingItemId === item.id ? (
              <IconPlayerPause className="h-4 w-4" />
            ) : (
              <IconPlayerPlay className="h-4 w-4" />
            )}
          </Button>
          <div>
            <h4 className="font-medium">{item.name}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatDuration(item.audioFile?.durationSeconds || 0)}</span>
              <span>{((item.audioFile?.fileSizeBytes || 0) / 1024 / 1024).toFixed(2)} MB</span>
              {!item.isActive && <Badge variant="secondary">Inactive</Badge>}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveItemFromCategory(item.id)}
            disabled={updatingItems}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Remove from category"
          >
            <IconX className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Vocal Category" />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading category...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !category) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Vocal Category" />
          <div className="space-y-6 p-6">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Category not found'}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/vocal-categories')}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
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
        <SiteHeader title={category.name} />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/vocal-categories')}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                  <Badge className={category.type === 'WARMUP' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                    {category.type}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>

          </div>



          {/* Two-Column Layout for Managing Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Items in Category */}
            <Card>
              <CardHeader>
                <CardTitle>Items in Category ({category.items.length})</CardTitle>
                <CardDescription>
                  Drag and drop to reorder items in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {category.items.length === 0 ? (
                  <div className="text-center py-12">
                    <IconMusic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
                    <p className="text-muted-foreground">
                      Drag items from the right panel to add them to this category.
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={category.items.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {category.items.map((item, index) => (
                          <SortableItemRow key={item.id} item={item} index={index} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Available Items */}
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <CardTitle>Available Items ({getFilteredItems().length})</CardTitle>
                    <CardDescription>
                      Search and filter items to add to this category
                    </CardDescription>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by name or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-2">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="uncategorized">No Category</SelectItem>
                          <SelectItem value="categorized">Has Category</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={durationFilter} onValueChange={setDurationFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Lengths</SelectItem>
                          <SelectItem value="short">≤ 30s</SelectItem>
                          <SelectItem value="medium">30s - 2m</SelectItem>
                          <SelectItem value="long">&gt; 2m</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {(searchQuery || categoryFilter !== 'all' || durationFilter !== 'all') && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <IconX className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAllItems ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading vocal items...</p>
                  </div>
                ) : getFilteredItems().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconMusic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>
                      {searchQuery || categoryFilter !== 'all' || durationFilter !== 'all'
                        ? 'No items match your filters'
                        : 'All vocal items are already in categories'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {getFilteredItems().map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-medium truncate">
                              {item.name || item.audioFile?.name || 'Unnamed Item'}
                            </h5>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatDuration(item.audioFile?.durationSeconds || 0)}</span>
                              <span>{((item.audioFile?.fileSizeBytes || 0) / 1024 / 1024).toFixed(2)} MB</span>
                              {item.categoryId && (
                                <Badge variant="outline" className="text-xs">
                                  In other category
                                </Badge>
                              )}
                              {!item.categoryId && (
                                <Badge variant="secondary" className="text-xs">
                                  No category
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItemToCategory(item.id)}
                          disabled={updatingItems}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-shrink-0"
                        >
                          <IconPlus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hidden audio element */}
          <audio ref={audioRef} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
