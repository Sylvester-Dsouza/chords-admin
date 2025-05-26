"use client"

import * as React from "react"
import {
  IconMessageCircle,
  IconFilter,
  IconSearch,
  IconUser,
  IconCalendar,
  IconCheck,
  IconX,
  IconArrowBackUp,
  IconDotsVertical,
  IconMail,
  IconDownload,
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
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

// Sample data for customer queries
const customerQueries = [
  {
    id: "1",
    subject: "Can't access my saved setlists",
    message: "I recently upgraded to premium but I can't see my saved setlists anymore. Can you help me recover them?",
    customer: "Alex Thompson",
    email: "alex@example.com",
    date: new Date("2023-04-10T14:30:00"),
    status: "Open",
    priority: "High",
    category: "Technical Issue",
  },
  {
    id: "2",
    subject: "How to transpose chords?",
    message: "I'm trying to figure out how to transpose chords to a different key. Is there a feature for this in the app?",
    customer: "Emily Davis",
    email: "emily@example.com",
    date: new Date("2023-04-08T09:15:00"),
    status: "Answered",
    priority: "Medium",
    category: "Feature Question",
  },
  {
    id: "3",
    subject: "Billing issue with subscription",
    message: "I was charged twice for my monthly subscription. Please refund the extra charge.",
    customer: "Robert Wilson",
    email: "robert@example.com",
    date: new Date("2023-04-05T16:45:00"),
    status: "Open",
    priority: "High",
    category: "Billing",
  },
  {
    id: "4",
    subject: "App crashes on startup",
    message: "After the latest update, the app crashes immediately when I open it. I'm using an iPhone 12 with iOS 16.",
    customer: "Lisa Brown",
    email: "lisa@example.com",
    date: new Date("2023-04-02T11:20:00"),
    status: "In Progress",
    priority: "High",
    category: "Technical Issue",
  },
  {
    id: "5",
    subject: "Request for chord tutorial",
    message: "Would it be possible to add video tutorials for complex chord progressions? This would be really helpful for beginners.",
    customer: "Michael Clark",
    email: "michael@example.com",
    date: new Date("2023-03-30T10:30:00"),
    status: "Answered",
    priority: "Low",
    category: "Feature Request",
  },
  {
    id: "6",
    subject: "Can't print chord sheets",
    message: "The print function isn't working for me. When I try to print a chord sheet, nothing happens.",
    customer: "Jennifer Lee",
    email: "jennifer@example.com",
    date: new Date("2023-03-28T13:40:00"),
    status: "Open",
    priority: "Medium",
    category: "Technical Issue",
  },
  {
    id: "7",
    subject: "Subscription cancellation",
    message: "I'd like to cancel my subscription. Can you please guide me through the process?",
    customer: "David Martinez",
    email: "david@example.com",
    date: new Date("2023-03-25T15:10:00"),
    status: "Answered",
    priority: "Medium",
    category: "Account",
  },
  {
    id: "8",
    subject: "Wrong chords for a song",
    message: "The chords for 'Amazing Grace' seem to be incorrect. The G chord in the chorus should be a G7.",
    customer: "Jessica Taylor",
    email: "jessica@example.com",
    date: new Date("2023-03-22T10:50:00"),
    status: "Open",
    priority: "Low",
    category: "Content Issue",
  },
]

export default function HelpDeskPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [selectedQueries, setSelectedQueries] = React.useState<string[]>([])

  // Filter queries based on search query and filters
  const filteredQueries = customerQueries.filter(
    (query) =>
      (searchQuery === "" ||
        query.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        query.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        query.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        query.message.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || query.status.toLowerCase() === statusFilter.toLowerCase()) &&
      (categoryFilter === "all" || query.category === categoryFilter)
  )

  // Toggle query selection
  const toggleQuerySelection = (queryId: string) => {
    setSelectedQueries((prev) =>
      prev.includes(queryId)
        ? prev.filter((id) => id !== queryId)
        : [...prev, queryId]
    )
  }

  // Toggle all queries selection
  const toggleAllQueries = () => {
    if (selectedQueries.length === filteredQueries.length) {
      setSelectedQueries([])
    } else {
      setSelectedQueries(filteredQueries.map((query) => query.id))
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

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "border-yellow-500 text-yellow-500"
      case "in progress":
        return "border-blue-500 text-blue-500"
      case "answered":
        return "border-green-500 text-green-500"
      case "closed":
        return "border-gray-500 text-gray-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "border-red-500 text-red-500"
      case "medium":
        return "border-orange-500 text-orange-500"
      case "low":
        return "border-green-500 text-green-500"
      default:
        return "border-gray-500 text-gray-500"
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
        <SiteHeader title="Help Desk" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Help Desk</h1>
              <p className="text-muted-foreground">
                Manage and respond to customer support queries
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerQueries.length}</div>
                <p className="text-xs text-muted-foreground">
                  +3 from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerQueries.filter(query => query.status === "Open").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerQueries.filter(query => query.status === "In Progress").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Being worked on
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Answered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerQueries.filter(query => query.status === "Answered").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully resolved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table with filters */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Queries</CardTitle>
              <CardDescription>
                View and respond to customer support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and filters */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search queries..."
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
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    defaultValue="all"
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="h-9 w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="Account">Account</SelectItem>
                      <SelectItem value="Feature Question">Feature Question</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Content Issue">Content Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            filteredQueries.length > 0 &&
                            selectedQueries.length === filteredQueries.length
                          }
                          onCheckedChange={toggleAllQueries}
                          aria-label="Select all queries"
                        />
                      </TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No queries found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQueries.map((query) => (
                        <TableRow key={query.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedQueries.includes(query.id)}
                              onCheckedChange={() => toggleQuerySelection(query.id)}
                              aria-label={`Select query ${query.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconMessageCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                              {query.subject}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                                {query.customer}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <IconMail className="mr-1 h-3 w-3" />
                                {query.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <IconCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDate(query.date)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTime(query.date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeColor(query.status)}
                            >
                              {query.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getPriorityBadgeColor(query.priority)}
                            >
                              {query.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{query.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                              >
                                <IconArrowBackUp className="h-4 w-4" />
                                <span className="sr-only">Reply</span>
                              </Button>
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
                                    View Details
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem>
                                    Mark as In Progress
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem>
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Mark as Answered
                                  </DropdownMenuCheckboxItem>
                                  <Separator />
                                  <DropdownMenuCheckboxItem>
                                    <IconX className="mr-2 h-4 w-4" />
                                    Close Ticket
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
