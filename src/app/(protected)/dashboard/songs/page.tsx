"use client"

import * as React from "react"
import { 
  IconDownload, 
  IconFilter, 
  IconMusic, 
  IconPlus, 
  IconSearch, 
  IconTrash, 
  IconUpload,
  IconDotsVertical
} from "@tabler/icons-react"
import { z } from "zod"

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

// Define the schema for song data
const songSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string().nullable(),
  key: z.string().nullable(),
  difficulty: z.string().nullable(),
  views: z.number(),
  likes: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

type Song = z.infer<typeof songSchema>

// Sample data for the songs
const songs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    artist: "John Newton",
    album: "Hymns Collection",
    key: "G",
    difficulty: "Easy",
    views: 12500,
    likes: 450,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    id: "2",
    title: "How Great Is Our God",
    artist: "Chris Tomlin",
    album: "Arriving",
    key: "C",
    difficulty: "Medium",
    views: 9800,
    likes: 320,
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-15"),
  },
  {
    id: "3",
    title: "10,000 Reasons",
    artist: "Matt Redman",
    album: "10,000 Reasons",
    key: "D",
    difficulty: "Medium",
    views: 8700,
    likes: 290,
    createdAt: new Date("2023-02-05"),
    updatedAt: new Date("2023-02-10"),
  },
  {
    id: "4",
    title: "Oceans (Where Feet May Fail)",
    artist: "Hillsong United",
    album: "Zion",
    key: "D",
    difficulty: "Hard",
    views: 15600,
    likes: 520,
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-01-25"),
  },
  {
    id: "5",
    title: "What A Beautiful Name",
    artist: "Hillsong Worship",
    album: "Let There Be Light",
    key: "D",
    difficulty: "Medium",
    views: 11200,
    likes: 380,
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-05"),
  },
  {
    id: "6",
    title: "Good Good Father",
    artist: "Chris Tomlin",
    album: "Never Lose Sight",
    key: "A",
    difficulty: "Easy",
    views: 7800,
    likes: 260,
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    id: "7",
    title: "Cornerstone",
    artist: "Hillsong Worship",
    album: "Cornerstone",
    key: "E",
    difficulty: "Easy",
    views: 6500,
    likes: 210,
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "8",
    title: "In Christ Alone",
    artist: "Keith Getty & Stuart Townend",
    album: "In Christ Alone",
    key: "D",
    difficulty: "Medium",
    views: 9200,
    likes: 310,
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2023-03-25"),
  },
]

export default function SongsPage() {
  const [selectedSongs, setSelectedSongs] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
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

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()))
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
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
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
          <Button variant="outline" size="sm">
            <IconUpload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" size="sm">
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
            <div className="text-2xl font-bold">{songs.length}</div>
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
              {songs.reduce((sum, song) => sum + song.views, 0).toLocaleString()}
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
              {songs.reduce((sum, song) => sum + song.likes, 0).toLocaleString()}
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
                    {visibleColumns.artist && <TableCell>{song.artist}</TableCell>}
                    {visibleColumns.album && <TableCell>{song.album || "-"}</TableCell>}
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
                      <TableCell className="text-right">{song.views.toLocaleString()}</TableCell>
                    )}
                    {visibleColumns.likes && (
                      <TableCell className="text-right">{song.likes.toLocaleString()}</TableCell>
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
                          <DropdownMenuCheckboxItem>
                            Edit
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem>
                            View
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem>
                            Duplicate
                          </DropdownMenuCheckboxItem>
                          <Separator />
                          <DropdownMenuCheckboxItem>
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
  )
}
