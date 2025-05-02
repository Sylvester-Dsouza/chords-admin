"use client"

import * as React from "react"
import {
  IconMusic,
  IconFilter,
  IconSearch,
  IconTrash,
  IconDotsVertical,
  IconArrowUp,
  IconCheck,
  IconX,
  IconMessageCircle,
  IconCalendar,
  IconUser,
  IconSortAscending,
  IconSortDescending,
  IconDownload,
  IconLoader2,
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
import { toast } from "sonner"
import songRequestService, { SongRequest } from "@/services/song-request.service"

// This sample data will be used as fallback if API fails
const sampleSongRequests = [
  {
    id: "1",
    songTitle: "Way Maker (Acoustic Version)",
    artist: "Leeland",
    requestedBy: "Alex Thompson",
    requestDate: new Date("2023-04-10T14:30:00"),
    status: "Pending",
    upvotes: 42,
    notes: "Would love to have the acoustic version with capo on 2nd fret",
    email: "alex@example.com",
  },
  {
    id: "2",
    songTitle: "Graves Into Gardens",
    artist: "Elevation Worship",
    requestedBy: "Emily Davis",
    requestDate: new Date("2023-04-08T09:15:00"),
    status: "Approved",
    upvotes: 38,
    notes: "The version from the Elevation Worship album",
    email: "emily@example.com",
  },
  {
    id: "3",
    songTitle: "Goodness of God (Live)",
    artist: "Bethel Music",
    requestedBy: "Robert Wilson",
    requestDate: new Date("2023-04-05T16:45:00"),
    status: "In Progress",
    upvotes: 27,
    notes: "The live version from Victory album",
    email: "robert@example.com",
  },
  {
    id: "4",
    songTitle: "Battle Belongs",
    artist: "Phil Wickham",
    requestedBy: "Lisa Brown",
    requestDate: new Date("2023-04-02T11:20:00"),
    status: "Completed",
    upvotes: 23,
    notes: "Would like both standard and simplified versions if possible",
    email: "lisa@example.com",
  },
  {
    id: "5",
    songTitle: "House of the Lord",
    artist: "Phil Wickham",
    requestedBy: "Michael Clark",
    requestDate: new Date("2023-03-30T10:30:00"),
    status: "Rejected",
    upvotes: 19,
    notes: "The version in the key of G",
    email: "michael@example.com",
  },
  {
    id: "6",
    songTitle: "Jireh",
    artist: "Elevation Worship & Maverick City",
    requestedBy: "Jennifer Lee",
    requestDate: new Date("2023-03-28T13:40:00"),
    status: "Pending",
    upvotes: 31,
    notes: "The version from the Old Church Basement album",
    email: "jennifer@example.com",
  },
  {
    id: "7",
    songTitle: "Hymn of Heaven",
    artist: "Phil Wickham",
    requestedBy: "David Martinez",
    requestDate: new Date("2023-03-25T15:10:00"),
    status: "Approved",
    upvotes: 24,
    notes: "Would like the version with the bridge included",
    email: "david@example.com",
  },
  {
    id: "8",
    songTitle: "Promises",
    artist: "Maverick City",
    requestedBy: "Jessica Taylor",
    requestDate: new Date("2023-03-22T10:50:00"),
    status: "Pending",
    upvotes: 18,
    notes: "The version sung by Dante Bowe and Naomi Raine",
    email: "jessica@example.com",
  },
]

export default function SongRequestsPage() {
  const [songRequests, setSongRequests] = React.useState<SongRequest[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [selectedRequests, setSelectedRequests] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [visibleColumns, setVisibleColumns] = React.useState({
    songName: true,
    artistName: true,
    requestedBy: true,
    requestDate: true,
    status: true,
    upvotes: true,
  })

  // Fetch song requests from the API
  React.useEffect(() => {
    const fetchSongRequests = async () => {
      try {
        setIsLoading(true)
        const apiStatus = statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined
        const data = await songRequestService.getAllSongRequests(apiStatus)
        setSongRequests(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching song requests:', err)
        setError('Failed to load song requests. Please try again later.')
        toast.error('Failed to load song requests')
        // Use sample data as fallback
        setSongRequests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSongRequests()
  }, [statusFilter])

  // Filter song requests based on search query and status filter
  const filteredRequests = songRequests
    .filter(
      (request) =>
        (searchQuery === "" ||
          request.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.artistName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (request.customer?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.upvotes - b.upvotes
      } else {
        return b.upvotes - a.upvotes
      }
    })

  // Toggle request selection
  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    )
  }

  // Toggle all requests selection
  const toggleAllRequests = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map((request) => request.id))
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

  // Format status for display
  const formatStatus = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "Pending"
      case "APPROVED":
        return "Approved"
      case "IN_PROGRESS":
        return "In Progress"
      case "COMPLETED":
        return "Completed"
      case "REJECTED":
        return "Rejected"
      default:
        return status
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-yellow-500 text-yellow-500"
      case "approved":
        return "border-blue-500 text-blue-500"
      case "in progress":
        return "border-purple-500 text-purple-500"
      case "completed":
        return "border-green-500 text-green-500"
      case "rejected":
        return "border-red-500 text-red-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return null
      case "approved":
        return <IconCheck className="mr-1 h-3 w-3" />
      case "in progress":
        return <IconMusic className="mr-1 h-3 w-3" />
      case "completed":
        return <IconCheck className="mr-1 h-3 w-3" />
      case "rejected":
        return <IconX className="mr-1 h-3 w-3" />
      default:
        return null
    }
  }

  // Delete song request
  const deleteSongRequest = async (requestId: string) => {
    try {
      await songRequestService.deleteSongRequest(requestId)

      // Update the local state
      setSongRequests(prev => prev.filter(request => request.id !== requestId))

      // Remove from selected requests if it was selected
      if (selectedRequests.includes(requestId)) {
        setSelectedRequests(prev => prev.filter(id => id !== requestId))
      }

      toast.success('Song request deleted successfully')
    } catch (err) {
      console.error('Error deleting song request:', err)
      toast.error('Failed to delete song request')
    }
  }

  // Delete multiple song requests
  const deleteSelectedRequests = async () => {
    if (selectedRequests.length === 0) return

    try {
      // Delete each selected request
      await Promise.all(selectedRequests.map(id => songRequestService.deleteSongRequest(id)))

      // Update the local state
      setSongRequests(prev => prev.filter(request => !selectedRequests.includes(request.id)))

      // Clear selected requests
      setSelectedRequests([])

      toast.success(`${selectedRequests.length} song requests deleted successfully`)
    } catch (err) {
      console.error('Error deleting song requests:', err)
      toast.error('Failed to delete song requests')
    }
  }

  // Update request status
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      // Convert status to the format expected by the API
      const apiStatus = newStatus.replace(' ', '_').toUpperCase()

      // Update the status in the database
      await songRequestService.updateSongRequest(requestId, { status: apiStatus as any })

      // Update the local state
      setSongRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status: apiStatus as any }
            : request
        )
      )

      toast.success(`Song request status updated to ${newStatus}`)
    } catch (err) {
      console.error('Error updating song request status:', err)
      toast.error('Failed to update song request status')
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
        <SiteHeader title="Song Requests" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Song Requests</h1>
              <p className="text-muted-foreground">
                Manage song chord requests from customers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? (
                  <IconSortAscending className="mr-2 h-4 w-4" />
                ) : (
                  <IconSortDescending className="mr-2 h-4 w-4" />
                )}
                Sort by Upvotes
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{songRequests.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Song requests from customers
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {songRequests.filter(request => request.status === "PENDING").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting review
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {songRequests.filter(request => request.status === "IN_PROGRESS").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently being worked on
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {songRequests.filter(request => request.status === "COMPLETED").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added to the library
                    </p>
                  </>
                )}
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
                    placeholder="Search song requests..."
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
                    defaultValue="all"
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
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
                        checked={visibleColumns.songName}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, songName: checked })
                        }
                      >
                        Song Name
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.artistName}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, artistName: checked })
                        }
                      >
                        Artist
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.requestedBy}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, requestedBy: checked })
                        }
                      >
                        Requested By
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.requestDate}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, requestDate: checked })
                        }
                      >
                        Request Date
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.status}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, status: checked })
                        }
                      >
                        Status
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.upvotes}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, upvotes: checked })
                        }
                      >
                        Upvotes
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedRequests.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      onClick={deleteSelectedRequests}
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete ({selectedRequests.length})
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
                          filteredRequests.length > 0 &&
                          selectedRequests.length === filteredRequests.length
                        }
                        onCheckedChange={toggleAllRequests}
                        aria-label="Select all requests"
                      />
                    </TableHead>
                    {visibleColumns.songName && <TableHead>Song Name</TableHead>}
                    {visibleColumns.artistName && <TableHead>Artist</TableHead>}
                    {visibleColumns.requestedBy && <TableHead>Requested By</TableHead>}
                    {visibleColumns.requestDate && <TableHead>Request Date</TableHead>}
                    {visibleColumns.status && <TableHead>Status</TableHead>}
                    {visibleColumns.upvotes && <TableHead className="text-center">Upvotes</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        <div className="flex justify-center items-center space-x-2">
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                          <span>Loading song requests...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        No song requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onCheckedChange={() => toggleRequestSelection(request.id)}
                            aria-label={`Select ${request.songName}`}
                          />
                        </TableCell>
                        {visibleColumns.songName && (
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
                              {request.songName}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.artistName && (
                          <TableCell>{request.artistName || 'Unknown'}</TableCell>
                        )}
                        {visibleColumns.requestedBy && (
                          <TableCell>
                            <div className="flex items-center">
                              <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                              {request.customer?.name || 'Unknown'}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.requestDate && (
                          <TableCell>
                            <div className="flex items-center">
                              <IconCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(new Date(request.createdAt))}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeColor(formatStatus(request.status))}
                            >
                              {getStatusIcon(formatStatus(request.status))}
                              {formatStatus(request.status)}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.upvotes && (
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <IconArrowUp className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{request.upvotes}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
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
                              <DropdownMenuCheckboxItem onClick={() => updateRequestStatus(request.id, "APPROVED")}>
                                Approve
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => updateRequestStatus(request.id, "IN_PROGRESS")}>
                                Mark as In Progress
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => updateRequestStatus(request.id, "COMPLETED")}>
                                Mark as Completed
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => updateRequestStatus(request.id, "REJECTED")}>
                                Reject
                              </DropdownMenuCheckboxItem>
                              <Separator />
                              {request.notes && (
                                <DropdownMenuCheckboxItem>
                                  <IconMessageCircle className="mr-2 h-4 w-4" />
                                  View Notes
                                </DropdownMenuCheckboxItem>
                              )}
                              <DropdownMenuCheckboxItem onClick={() => deleteSongRequest(request.id)}>
                                <IconTrash className="mr-2 h-4 w-4" />
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
                Showing <strong>1</strong> to <strong>{filteredRequests.length}</strong> of{" "}
                <strong>{filteredRequests.length}</strong> song requests
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

          {/* Request Details Modal would be implemented here */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
