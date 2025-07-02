"use client"

import * as React from "react"
import {
  IconDownload,
  IconSearch,
  IconFilter,
  IconColumns,
  IconRefresh,
  IconPhoto,
  IconTrash,
  IconEye,
  IconGrid3x3,
  IconList,
  IconUpload,
  IconX,
  IconExternalLink,
  IconCopy,
  IconAlertTriangle,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import mediaService, { MediaFile, MediaStats, MediaFilters } from "@/services/media.service"
import { MediaGrid } from "@/components/media/media-grid"
import { MediaList } from "@/components/media/media-list"
import { FileDetailsDialog } from "@/components/media/file-details-dialog"

type ViewMode = 'grid' | 'list'

export default function MediaPage() {
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([])
  const [mediaStats, setMediaStats] = React.useState<MediaStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([])
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = React.useState("")
  const [bucketFilter, setBucketFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [showUnusedOnly, setShowUnusedOnly] = React.useState(false)
  
  const [selectedFile, setSelectedFile] = React.useState<MediaFile | null>(null)
  const [showFileDetails, setShowFileDetails] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [fileToDelete, setFileToDelete] = React.useState<MediaFile | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = React.useState(false)

  const [availableBuckets, setAvailableBuckets] = React.useState<string[]>([])
  const [availableFileTypes, setAvailableFileTypes] = React.useState<{ [key: string]: number }>({})

  // Load data on component mount
  React.useEffect(() => {
    loadMediaData()
    loadBuckets()
    loadFileTypes()
  }, [])

  // Load media files when filters change
  React.useEffect(() => {
    loadMediaFiles()
  }, [searchQuery, bucketFilter, typeFilter, showUnusedOnly])

  const loadMediaData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [files, stats] = await Promise.all([
        mediaService.getAllMediaFiles(),
        mediaService.getMediaStats()
      ])
      
      setMediaFiles(files)
      setMediaStats(stats)
    } catch (err) {
      console.error('Error loading media data:', err)
      setError('Failed to load media data')
      toast.error('Failed to load media data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMediaFiles = async () => {
    try {
      const filters: MediaFilters = {
        search: searchQuery || undefined,
        bucket: bucketFilter !== 'all' ? bucketFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        unused: showUnusedOnly || undefined,
      }

      const files = await mediaService.getAllMediaFiles(filters)
      setMediaFiles(files)
    } catch (err) {
      console.error('Error loading media files:', err)
      toast.error('Failed to load media files')
    }
  }

  const loadBuckets = async () => {
    try {
      const buckets = await mediaService.getStorageBuckets()
      setAvailableBuckets(buckets)
    } catch (err) {
      console.error('Error loading buckets:', err)
    }
  }

  const loadFileTypes = async () => {
    try {
      const types = await mediaService.getFileTypes()
      setAvailableFileTypes(types)
    } catch (err) {
      console.error('Error loading file types:', err)
    }
  }

  // File selection handlers
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const toggleAllFiles = () => {
    if (selectedFiles.length === mediaFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(mediaFiles.map(file => file.id))
    }
  }

  const clearSelection = () => {
    setSelectedFiles([])
  }

  // File actions
  const handleFileClick = (file: MediaFile) => {
    setSelectedFile(file)
    setShowFileDetails(true)
  }

  const handleDeleteFile = (file: MediaFile) => {
    setFileToDelete(file)
    setShowDeleteDialog(true)
  }

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return

    try {
      const result = await mediaService.deleteMediaFile(fileToDelete.bucket, fileToDelete.path)
      
      if (result.success) {
        toast.success('File deleted successfully')
        loadMediaData() // Reload data
        setSelectedFiles(prev => prev.filter(id => id !== fileToDelete.id))
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      console.error('Error deleting file:', err)
      toast.error('Failed to delete file')
    } finally {
      setShowDeleteDialog(false)
      setFileToDelete(null)
    }
  }

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected')
      return
    }
    setShowBulkDeleteDialog(true)
  }

  const confirmBulkDelete = async () => {
    try {
      const filesToDelete = mediaFiles
        .filter(file => selectedFiles.includes(file.id))
        .map(file => ({ bucket: file.bucket, path: file.path }))

      const result = await mediaService.bulkDeleteMediaFiles(filesToDelete)
      
      if (result.success > 0) {
        toast.success(`Successfully deleted ${result.success} file(s)`)
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to delete ${result.failed} file(s)`)
        console.error('Bulk delete errors:', result.errors)
      }

      loadMediaData() // Reload data
      clearSelection()
    } catch (err) {
      console.error('Error bulk deleting files:', err)
      toast.error('Failed to delete files')
    } finally {
      setShowBulkDeleteDialog(false)
    }
  }

  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('File URL copied to clipboard')
  }

  const openFileInNewTab = (url: string) => {
    window.open(url, '_blank')
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
        <SiteHeader title="Media Library" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
              <p className="text-muted-foreground">
                Manage all your uploaded files and media assets
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadMediaData}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <IconUpload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
              {selectedFiles.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedFiles.length})
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {mediaStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <IconPhoto className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mediaStats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all buckets
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                  <IconDownload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mediaService.formatFileSize(mediaStats.totalSize)}</div>
                  <p className="text-xs text-muted-foreground">
                    Storage used
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unused Files</CardTitle>
                  <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mediaStats.unusedFiles}</div>
                  <p className="text-xs text-muted-foreground">
                    Not referenced anywhere
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">File Types</CardTitle>
                  <IconFilter className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(mediaStats.fileTypes).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Different formats
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and View Controls */}
          <div className="rounded-md border">
            <div className="border-b p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-[300px]"
                  />
                  <Button variant="outline" size="sm" className="h-9">
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={bucketFilter}
                    onValueChange={setBucketFilter}
                  >
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="All Buckets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Buckets</SelectItem>
                      {availableBuckets.map(bucket => (
                        <SelectItem key={bucket} value={bucket}>{bucket}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.keys(availableFileTypes).map(type => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()} ({availableFileTypes[type]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showUnusedOnly ? "default" : "outline"}
                    size="sm"
                    className="h-9"
                    onClick={() => setShowUnusedOnly(!showUnusedOnly)}
                  >
                    <IconAlertTriangle className="mr-2 h-4 w-4" />
                    Unused Only
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'grid' ? "default" : "outline"}
                      size="sm"
                      className="h-9"
                      onClick={() => setViewMode('grid')}
                    >
                      <IconGrid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? "default" : "outline"}
                      size="sm"
                      className="h-9"
                      onClick={() => setViewMode('list')}
                    >
                      <IconList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedFiles.length} file(s) selected
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <IconX className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Media Display */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading media files...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <IconAlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Files</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button onClick={loadMediaData}>
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <MediaGrid
                files={mediaFiles}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFileClick={handleFileClick}
                onDeleteFile={handleDeleteFile}
                onCopyUrl={copyFileUrl}
                onOpenFile={openFileInNewTab}
              />
            ) : (
              <MediaList
                files={mediaFiles}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onSelectAll={toggleAllFiles}
                onFileClick={handleFileClick}
                onDeleteFile={handleDeleteFile}
                onCopyUrl={copyFileUrl}
                onOpenFile={openFileInNewTab}
              />
            )}
          </div>
        </div>

        {/* File Details Dialog */}
        <FileDetailsDialog
          file={selectedFile}
          open={showFileDetails}
          onOpenChange={setShowFileDetails}
          onDelete={handleDeleteFile}
          onCopyUrl={copyFileUrl}
          onOpenFile={openFileInNewTab}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{fileToDelete?.name}"?
                {fileToDelete?.usageCount && fileToDelete.usageCount > 0 && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-center gap-2 text-orange-800">
                      <IconAlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      This file is currently used in {fileToDelete.usageCount} item(s).
                      Deleting it may break those references.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteFile} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Multiple Files</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedFiles.length} selected file(s)?
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2 text-orange-800">
                    <IconAlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Files that are currently in use will not be deleted and will show an error.
                    This action cannot be undone.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700">
                Delete Selected
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
