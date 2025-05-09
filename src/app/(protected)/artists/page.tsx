"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconDownload,
  IconFilter,
  IconUser,
  IconUsers,
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
import { toast } from "sonner"

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

import artistService, { Artist } from "@/services/artist.service"
import songService from "@/services/song.service"

export default function ArtistsPage() {
  const router = useRouter()
  const [artists, setArtists] = React.useState<Artist[]>([])
  const [loading, setLoading] = React.useState(true)
  const [importing, setImporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedArtists, setSelectedArtists] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    songCount: true,
    totalViews: true,
    isFeatured: true,
    createdAt: true,
  })

  // Fetch artists from the API
  React.useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true)
        const data = await artistService.getAllArtists()

        // Log the raw data from API to debug
        console.log('Initial load - Raw artist data from API:', data);

        // Add placeholder values for songCount, totalViews, and isFeatured
        const artistsWithStats = data.map(artist => {
          // Log each artist's featured status
          console.log(`Initial load - Artist ${artist.name} (${artist.id}) - isFeatured:`, artist.isFeatured);

          return {
            ...artist,
            songCount: 0, // This would need to be fetched from the API
            totalViews: Math.floor(Math.random() * 50000), // Placeholder
            // Keep the original isFeatured value from the API
            isFeatured: typeof artist.isFeatured === 'boolean' ? artist.isFeatured : false,
            // Convert string dates to Date objects if needed
            createdAt: artist.createdAt instanceof Date ? artist.createdAt : new Date(artist.createdAt),
            updatedAt: artist.updatedAt instanceof Date ? artist.updatedAt : new Date(artist.updatedAt)
          };
        })

        setArtists(artistsWithStats)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch artists:', err)
        setError('Failed to load artists. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  // Filter artists based on search query
  const filteredArtists = artists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Delete artist function
  const deleteArtist = async (artistId: string) => {
    try {
      if (confirm('Are you sure you want to delete this artist?')) {
        await artistService.deleteArtist(artistId)
        setArtists(artists.filter(artist => artist.id !== artistId))
        toast.success('Artist deleted successfully')
      }
    } catch (err) {
      console.error('Failed to delete artist:', err)
      toast.error('Failed to delete artist')
    }
  }

  // Toggle artist selection
  const toggleArtistSelection = (artistId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    )
  }

  // Toggle all artists selection
  const toggleAllArtists = () => {
    if (selectedArtists.length === filteredArtists.length) {
      setSelectedArtists([])
    } else {
      setSelectedArtists(filteredArtists.map((artist) => artist.id))
    }
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return '-';

    try {
      // If it's a string, convert to Date object
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
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
        <SiteHeader title="Artists" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Artists</h1>
              <p className="text-muted-foreground">
                Manage your artists and their information
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Import Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-artists')?.click()}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <IconUpload className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
              <input
                id="import-artists"
                type="file"
                accept=".csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  try {
                    // Show importing state
                    setImporting(true);

                    // Log the file details for debugging
                    console.log('Importing file:', file.name, 'Size:', file.size, 'Type:', file.type);

                    // Read the file content to validate the CSV format
                    const fileReader = new FileReader();
                    fileReader.onload = async (e) => {
                      try {
                        const content = e.target?.result as string;
                        console.log('CSV content preview:', content.substring(0, 500));

                        // Check if the CSV has the isFeatured column
                        const lines = content.split('\n');
                        const headers = lines[0].split(',').map(h => h.trim());

                        if (!headers.includes('isFeatured')) {
                          toast.error('CSV file must include an "isFeatured" column');
                          setImporting(false);
                          return;
                        }

                        // Create FormData with the file
                        const formData = new FormData();
                        formData.append('file', file);

                        // Call API to import data
                        const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
                        if (!token) {
                          throw new Error('Authentication token not found. Please log in again.');
                        }

                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artists/import/csv`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                          body: formData,
                        });

                        if (!response.ok) {
                          throw new Error('Failed to import artists');
                        }

                        const result = await response.json();
                        console.log('Import API response:', result);

                        // Show success message
                        toast.success(`Imported ${result.imported} artists. ${result.errors?.length || 0} errors.`);

                        // Refresh the artists list
                        try {
                          setLoading(true);
                          const data = await artistService.getAllArtists();

                          // Log the raw data from API to debug
                          console.log('Raw artist data from API:', data);

                          const processedArtists = data.map((artist: any) => {
                            // Log each artist's featured status
                            console.log(`Artist ${artist.name} (${artist.id}) - isFeatured:`, artist.isFeatured);

                            return {
                              ...artist,
                              songCount: 0,
                              totalViews: Math.floor(Math.random() * 50000),
                              // Keep the original isFeatured value from the API
                              isFeatured: typeof artist.isFeatured === 'boolean' ? artist.isFeatured : false,
                              createdAt: artist.createdAt instanceof Date ? artist.createdAt : new Date(artist.createdAt),
                              updatedAt: artist.updatedAt instanceof Date ? artist.updatedAt : new Date(artist.updatedAt)
                            };
                          });

                          setArtists(processedArtists);
                          setError(null);
                        } catch (err) {
                          console.error('Failed to fetch artists:', err);
                          setError('Failed to load artists. Please try again later.');
                        } finally {
                          setLoading(false);
                        }
                      } catch (error) {
                        console.error('Error processing CSV:', error);
                        toast.error('Failed to process CSV file. Please check the format and try again.');
                        setImporting(false);
                      }
                    };

                    fileReader.readAsText(file);
                  } catch (error) {
                    console.error('Error importing artists:', error);
                    toast.error('Failed to import artists. Please try again.');
                  } finally {
                    // Reset the file input
                    if (event.target) {
                      event.target.value = '';
                    }
                    // Hide importing state
                    setImporting(false);
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

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artists/export/csv`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) {
                      throw new Error('Failed to export artists');
                    }

                    // Get the CSV data
                    const csvData = await response.text();

                    // Create a blob and download link
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `artists-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast.success('Artists exported successfully.');
                  } catch (error) {
                    console.error('Error exporting artists:', error);
                    toast.error('Failed to export artists. Please try again.');
                  }
                }}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>

              {/* Download Template Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  try {
                    // Create a sample CSV template
                    const csvTemplate = 'id,name,bio,imageUrl,website,isFeatured,createdAt,updatedAt\n,Artist Name,Artist Bio,,,true,,';

                    // Create a blob and download link
                    const blob = new Blob([csvTemplate], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'artists-template.csv';
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast.success('CSV template downloaded successfully.');
                  } catch (error) {
                    console.error('Error downloading template:', error);
                    toast.error('Failed to download template. Please try again.');
                  }
                }}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Template
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/artists/new')}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add Artist
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : artists.length}</div>
                <p className="text-xs text-muted-foreground">
                  +3 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Featured Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : artists.filter(artist => artist.isFeatured === true).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : artists.length > 0 ?
                    `${Math.round((artists.filter(artist => artist.isFeatured === true).length / artists.length) * 100)}% of total artists` :
                    'No artists'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : artists.reduce((sum, artist) => sum + (artist.songCount || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : artists.length > 0 ?
                    `Avg. ${Math.round(artists.reduce((sum, artist) => sum + (artist.songCount || 0), 0) / artists.length)} per artist` :
                    'No artists'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : (artists.reduce((sum, artist) => sum + (artist.totalViews || 0), 0) / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
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
                    placeholder="Search artists..."
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
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Artists</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="not-featured">Not Featured</SelectItem>
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
                        checked={visibleColumns.isFeatured}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, isFeatured: checked })
                        }
                      >
                        Featured
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
                  {selectedArtists.length > 0 && (
                    <Button variant="destructive" size="sm" className="h-9">
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete ({selectedArtists.length})
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
                <span className="ml-3">Loading artists...</span>
              </div>
            )}

            {/* Importing state */}
            {importing && !loading && (
              <div className="flex justify-center items-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="ml-3">Importing artists... This may take a moment.</span>
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
                          filteredArtists.length > 0 &&
                          selectedArtists.length === filteredArtists.length
                        }
                        onCheckedChange={toggleAllArtists}
                        aria-label="Select all artists"
                      />
                    </TableHead>
                    {visibleColumns.name && <TableHead>Name</TableHead>}
                    {visibleColumns.songCount && <TableHead className="text-right">Songs</TableHead>}
                    {visibleColumns.totalViews && <TableHead className="text-right">Views</TableHead>}
                    {visibleColumns.isFeatured && <TableHead>Featured</TableHead>}
                    {visibleColumns.createdAt && <TableHead>Created</TableHead>}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArtists.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        No artists found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArtists.map((artist) => (
                      <TableRow key={artist.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedArtists.includes(artist.id)}
                            onCheckedChange={() => toggleArtistSelection(artist.id)}
                            aria-label={`Select ${artist.name}`}
                          />
                        </TableCell>
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                              {artist.name}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.songCount && (
                          <TableCell className="text-right">{artist.songCount}</TableCell>
                        )}
                        {visibleColumns.totalViews && (
                          <TableCell className="text-right">{artist.totalViews?.toLocaleString() || '0'}</TableCell>
                        )}
                        {visibleColumns.isFeatured && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                artist.isFeatured === true
                                  ? "border-green-500 text-green-500"
                                  : "border-gray-500 text-gray-500"
                              }
                            >
                              {artist.isFeatured === true ? "Featured" : "Not Featured"}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>{formatDate(artist.createdAt)}</TableCell>
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
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/artists/${artist.id}/edit`)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/artists/${artist.id}`)}>
                                <IconEye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>
                                <IconCopy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuCheckboxItem>
                              <Separator />
                              <DropdownMenuCheckboxItem onClick={() => deleteArtist(artist.id)}>
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
                Showing <strong>1</strong> to <strong>{filteredArtists.length}</strong> of{" "}
                <strong>{filteredArtists.length}</strong> artists
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
