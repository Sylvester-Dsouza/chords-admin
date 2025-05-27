"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconDownload,
  IconFilter,
  IconFolder,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconCopy,
  IconAlertCircle
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import collectionService, { Collection } from "@/services/collection.service"

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = React.useState<Collection[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    songCount: true,
    totalViews: true,
    visibility: true,
    isActive: true,
    createdAt: true,
  })

  // Fetch collections from the API
  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true)
        const data = await collectionService.getAllCollections()

        // Use real view count data from the API
        const collectionsWithStats = data.map(collection => ({
          ...collection,
          songCount: collection.songs?.length || 0,
          totalViews: collection.viewCount || 0, // Use real view count data
          visibility: collection.isPublic ? "public" as const : "private" as const, // Convert isPublic to visibility
          // Keep the original isActive value from the API
          isActive: typeof collection.isActive === 'boolean' ? collection.isActive : true,
          // Convert string dates to Date objects if needed
          createdAt: collection.createdAt instanceof Date ? collection.createdAt : new Date(collection.createdAt),
          updatedAt: collection.updatedAt instanceof Date ? collection.updatedAt : new Date(collection.updatedAt)
        }))

        setCollections(collectionsWithStats)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch collections:', err)
        setError('Failed to load collections. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  // Filter collections based on search query and status
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (collection.description && collection.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && collection.isActive) ||
      (statusFilter === "inactive" && !collection.isActive)

    return matchesSearch && matchesStatus
  })

  // Delete collection function
  const deleteCollection = async (collectionId: string) => {
    try {
      if (confirm('Are you sure you want to delete this collection?')) {
        await collectionService.deleteCollection(collectionId)
        setCollections(collections.filter(collection => collection.id !== collectionId))
        toast.success('Collection deleted successfully')
      }
    } catch (err) {
      console.error('Failed to delete collection:', err)
      toast.error('Failed to delete collection')
    }
  }

  // Toggle collection selection
  const toggleCollectionSelection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  // Toggle all collections selection
  const toggleAllCollections = () => {
    if (selectedCollections.length === filteredCollections.length) {
      setSelectedCollections([])
    } else {
      setSelectedCollections(filteredCollections.map((collection) => collection.id))
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
        <SiteHeader title="Collections" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
              <p className="text-muted-foreground">
                Manage your song collections and setlists
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Import Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-collections')?.click()}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <input
                id="import-collections"
                type="file"
                accept=".csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  try {
                    // Create FormData
                    const formData = new FormData();
                    formData.append('file', file);

                    // Call API to import data
                    const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
                    if (!token) {
                      throw new Error('Authentication token not found. Please log in again.');
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/import/csv`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                      body: formData,
                    });

                    if (!response.ok) {
                      throw new Error('Failed to import collections');
                    }

                    const result = await response.json();

                    toast.success(`Imported ${result.imported} collections. ${result.errors?.length || 0} errors.`);

                    // Refresh the collections list
                    setLoading(true);
                    collectionService.getAllCollections()
                      .then(data => {
                        setCollections(data);
                        setError(null);
                      })
                      .catch(err => {
                        console.error('Failed to fetch collections:', err);
                        setError('Failed to load collections. Please try again later.');
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  } catch (error) {
                    console.error('Error importing collections:', error);
                    toast.error("Failed to import collections. Please try again.");
                  } finally {
                    // Reset the file input
                    event.target.value = '';
                  }
                }}
                className="hidden"
              />

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    // Call API to export data
                    const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
                    if (!token) {
                      throw new Error('Authentication token not found. Please log in again.');
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/export/csv`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) {
                      throw new Error('Failed to export collections');
                    }

                    // Get the CSV data
                    const csvData = await response.text();

                    // Create a blob and download link
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `collections-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast.success("Collections exported successfully.");
                  } catch (error) {
                    console.error('Error exporting collections:', error);
                    toast.error("Failed to export collections. Please try again.");
                  }
                }}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/collections/new')}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add Collection
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : collections.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Public Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : collections.filter(collection => collection.visibility === "public").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : collections.length > 0 ?
                    `${Math.round((collections.filter(collection => collection.visibility === "public").length / collections.length) * 100)}% of total collections` :
                    'No collections'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : collections.reduce((sum, collection) => sum + (collection.songCount || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : collections.length > 0 ?
                    `Avg. ${Math.round(collections.reduce((sum, collection) => sum + (collection.songCount || 0), 0) / collections.length)} per collection` :
                    'No collections'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : (collections.reduce((sum, collection) => sum + (collection.totalViews || 0), 0) / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table with filters */}
          <div className="rounded-md border">
            {/* Table filters */}
            <div className="border-b p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-[300px]"
                  />
                  <Button variant="outline" size="sm" className="h-9">
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="Filter by visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Collections</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[120px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <IconFilter className="mr-2 h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.name}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, name: checked })
                        }
                      >
                        Name
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.songCount}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, songCount: checked })
                        }
                      >
                        Songs
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.totalViews}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, totalViews: checked })
                        }
                      >
                        Views
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.visibility}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, visibility: checked })
                        }
                      >
                        Visibility
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.isActive}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, isActive: checked })
                        }
                      >
                        Status
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.createdAt}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, createdAt: checked })
                        }
                      >
                        Created At
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedCollections.length > 0 && (
                    <Button variant="destructive" size="sm" className="h-9">
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete ({selectedCollections.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="ml-3">Loading collections...</span>
              </div>
            )}

            {/* Table */}
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredCollections.length > 0 &&
                          selectedCollections.length === filteredCollections.length
                        }
                        onCheckedChange={toggleAllCollections}
                        aria-label="Select all collections"
                      />
                    </TableHead>
                    {visibleColumns.name && <TableHead>Name</TableHead>}
                    {visibleColumns.songCount && <TableHead className="text-right">Songs</TableHead>}
                    {visibleColumns.totalViews && <TableHead className="text-right">Views</TableHead>}
                    {visibleColumns.visibility && <TableHead>Visibility</TableHead>}
                    {visibleColumns.isActive && <TableHead>Status</TableHead>}
                    {visibleColumns.createdAt && <TableHead>Created</TableHead>}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        No collections found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCollections.map((collection) => (
                      <TableRow key={collection.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCollections.includes(collection.id)}
                            onCheckedChange={() => toggleCollectionSelection(collection.id)}
                            aria-label={`Select ${collection.name}`}
                          />
                        </TableCell>
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconFolder className="mr-2 h-4 w-4 text-muted-foreground" />
                              {collection.name}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.songCount && (
                          <TableCell className="text-right">{collection.songCount}</TableCell>
                        )}
                        {visibleColumns.totalViews && (
                          <TableCell className="text-right">{collection.totalViews?.toLocaleString() || '0'}</TableCell>
                        )}
                        {visibleColumns.visibility && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                collection.visibility === "public"
                                  ? "border-green-500 text-green-500"
                                  : collection.visibility === "unlisted"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-red-500 text-red-500"
                              }
                            >
                              {collection.visibility ? collection.visibility.charAt(0).toUpperCase() + collection.visibility.slice(1) : 'Private'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.isActive && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                collection.isActive
                                  ? "border-green-500 text-green-500"
                                  : "border-red-500 text-red-500"
                              }
                            >
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    collection.isActive ? "bg-green-500" : "bg-red-500"
                                  }`}
                                />
                                {collection.isActive ? "Active" : "Inactive"}
                              </div>
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>{formatDate(collection.createdAt)}</TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/collections/${collection.id}/edit`)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/collections/${collection.id}`)}>
                                <IconEye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>
                                <IconCopy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuCheckboxItem>
                              <Separator />
                              <DropdownMenuCheckboxItem onClick={() => deleteCollection(collection.id)}>
                                <IconTrash className="mr-2 h-4 w-4 text-destructive" />
                                Delete
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-sm text-muted-foreground">
                Showing <strong>1</strong> to <strong>{filteredCollections.length}</strong> of{" "}
                <strong>{filteredCollections.length}</strong> collections
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
