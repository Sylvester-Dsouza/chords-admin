"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { AudioUpload } from "@/components/ui/audio-upload"
import { uploadAudio, deleteAudio } from "@/lib/audio-upload"
import { STORAGE_FOLDERS } from "@/lib/image-upload"

import vocalService, { 
  VocalItem, 
  VocalCategory, 
  CreateVocalItemDto, 
  UpdateVocalItemDto 
} from "@/services/vocal.service"

export interface VocalItemFormValues {
  categoryId: string
  name: string
  audioFileUrl: string
  durationSeconds: number
  fileSizeBytes: number
  displayOrder: number
  isActive: boolean
}

interface VocalItemFormProps {
  mode: 'create' | 'edit'
  title: string
  itemId?: string
  defaultCategoryId?: string
  onSubmit?: (values: VocalItemFormValues) => Promise<void>
  loading?: boolean
}

export default function VocalItemForm({ 
  mode, 
  title, 
  itemId, 
  defaultCategoryId,
  onSubmit, 
  loading: externalLoading 
}: VocalItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<VocalCategory[]>([])
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [formData, setFormData] = React.useState<VocalItemFormValues>({
    categoryId: defaultCategoryId || '',
    name: '',
    audioFileUrl: '',
    durationSeconds: 0,
    fileSizeBytes: 0,
    displayOrder: 0,
    isActive: true,
  })

  // Load categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await vocalService.getAllCategories()
        setCategories(data)
        
        // Set default category if provided and not already set
        if (defaultCategoryId && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: defaultCategoryId }))
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        setError('Failed to load categories')
      }
    }
    loadCategories()
  }, [defaultCategoryId, formData.categoryId])

  // Load existing item data for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && itemId) {
      const loadItem = async () => {
        try {
          setLoading(true)
          const item = await vocalService.getItemById(itemId)
          setFormData({
            categoryId: item.categoryId,
            name: item.name,
            audioFileUrl: item.audioFileUrl,
            durationSeconds: item.durationSeconds,
            fileSizeBytes: item.fileSizeBytes,
            displayOrder: item.displayOrder,
            isActive: item.isActive,
          })
        } catch (error) {
          console.error('Error loading item:', error)
          setError('Failed to load item data')
        } finally {
          setLoading(false)
        }
      }
      loadItem()
    }
  }, [mode, itemId])

  // Handle audio file selection
  const handleAudioSelected = async (file: File | null, previewUrl: string | null, duration?: number) => {
    setSelectedFile(file)
    if (file && duration) {
      setFormData(prev => ({
        ...prev,
        durationSeconds: duration,
        fileSizeBytes: file.size,
      }))
    }
  }

  // Upload audio file
  const handleAudioUpload = async (): Promise<string | null> => {
    if (!selectedFile) return formData.audioFileUrl || null

    setIsUploading(true)
    try {
      const uploadedUrl = await uploadAudio(selectedFile, STORAGE_FOLDERS.VOCALS, formData.categoryId)
      return uploadedUrl
    } catch (error) {
      console.error("Error uploading audio:", error)
      toast.error("Failed to upload audio file. Please try again.")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (externalLoading || isUploading) return

    // Validation
    if (!formData.name.trim()) {
      setError('Item name is required')
      return
    }

    if (!formData.categoryId) {
      setError('Please select a category')
      return
    }

    if (!formData.audioFileUrl && !selectedFile) {
      setError('Please upload an audio file')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Upload audio file if a new one was selected
      let audioUrl = formData.audioFileUrl
      if (selectedFile) {
        const uploadedUrl = await handleAudioUpload()
        if (!uploadedUrl) {
          setError('Failed to upload audio file')
          return
        }
        audioUrl = uploadedUrl
      }

      const itemData = {
        ...formData,
        name: formData.name.trim(),
        audioFileUrl: audioUrl,
      }

      if (onSubmit) {
        await onSubmit(itemData)
      } else {
        // Default submit behavior
        if (mode === 'create') {
          const createData: CreateVocalItemDto = itemData
          await vocalService.createItem(createData)
          toast.success('Item created successfully')
        } else if (mode === 'edit' && itemId) {
          const updateData: UpdateVocalItemDto = itemData
          await vocalService.updateItem(itemId, updateData)
          toast.success('Item updated successfully')
        }
        router.push(`/vocals/categories/${formData.categoryId}`)
      }
    } catch (error) {
      console.error('Error saving item:', error)
      setError('Failed to save item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof VocalItemFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const isLoading = loading || externalLoading || isUploading

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">
                  {mode === 'create' 
                    ? 'Add a new vocal item to a category'
                    : 'Edit the vocal item details'
                  }
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Basic information about the vocal item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange('categoryId', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Lip Trills, Breathing Exercise"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      disabled={isLoading}
                      min="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audio File</CardTitle>
                <CardDescription>
                  Upload the audio file for this vocal item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioUpload
                  folder={STORAGE_FOLDERS.VOCALS}
                  onAudioSelected={handleAudioSelected}
                  defaultAudio={formData.audioFileUrl}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isUploading ? 'Uploading...' : mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Create Item' : 'Update Item'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
