"use client"

import * as React from "react"
import {
  IconDownload,
  IconSearch,
  IconFilter,
  IconColumns,
  IconRefresh,
  IconBulb,
  IconThumbUp,
  IconUser,
  IconCalendar,
  IconTag,
  IconFlag,
  IconEye,
  IconEdit,
  IconTrash,
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
import featureRequestService, { FeatureRequest } from "@/services/feature-request.service"

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'IN_PROGRESS':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

// Category display mapping
const getCategoryDisplay = (category?: string) => {
  switch (category) {
    case 'UI_UX':
      return 'UI/UX'
    case 'NEW_FEATURE':
      return 'New Feature'
    case 'BUG_FIX':
      return 'Bug Fix'
    case 'PERFORMANCE':
      return 'Performance'
    case 'INTEGRATION':
      return 'Integration'
    case 'SECURITY':
      return 'Security'
    case 'OTHER':
      return 'Other'
    default:
      return category || 'General'
  }
}

export default function FeatureRequestsPage() {
  const [featureRequests, setFeatureRequests] = React.useState<FeatureRequest[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [selectedRequests, setSelectedRequests] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [priorityFilter, setPriorityFilter] = React.useState("all")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [visibleColumns, setVisibleColumns] = React.useState({
    title: true,
    category: true,
    priority: true,
    requestedBy: true,
    requestDate: true,
    status: true,
    upvotes: true,
  })

  // Load feature requests on component mount
  React.useEffect(() => {
    loadFeatureRequests()
  }, [])

  const loadFeatureRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const requests = await featureRequestService.getAllFeatureRequests()
      setFeatureRequests(requests)
    } catch (err) {
      console.error('Error loading feature requests:', err)
      setError('Failed to load feature requests')
      toast.error('Failed to load feature requests')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter feature requests based on search query, status, and priority filter
  const filteredRequests = featureRequests
    .filter(
      (request) =>
        (searchQuery === "" ||
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.customer?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || request.status === statusFilter) &&
        (priorityFilter === "all" || request.priority === priorityFilter)
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

  // Update request status
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      // Convert status to the format expected by the API
      const apiStatus = newStatus.replace(' ', '_').toUpperCase()

      // Update the status in the database
      await featureRequestService.updateFeatureRequest(requestId, { status: apiStatus as any })

      // Update the local state
      setFeatureRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status: apiStatus as any }
            : request
        )
      )

      toast.success(`Feature request status updated to ${newStatus}`)
    } catch (err) {
      console.error('Error updating feature request status:', err)
      toast.error('Failed to update feature request status')
    }
  }

  // Update request priority
  const updateRequestPriority = async (requestId: string, newPriority: string) => {
    try {
      // Update the priority in the database
      await featureRequestService.updateFeatureRequest(requestId, { priority: newPriority as any })

      // Update the local state
      setFeatureRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, priority: newPriority as any }
            : request
        )
      )

      toast.success(`Feature request priority updated to ${newPriority}`)
    } catch (err) {
      console.error('Error updating feature request priority:', err)
      toast.error('Failed to update feature request priority')
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
        <SiteHeader title="Feature Requests" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Feature Requests</h1>
              <p className="text-muted-foreground">
                Manage feature requests and suggestions from customers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadFeatureRequests}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <IconBulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{featureRequests.length}</div>
                <p className="text-xs text-muted-foreground">
                  All feature requests
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <IconFlag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {featureRequests.filter(r => r.status === 'PENDING').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <IconEdit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {featureRequests.filter(r => r.status === 'IN_PROGRESS').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Being developed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
                <IconThumbUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {featureRequests.reduce((sum, r) => sum + r.upvotes, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Community engagement
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
                    placeholder="Search feature requests..."
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    defaultValue="all"
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <IconColumns className="mr-2 h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {Object.entries(visibleColumns).map(([key, value]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            setVisibleColumns((prev) => ({ ...prev, [key]: checked }))
                          }
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                      onCheckedChange={toggleAllRequests}
                      aria-label="Select all requests"
                    />
                  </TableHead>
                  {visibleColumns.title && <TableHead>Title</TableHead>}
                  {visibleColumns.category && <TableHead>Category</TableHead>}
                  {visibleColumns.priority && <TableHead>Priority</TableHead>}
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
                      Loading feature requests...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        1 +
                        Object.values(visibleColumns).filter(Boolean).length +
                        1
                      }
                      className="h-24 text-center"
                    >
                      Error: {error}
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
                      No feature requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onCheckedChange={() => toggleRequestSelection(request.id)}
                          aria-label={`Select ${request.title}`}
                        />
                      </TableCell>
                      {visibleColumns.title && (
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <IconBulb className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{request.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {request.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.category && (
                        <TableCell>
                          {request.category && (
                            <Badge variant="outline">
                              {getCategoryDisplay(request.category)}
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.priority && (
                        <TableCell>
                          <Select
                            value={request.priority}
                            onValueChange={(value) => updateRequestPriority(request.id, value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {visibleColumns.requestedBy && (
                        <TableCell>
                          <div className="flex items-center">
                            <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{request.customer?.name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">
                                {request.customer?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.requestDate && (
                        <TableCell>
                          <div className="flex items-center">
                            <IconCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateRequestStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      {visibleColumns.upvotes && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <IconThumbUp className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{request.upvotes}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <IconEdit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem>
                              <IconEye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem className="text-red-600">
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

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-sm text-muted-foreground">
                Showing <strong>1</strong> to <strong>{filteredRequests.length}</strong> of{" "}
                <strong>{filteredRequests.length}</strong> feature requests
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
