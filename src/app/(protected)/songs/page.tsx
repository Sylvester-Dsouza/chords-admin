"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconDownload,
  IconFilter,
  IconMusic,
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
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
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

import songService, { Song } from "@/services/song.service"

export default function SongsPage() {
  const router = useRouter()
  const [songs, setSongs] = React.useState<Song[]>([])
  const [loading, setLoading] = React.useState(true)
  const [importing, setImporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedSongs, setSelectedSongs] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")

  // Add debugging
  React.useEffect(() => {
    console.log("Songs page mounted");

    // Add a cleanup function to detect unmounting
    return () => {
      console.log("Songs page unmounted");
    };
  }, []);

  const [visibleColumns, setVisibleColumns] = React.useState({
    title: true,
    artist: true,
    album: true,
    key: true,
    difficulty: true,
    views: true,
    likes: true,
    createdAt: true,
  })

  // Fetch songs from the API
  React.useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true)
        const data = await songService.getAllSongs()

        // Add placeholder values for views and likes if they don't exist in the API
        const songsWithStats = data.map(song => ({
          ...song,
          views: song.views || Math.floor(Math.random() * 10000),
          likes: song.likes || Math.floor(Math.random() * 500),
          // Convert string dates to Date objects if needed
          createdAt: song.createdAt instanceof Date ? song.createdAt : new Date(song.createdAt),
          updatedAt: song.updatedAt instanceof Date ? song.updatedAt : new Date(song.updatedAt)
        }))

        setSongs(songsWithStats)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch songs:', err)
        setError('Failed to load songs. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [])

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  )

  // Toggle song selection
  const toggleSongSelection = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    )
  }

  // Toggle all songs selection
  const toggleAllSongs = () => {
    if (selectedSongs.length === filteredSongs.length) {
      setSelectedSongs([])
    } else {
      setSelectedSongs(filteredSongs.map((song) => song.id))
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

  // Add a state to track if this is the initial render
  const [isInitialRender, setIsInitialRender] = React.useState(true);

  // Use this effect to set isInitialRender to false after the component mounts
  React.useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [isInitialRender]);

  return (
    <SidebarProvider
      // Prevent automatic navigation on mount
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Songs" />
        <div className="space-y-6 p-6">
      {/* Header with page name and action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Songs</h1>
          <p className="text-muted-foreground">
            Manage your song catalog and chord sheets
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Import Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-songs')?.click()}
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
            id="import-songs"
            type="file"
            accept=".csv"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              try {
                // Show importing state
                setImporting(true);

                // Create FormData
                const formData = new FormData();
                formData.append('file', file);

                // Call API to import data
                const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
                if (!token) {
                  throw new Error('Authentication token not found. Please log in again.');
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/songs/import/csv`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error('Failed to import songs');
                }

                const result = await response.json();

                toast.success(`Imported ${result.imported} songs. ${result.errors?.length || 0} errors.`);

                // Refresh the songs list
                setLoading(true);
                songService.getAllSongs()
                  .then(data => {
                    setSongs(data);
                    setError(null);
                  })
                  .catch(err => {
                    console.error('Failed to fetch songs:', err);
                    setError('Failed to load songs. Please try again later.');
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              } catch (error) {
                console.error('Error importing songs:', error);
                toast.error("Failed to import songs. Please try again.");
              } finally {
                // Reset the file input
                event.target.value = '';
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

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/songs/export/csv`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });

                if (!response.ok) {
                  throw new Error('Failed to export songs');
                }

                // Get the CSV data
                const csvData = await response.text();

                // Create a blob and download link
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `songs-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();

                // Clean up
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success("Songs exported successfully.");
              } catch (error) {
                console.error('Error exporting songs:', error);
                toast.error("Failed to export songs. Please try again.");
              }
            }}
          >
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/songs/new')}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Song
          </Button>
        </div>
      </div>

      {/* Analytics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : songs.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : songs.reduce((sum, song) => sum + (song.views || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : songs.reduce((sum, song) => sum + (song.likes || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +7% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">D</div>
            <p className="text-xs text-muted-foreground">
              Used in 3 songs
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
                placeholder="Search songs..."
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
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Filter by key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Keys</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="G">G</SelectItem>
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
                    checked={visibleColumns.title}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, title: checked })
                    }
                  >
                    Title
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.artist}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, artist: checked })
                    }
                  >
                    Artist
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.album}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, album: checked })
                    }
                  >
                    Album
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.key}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, key: checked })
                    }
                  >
                    Key
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.difficulty}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, difficulty: checked })
                    }
                  >
                    Difficulty
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.views}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, views: checked })
                    }
                  >
                    Views
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.likes}
                    onCheckedChange={(checked) =>
                      setVisibleColumns({ ...visibleColumns, likes: checked })
                    }
                  >
                    Likes
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
              {selectedSongs.length > 0 && (
                <Button variant="destructive" size="sm" className="h-9">
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete ({selectedSongs.length})
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
            <span className="ml-3">Loading songs...</span>
          </div>
        )}

        {/* Importing state */}
        {importing && !loading && (
          <div className="flex justify-center items-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Importing songs... This may take a moment.</span>
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
                      filteredSongs.length > 0 &&
                      selectedSongs.length === filteredSongs.length
                    }
                    onCheckedChange={toggleAllSongs}
                    aria-label="Select all songs"
                  />
                </TableHead>
                {visibleColumns.title && <TableHead>Title</TableHead>}
                {visibleColumns.artist && <TableHead>Artist</TableHead>}
                {visibleColumns.album && <TableHead>Album</TableHead>}
                {visibleColumns.key && <TableHead className="w-16">Key</TableHead>}
                {visibleColumns.difficulty && <TableHead>Difficulty</TableHead>}
                {visibleColumns.views && <TableHead className="text-right">Views</TableHead>}
                {visibleColumns.likes && <TableHead className="text-right">Likes</TableHead>}
                {visibleColumns.createdAt && <TableHead>Created</TableHead>}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSongs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      1 +
                      Object.values(visibleColumns).filter(Boolean).length +
                      1
                    }
                    className="h-24 text-center"
                  >
                    No songs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSongs.includes(song.id)}
                        onCheckedChange={() => toggleSongSelection(song.id)}
                        aria-label={`Select ${song.title}`}
                      />
                    </TableCell>
                    {visibleColumns.title && (
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
                          {song.title}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.artist && <TableCell>{song.artist?.name || 'Unknown Artist'}</TableCell>}
                    {visibleColumns.album && <TableCell>-</TableCell>}
                    {visibleColumns.key && (
                      <TableCell>
                        <Badge variant="outline">{song.key || "-"}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.difficulty && (
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            song.difficulty === "Easy"
                              ? "border-green-500 text-green-500"
                              : song.difficulty === "Medium"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-red-500 text-red-500"
                          }
                        >
                          {song.difficulty || "-"}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumns.views && (
                      <TableCell className="text-right">{(song.views || 0).toLocaleString()}</TableCell>
                    )}
                    {visibleColumns.likes && (
                      <TableCell className="text-right">{(song.likes || 0).toLocaleString()}</TableCell>
                    )}
                    {visibleColumns.createdAt && (
                      <TableCell>{formatDate(song.createdAt)}</TableCell>
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
                          <DropdownMenuCheckboxItem onClick={() => router.push(`/songs/${song.id}/edit`)}>
                            <IconEdit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem onClick={() => router.push(`/songs/${song.id}`)}>
                            <IconEye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem>
                            <IconCopy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuCheckboxItem>
                          <Separator />
                          <DropdownMenuCheckboxItem onClick={() => {
                            if (confirm('Are you sure you want to delete this song?')) {
                              songService.deleteSong(song.id)
                                .then(() => {
                                  setSongs(songs.filter(s => s.id !== song.id))
                                })
                                .catch(err => {
                                  console.error('Failed to delete song:', err)
                                  setError('Failed to delete song. Please try again.')
                                })
                            }
                          }}>
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
            Showing <strong>1</strong> to <strong>{filteredSongs.length}</strong> of{" "}
            <strong>{filteredSongs.length}</strong> songs
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
