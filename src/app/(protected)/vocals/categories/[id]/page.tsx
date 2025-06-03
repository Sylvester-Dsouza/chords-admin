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

  // Delete item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    try {
      await vocalService.deleteItem(itemId)
      toast.success(`Item "${itemName}" deleted successfully`)
      fetchCategory()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item. Please try again.')
    }
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
      audio.src = item.audioFileUrl
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
              <span>{formatDuration(item.durationSeconds)}</span>
              <span>{(item.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
              {!item.isActive && <Badge variant="secondary">Inactive</Badge>}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/vocals/items/${item.id}/edit`)}
          >
            <IconEdit className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <IconTrash className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{item.name}"?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            <Button onClick={() => router.push('/vocals')}>
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
                onClick={() => router.push('/vocals')}
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/vocals/categories/${categoryId}/edit`)}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Category
              </Button>
              <Button onClick={() => router.push(`/vocals/categories/${categoryId}/items/new`)}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items ({category.items.length})</CardTitle>
              <CardDescription>
                Vocal {category.type.toLowerCase()}s in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {category.items.length === 0 ? (
                <div className="text-center py-12">
                  <IconMusic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first vocal {category.type.toLowerCase()} to this category.
                  </p>
                  <Button onClick={() => router.push(`/vocals/categories/${categoryId}/items/new`)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
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

          {/* Hidden audio element */}
          <audio ref={audioRef} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
