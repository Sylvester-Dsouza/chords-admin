"use client"

import { useState, useEffect, useRef } from "react"
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
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconEye,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconUpload,
  IconPhoto,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import homeSectionService, { HomeSection, SectionType } from "@/services/home-section.service"
import { ImageUpload } from "@/components/ui/image-upload"
import { STORAGE_FOLDERS, uploadImage, deleteImage } from "@/lib/image-upload"

// Define banner item interfaces
export enum LinkType {
  NONE = 'NONE',
  SONG = 'SONG',
  ARTIST = 'ARTIST',
  COLLECTION = 'COLLECTION',
  EXTERNAL = 'EXTERNAL'
}

export interface BannerItem {
  id: string;
  homeSectionId: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkType?: string;
  linkId?: string;
  externalUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerItemDto {
  title: string;
  description?: string;
  imageUrl: string;
  linkType?: string;
  linkId?: string;
  externalUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateBannerItemDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkType?: string;
  linkId?: string;
  externalUrl?: string;
  order?: number;
  isActive?: boolean;
}

// Mock banner item service (replace with actual service)
const bannerItemService = {
  getBannerItemsBySection: async (sectionId: string): Promise<BannerItem[]> => {
    // Mock implementation
    return [];
  },
  createBannerItem: async (sectionId: string, data: CreateBannerItemDto): Promise<BannerItem> => {
    // Mock implementation
    return {
      id: 'new-id',
      homeSectionId: sectionId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      linkType: data.linkType,
      linkId: data.linkId,
      externalUrl: data.externalUrl,
      order: data.order || 0,
      isActive: data.isActive || true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  updateBannerItem: async (id: string, data: UpdateBannerItemDto): Promise<BannerItem> => {
    // Mock implementation
    return {
      id,
      homeSectionId: 'section-id',
      title: data.title || '',
      description: data.description,
      imageUrl: data.imageUrl || '',
      linkType: data.linkType,
      linkId: data.linkId,
      externalUrl: data.externalUrl,
      order: data.order || 0,
      isActive: data.isActive || true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  deleteBannerItem: async (id: string): Promise<BannerItem> => {
    // Mock implementation
    return {
      id,
      homeSectionId: 'section-id',
      title: '',
      imageUrl: '',
      order: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  reorderBannerItems: async (sectionId: string, data: { bannerItemIds: string[] }): Promise<BannerItem[]> => {
    // Mock implementation
    return [];
  },
};

export default function BannerItemsPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<HomeSection | null>(null)
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentBannerItem, setCurrentBannerItem] = useState<BannerItem | null>(null)
  const [formData, setFormData] = useState<CreateBannerItemDto>({
    title: '',
    imageUrl: '',
    linkType: LinkType.NONE,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Load section and banner items
  useEffect(() => {
    const loadSectionAndBannerItems = async () => {
      setLoading(true)
      try {
        // Load section details
        const sectionData = await homeSectionService.getSection(sectionId)

        // Verify this is a banner section
        if (sectionData.type !== SectionType.BANNER) {
          toast.error("This section is not a banner section")
          router.push('/home-sections')
          return
        }

        setSection(sectionData)

        // Load banner items
        const items = await bannerItemService.getBannerItemsBySection(sectionId)
        setBannerItems(items)
      } catch (error) {
        console.error("Error loading section:", error)
        toast.error("Failed to load section. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSectionAndBannerItems()
  }, [sectionId, router])

  // Handle image selection from ImageUpload component
  const handleImageSelected = (file: File | null, preview: string | null) => {
    setSelectedFile(file)

    // If we have a preview URL, use it for display
    if (preview) {
      setFormData(prev => ({ ...prev, imageUrl: preview }))
    } else {
      setFormData(prev => ({ ...prev, imageUrl: '' }))
    }
  }

  // Handle image removal
  const handleImageRemoved = (previousUrl: string) => {
    // If it's a real URL (not a blob), mark it for deletion
    if (previousUrl.startsWith('http')) {
      // Delete the image when the form is submitted
      deleteImage(previousUrl).then(success => {
        if (success) {
          console.log('Image deleted successfully:', previousUrl)
        } else {
          console.warn('Failed to delete image:', previousUrl)
        }
      }).catch(error => {
        console.error('Error deleting image:', error)
      })
    }

    // Update the form state
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle link type selection
  const handleLinkTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      linkType: value as LinkType,
      // Reset link-related fields when changing link type
      linkId: undefined,
      externalUrl: undefined
    }))
  }

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkType: LinkType.NONE,
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setCurrentBannerItem(null)
  }

  // Open add dialog
  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (item: BannerItem) => {
    setCurrentBannerItem(item)
    setFormData({
      title: item.title,
      description: item.description || undefined,
      imageUrl: item.imageUrl,
      linkType: item.linkType as LinkType || LinkType.NONE,
      linkId: item.linkId || undefined,
      externalUrl: item.externalUrl || undefined,
      isActive: item.isActive
    })
    setPreviewUrl(item.imageUrl)
    setIsEditDialogOpen(true)
  }

  // Upload image to server
  const handleImageUpload = async () => {
    if (!selectedFile) return null

    setIsUploading(true)
    try {
      // Use the entity ID (section ID) for organizing uploads
      const uploadedUrl = await uploadImage(selectedFile, STORAGE_FOLDERS.BANNER_IMAGES, sectionId)
      return uploadedUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image. Please try again.")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Create a new banner item
  const createBannerItem = async () => {
    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload()
        if (!uploadedUrl) return
        imageUrl = uploadedUrl
      }

      // Create banner item
      const newItem = await bannerItemService.createBannerItem(sectionId, {
        ...formData,
        imageUrl
      })

      // Update banner items list
      setBannerItems(prev => [...prev, newItem])

      setIsAddDialogOpen(false)
      resetForm()
      toast.success("Banner item created successfully")
    } catch (error) {
      console.error("Error creating banner item:", error)
      toast.error("Failed to create banner item. Please try again.")
    }
  }

  // Update an existing banner item
  const updateBannerItem = async () => {
    if (!currentBannerItem) return

    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload()
        if (!uploadedUrl) return
        imageUrl = uploadedUrl
      }

      // Update banner item
      const updatedItem = await bannerItemService.updateBannerItem(currentBannerItem.id, {
        ...formData,
        imageUrl
      })

      // Update banner items list
      setBannerItems(prev =>
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      )

      setIsEditDialogOpen(false)
      resetForm()
      toast.success("Banner item updated successfully")
    } catch (error) {
      console.error("Error updating banner item:", error)
      toast.error("Failed to update banner item. Please try again.")
    }
  }

  // Delete a banner item
  const deleteBannerItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner item?")) return

    try {
      await bannerItemService.deleteBannerItem(id)

      // Update banner items list
      setBannerItems(prev => prev.filter(item => item.id !== id))

      toast.success("Banner item deleted successfully")
    } catch (error) {
      console.error("Error deleting banner item:", error)
      toast.error("Failed to delete banner item. Please try again.")
    }
  }

  // Reorder banner items
  const reorderBannerItems = async (ids: string[]) => {
    try {
      await bannerItemService.reorderBannerItems(sectionId, { bannerItemIds: ids })

      // Reload banner items to get updated order
      const items = await bannerItemService.getBannerItemsBySection(sectionId)
      setBannerItems(items)

      toast.success("Banner items reordered successfully")
    } catch (error) {
      console.error("Error reordering banner items:", error)
      toast.error("Failed to reorder banner items. Please try again.")
    }
  }

  // Move item up in order
  const moveItemUp = (index: number) => {
    if (index === 0) return

    const newItems = [...bannerItems]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp

    setBannerItems(newItems)
    reorderBannerItems(newItems.map(item => item.id))
  }

  // Move item down in order
  const moveItemDown = (index: number) => {
    if (index === bannerItems.length - 1) return

    const newItems = [...bannerItems]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp

    setBannerItems(newItems)
    reorderBannerItems(newItems.map(item => item.id))
  }

  // Toggle banner item active status
  const toggleItemActive = async (id: string, isActive: boolean) => {
    try {
      const updatedItem = await bannerItemService.updateBannerItem(id, { isActive: !isActive })

      // Update banner items list
      setBannerItems(prev =>
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      )

      toast.success(`Banner item ${updatedItem.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error("Error updating banner item:", error)
      toast.error("Failed to update banner item. Please try again.")
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Manage Banner Items" />
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
          <SiteHeader title="Manage Banner Items" />
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
        <SiteHeader title={`Manage ${section.title} Banner Items`} />
        <div className="space-y-6 p-6">
          {/* Header with section info and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Banner</Badge>
                <span className="text-muted-foreground">
                  {bannerItems.length} banner items
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openAddDialog}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Banner Item
              </Button>
              <Button variant="outline" onClick={() => router.push('/home-sections')}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>

          {/* Banner items table */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Items</CardTitle>
              <CardDescription>
                Manage the banner items displayed in this section. You can add, edit, or remove items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bannerItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <IconPhoto className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No banner items yet. Click "Add Banner Item" to create one.
                  </p>
                  <Button className="mt-4" onClick={openAddDialog}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Banner Item
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Order</TableHead>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Link Type</TableHead>
                      <TableHead className="w-[100px]">Active</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannerItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveItemUp(index)}
                              disabled={index === 0}
                              className="h-7 w-7"
                            >
                              <IconArrowUp className="h-4 w-4" />
                              <span className="sr-only">Move Up</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveItemDown(index)}
                              disabled={index === bannerItems.length - 1}
                              className="h-7 w-7"
                            >
                              <IconArrowDown className="h-4 w-4" />
                              <span className="sr-only">Move Down</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.imageUrl && (
                            <div className="relative h-12 w-20 overflow-hidden rounded-md">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {item.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.linkType || 'None'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => toggleItemActive(item.id, item.isActive)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                              className="h-8 w-8"
                            >
                              <IconEdit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBannerItem(item.id)}
                              className="h-8 w-8 text-destructive"
                            >
                              <IconTrash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Add Banner Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Banner Item</DialogTitle>
            <DialogDescription>
              Create a new banner item for this section.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Banner Image</Label>
                <div className="mt-2">
                  <ImageUpload
                    folder={STORAGE_FOLDERS.BANNER_IMAGES}
                    onImageSelected={handleImageSelected}
                    onImageRemoved={handleImageRemoved}
                    defaultImage={formData.imageUrl}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a rectangular image (16:9 aspect ratio) for best results
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="linkType">Link Type</Label>
                <Select
                  value={formData.linkType}
                  onValueChange={handleLinkTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LinkType.NONE}>None</SelectItem>
                    <SelectItem value={LinkType.SONG}>Song</SelectItem>
                    <SelectItem value={LinkType.ARTIST}>Artist</SelectItem>
                    <SelectItem value={LinkType.COLLECTION}>Collection</SelectItem>
                    <SelectItem value={LinkType.EXTERNAL}>External URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.linkType === LinkType.EXTERNAL && (
                <div>
                  <Label htmlFor="externalUrl">External URL</Label>
                  <Input
                    id="externalUrl"
                    name="externalUrl"
                    value={formData.externalUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {(formData.linkType === LinkType.SONG ||
                formData.linkType === LinkType.ARTIST ||
                formData.linkType === LinkType.COLLECTION) && (
                <div>
                  <Label htmlFor="linkId">Item ID</Label>
                  <Input
                    id="linkId"
                    name="linkId"
                    value={formData.linkId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter item ID"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBannerItem} disabled={isUploading}>
              {isUploading ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Create Banner Item</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Banner Item</DialogTitle>
            <DialogDescription>
              Update the banner item details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Banner Image</Label>
                <div className="mt-2">
                  <ImageUpload
                    folder={STORAGE_FOLDERS.BANNER_IMAGES}
                    onImageSelected={handleImageSelected}
                    onImageRemoved={handleImageRemoved}
                    defaultImage={formData.imageUrl}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a rectangular image (16:9 aspect ratio) for best results
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-linkType">Link Type</Label>
                <Select
                  value={formData.linkType}
                  onValueChange={handleLinkTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LinkType.NONE}>None</SelectItem>
                    <SelectItem value={LinkType.SONG}>Song</SelectItem>
                    <SelectItem value={LinkType.ARTIST}>Artist</SelectItem>
                    <SelectItem value={LinkType.COLLECTION}>Collection</SelectItem>
                    <SelectItem value={LinkType.EXTERNAL}>External URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.linkType === LinkType.EXTERNAL && (
                <div>
                  <Label htmlFor="edit-externalUrl">External URL</Label>
                  <Input
                    id="edit-externalUrl"
                    name="externalUrl"
                    value={formData.externalUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {(formData.linkType === LinkType.SONG ||
                formData.linkType === LinkType.ARTIST ||
                formData.linkType === LinkType.COLLECTION) && (
                <div>
                  <Label htmlFor="edit-linkId">Item ID</Label>
                  <Input
                    id="edit-linkId"
                    name="linkId"
                    value={formData.linkId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter item ID"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateBannerItem} disabled={isUploading}>
              {isUploading ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Update Banner Item</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}