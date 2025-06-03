"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconMusic,
  IconMicrophone,
  IconEye,
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
  rectSortingStrategy,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import vocalService, { VocalCategory, VocalType } from "@/services/vocal.service"

export default function VocalsPage() {
  const router = useRouter()
  const [categories, setCategories] = React.useState<VocalCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // Fetch categories
  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await vocalService.getAllCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching vocal categories:', err)
      setError('Failed to load vocal categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Delete category
  const handleDelete = async (id: string, name: string) => {
    try {
      await vocalService.deleteCategory(id)
      toast.success(`Category "${name}" deleted successfully`)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category. Make sure it has no items.')
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

  // Handle drag end for reordering categories
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = filteredCategories.findIndex(category => category.id === active.id)
    const newIndex = filteredCategories.findIndex(category => category.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Update local state immediately for better UX
    const newCategories = arrayMove(filteredCategories, oldIndex, newIndex)

    // Update the main categories array to maintain consistency
    const updatedCategories = [...categories]
    const categoryToMove = updatedCategories.find(cat => cat.id === active.id)
    if (categoryToMove) {
      const mainOldIndex = updatedCategories.findIndex(cat => cat.id === active.id)
      const mainNewIndex = updatedCategories.findIndex(cat => cat.id === over.id)
      if (mainOldIndex !== -1 && mainNewIndex !== -1) {
        const reorderedCategories = arrayMove(updatedCategories, mainOldIndex, mainNewIndex)
        setCategories(reorderedCategories)
      }
    }

    try {
      // Send reorder request to backend
      const categoryIds = newCategories.map(category => category.id)
      await vocalService.reorderCategories({ categoryIds })
      toast.success('Categories reordered successfully')
    } catch (error) {
      console.error('Error reordering categories:', error)
      toast.error('Failed to reorder categories. Please try again.')
      // Revert the local state on error
      fetchCategories()
    }
  }

  // Filter categories by type
  const filteredCategories = React.useMemo(() => {
    if (activeTab === "all") return categories
    return categories.filter(category => category.type === activeTab.toUpperCase())
  }, [categories, activeTab])

  // Get category type icon
  const getCategoryIcon = (type: VocalType) => {
    return type === VocalType.WARMUP ? IconMicrophone : IconMusic
  }

  // Get category type color
  const getCategoryTypeColor = (type: VocalType) => {
    return type === VocalType.WARMUP ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  // Sortable Category Card Component
  const SortableCategoryCard = ({ category }: { category: VocalCategory }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    const IconComponent = getCategoryIcon(category.type)

    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={`transition-all duration-200 bg-card border-border ${
          isDragging
            ? 'opacity-50 shadow-lg scale-105 z-50'
            : 'hover:shadow-md hover:scale-[1.02] hover:border-primary/20'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getCategoryTypeColor(category.type)}>
                    {category.type}
                  </Badge>
                  <Badge variant="outline">
                    {category.itemCount || 0} items
                  </Badge>
                </div>
              </div>
            </div>
            <div
              {...attributes}
              {...listeners}
              className="flex items-center space-x-1 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent/30 transition-colors"
            >
              <IconGripVertical className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {category.description && (
            <CardDescription className="mb-4">
              {category.description}
            </CardDescription>
          )}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/vocals/categories/${category.id}`)}
              >
                <IconEye className="mr-1 h-3 w-3" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/vocals/categories/${category.id}/edit`)}
              >
                <IconEdit className="mr-1 h-3 w-3" />
                Edit
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconTrash className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{category.name}"?
                    This action cannot be undone and will only work if the category has no items.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(category.id, category.name)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Vocal Management" />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading vocal categories...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Vocal Management" />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Vocal Management</h1>
              <p className="text-muted-foreground">
                Manage vocal warmups and exercises for your app
              </p>
            </div>
            <Button onClick={() => router.push('/vocals/categories/new')}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Categories</TabsTrigger>
              <TabsTrigger value="warmup">Warmups</TabsTrigger>
              <TabsTrigger value="exercise">Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredCategories.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <IconMicrophone className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No categories found
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      {activeTab === "all" 
                        ? "Get started by creating your first vocal category."
                        : `No ${activeTab} categories found. Create one to get started.`
                      }
                    </p>
                    <Button onClick={() => router.push('/vocals/categories/new')}>
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredCategories.map(category => category.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredCategories.map((category) => (
                        <SortableCategoryCard key={category.id} category={category} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
