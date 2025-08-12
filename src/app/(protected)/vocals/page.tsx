"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconMusic,
  IconSearch,
  IconFilter,
  IconEye,
  IconDotsVertical,
  IconAlertCircle,
  IconFileMusic,
  IconClock,
  IconDatabase,
  IconTag,
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import vocalService, { 
  VocalItem, 
  VocalCategory, 
  VocalLibrary, 
  CreateVocalItemDto,
  UpdateVocalItemDto,
  VocalType 
} from "@/services/vocal.service"

export default function VocalsPage() {
  const router = useRouter()
  const [items, setItems] = React.useState<VocalItem[]>([])
  const [categories, setCategories] = React.useState<VocalCategory[]>([])
  const [audioFiles, setAudioFiles] = React.useState<VocalLibrary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<VocalItem | null>(null)
  const [formData, setFormData] = React.useState<CreateVocalItemDto>({
    categoryId: undefined,
    audioFileId: "",
    name: "",
    displayOrder: 0,
    isActive: true,
  })
  
  // Upload states
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [categoriesData, audioFilesData] = await Promise.all([
        vocalService.getAllCategories(),
        vocalService.getAllAudioFiles(true), // Only active audio files
      ])
      
      setCategories(categoriesData)
      setAudioFiles(audioFilesData)
      // Use audioFiles as items since we removed VocalItem model
      setItems(audioFilesData.map(audioFile => ({
        id: audioFile.id,
        categoryId: audioFile.categoryId,
        audioFileId: audioFile.id,
        name: audioFile.name,
        displayOrder: audioFile.displayOrder,
        isActive: audioFile.isActive,
        createdAt: new Date(audioFile.createdAt),
        updatedAt: new Date(audioFile.updatedAt),
        audioFile: audioFile
      })))
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter items
  const filteredItems = items.filter((item) => {
    const itemName = item.name || item.audioFile?.name || ""
    const audioFileName = item.audioFile?.fileName || ""
    const categoryName = item.categoryId ? (categories.find(c => c.id === item.categoryId)?.name || "") : "No Category"
    
    const matchesSearch =
      itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audioFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || 
      (categoryFilter === "none" && !item.categoryId) ||
      item.categoryId === categoryFilter

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "inactive" && !item.isActive)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Handle create item
  const handleCreate = async () => {
    try {
      if (!selectedFile) {
        toast.error("Please select a file to upload")
        return
      }

      setUploading(true)
      
      try {
        // Upload directly to VocalLibrary with category assignment
        const uploadData = {
          name: selectedFile.name.replace(/\.[^/.]+$/, ''),
          categoryId: formData.categoryId || null,
          displayOrder: formData.displayOrder || 0,
        }
        
        const uploadedAudioFile = await vocalService.uploadAudioFile(selectedFile, uploadData)
        toast.success("Vocal library item created successfully")
      } catch (uploadError) {
        console.error('Error uploading audio file:', uploadError)
        toast.error('Failed to upload audio file')
        return
      } finally {
        setUploading(false)
      }
      setIsCreateModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error creating vocal item:', error)
      toast.error('Failed to create vocal item')
    }
  }

  // Handle edit item
  const handleEdit = async () => {
    try {
      if (!editingItem) return

      const updateData: UpdateVocalItemDto = {
        categoryId: formData.categoryId,
        audioFileId: formData.audioFileId,
        name: formData.name || undefined,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      }

      await vocalService.updateItem(editingItem.id, updateData)
      toast.success("Vocal item updated successfully")
      setIsEditModalOpen(false)
      setEditingItem(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error updating vocal item:', error)
      toast.error('Failed to update vocal item')
    }
  }

  // Handle delete item
  const handleDelete = async (id: string, name: string) => {
    try {
      await vocalService.deleteItem(id)
      toast.success(`Vocal item "${name}" deleted successfully`)
      fetchData()
    } catch (error) {
      console.error('Error deleting vocal item:', error)
      toast.error('Failed to delete vocal item')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      categoryId: undefined,
      audioFileId: "",
      name: "",
      displayOrder: 0,
      isActive: true,
    })
    setSelectedFile(null)
    setUploading(false)
  }

  // Open edit modal
  const openEditModal = (item: VocalItem) => {
    setEditingItem(item)
    setFormData({
      categoryId: item.categoryId || undefined,
      audioFileId: item.audioFileId,
      name: item.name || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    })
    setIsEditModalOpen(true)
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Vocal Items" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
        <SiteHeader title="Vocal Items" />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Vocal Items</h1>
              <p className="text-muted-foreground">
                Manage vocal warmup and exercise items
              </p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Vocal Item</DialogTitle>
                  <DialogDescription>
                    Create a new vocal item by selecting a category and audio file.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Select
                        value={formData.categoryId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value === "none" ? undefined : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name} ({category.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audioFile">Audio File *</Label>
                      <div>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Custom Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Override the audio file name..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={uploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={uploading}>
                    {uploading ? "Uploading..." : "Create Item"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setCategoryFilter("all")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Vocal Items ({filteredItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Audio File</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const category = categories.find(c => c.id === item.categoryId)
                    const audioFile = item.audioFile
                    const displayName = item.name || audioFile?.name || "Unnamed Item"
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <IconFileMusic className="h-4 w-4 text-muted-foreground" />
                            {displayName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {category ? (
                            <Badge variant={category.type === VocalType.WARMUP ? "default" : "secondary"}>
                              {category.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              No Category
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{audioFile?.name}</div>
                            <div className="text-xs text-muted-foreground">{audioFile?.fileName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IconClock className="h-3 w-3 text-muted-foreground" />
                            {audioFile ? formatDuration(audioFile.durationSeconds) : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IconDatabase className="h-3 w-3 text-muted-foreground" />
                            {audioFile ? formatFileSize(audioFile.fileSizeBytes) : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{item.displayOrder}</TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(item)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <IconTrash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Vocal Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{displayName}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(item.id, displayName)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No vocal items found. {searchQuery || categoryFilter !== "all" || statusFilter !== "all" 
                          ? "Try adjusting your filters." 
                          : "Create your first vocal item to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Vocal Item</DialogTitle>
            <DialogDescription>
              Update the vocal item details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category (Optional)</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value === "none" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-audioFile">Audio File *</Label>
                <Select
                  value={formData.audioFileId}
                  onValueChange={(value) => setFormData({ ...formData, audioFileId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audio file" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioFiles.map((audioFile) => (
                      <SelectItem key={audioFile.id} value={audioFile.id}>
                        <div className="flex flex-col">
                          <span>{audioFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(audioFile.durationSeconds)} • {formatFileSize(audioFile.fileSizeBytes)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Custom Name (Optional)</Label>
              <Input
                id="edit-name"
                placeholder="Override the audio file name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-displayOrder">Display Order</Label>
                <Input
                  id="edit-displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
