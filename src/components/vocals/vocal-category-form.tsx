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
import { Textarea } from "@/components/ui/textarea"
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

import vocalService, { VocalCategory, VocalType, CreateVocalCategoryDto, UpdateVocalCategoryDto } from "@/services/vocal.service"

export interface VocalCategoryFormValues {
  name: string
  type: VocalType
  description: string
  displayOrder: number
  isActive: boolean
}

interface VocalCategoryFormProps {
  mode: 'create' | 'edit'
  title: string
  categoryId?: string
  onSubmit?: (values: VocalCategoryFormValues) => Promise<void>
  loading?: boolean
}

export default function VocalCategoryForm({ 
  mode, 
  title, 
  categoryId, 
  onSubmit, 
  loading: externalLoading 
}: VocalCategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<VocalCategoryFormValues>({
    name: '',
    type: VocalType.WARMUP,
    description: '',
    displayOrder: 0,
    isActive: true,
  })

  // Load existing category data for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && categoryId) {
      const loadCategory = async () => {
        try {
          setLoading(true)
          const category = await vocalService.getCategoryById(categoryId)
          setFormData({
            name: category.name,
            type: category.type,
            description: category.description || '',
            displayOrder: category.displayOrder,
            isActive: category.isActive,
          })
        } catch (error) {
          console.error('Error loading category:', error)
          setError('Failed to load category data')
        } finally {
          setLoading(false)
        }
      }
      loadCategory()
    }
  }, [mode, categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (externalLoading) return

    // Validation
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default submit behavior
        if (mode === 'create') {
          const createData: CreateVocalCategoryDto = {
            name: formData.name.trim(),
            type: formData.type,
            description: formData.description.trim() || undefined,
            displayOrder: formData.displayOrder,
            isActive: formData.isActive,
          }
          await vocalService.createCategory(createData)
          toast.success('Category created successfully')
        } else if (mode === 'edit' && categoryId) {
          const updateData: UpdateVocalCategoryDto = {
            name: formData.name.trim(),
            type: formData.type,
            description: formData.description.trim() || undefined,
            displayOrder: formData.displayOrder,
            isActive: formData.isActive,
          }
          await vocalService.updateCategory(categoryId, updateData)
          toast.success('Category updated successfully')
        }
        router.push('/vocal-categories')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setError('Failed to save category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof VocalCategoryFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const isLoading = loading || externalLoading

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
                    ? 'Create a new vocal category for warmups or exercises'
                    : 'Edit the vocal category details'
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
                <CardTitle>Category Details</CardTitle>
                <CardDescription>
                  Basic information about the vocal category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Stage Warmups, High Pitch Exercises"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value as VocalType)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VocalType.WARMUP}>Warmup</SelectItem>
                        <SelectItem value={VocalType.EXERCISE}>Exercise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optional description of this category"
                    disabled={isLoading}
                    rows={3}
                  />
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
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Create Category' : 'Update Category'}
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
