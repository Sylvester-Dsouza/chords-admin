"use client"

import * as React from "react"
import {
  IconBell,
  IconSend,
  IconUsers,
  IconUserCheck,
  IconCalendarEvent,
  IconDeviceFloppy,
  IconTrash,
  IconCrown,
  IconFilter,
  IconSearch,
  IconEye,
  IconAlertCircle,
} from "@tabler/icons-react"
import notificationService, {
  NotificationResponseDto,
  NotificationType,
  NotificationAudience,
  NotificationStatus
} from "@/services/notification.service"
import { toast } from "sonner"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Map audience enum to display text
const audienceDisplayMap = {
  [NotificationAudience.ALL]: "All Users",
  [NotificationAudience.PREMIUM_USERS]: "Premium Users",
  [NotificationAudience.FREE_USERS]: "Free Users",
  [NotificationAudience.SPECIFIC_USER]: "Specific User",
};

// Map notification type enum to display text
const notificationTypeDisplayMap = {
  [NotificationType.GENERAL]: "General",
  [NotificationType.SONG_ADDED]: "Song Added",
  [NotificationType.SONG_REQUEST_COMPLETED]: "Song Request Completed",
  [NotificationType.NEW_FEATURE]: "New Feature",
  [NotificationType.SUBSCRIPTION]: "Subscription",
  [NotificationType.PROMOTION]: "Promotion",
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = React.useState("compose")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Notification data state
  const [sentNotifications, setSentNotifications] = React.useState<NotificationResponseDto[]>([])
  const [scheduledNotifications, setScheduledNotifications] = React.useState<NotificationResponseDto[]>([])
  const [stats, setStats] = React.useState({
    totalSent: 0,
    totalScheduled: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
  })

  // Form state for composing a notification
  const [notificationForm, setNotificationForm] = React.useState({
    title: "",
    body: "",
    audience: NotificationAudience.ALL,
    schedule: false,
    scheduledDate: "",
    scheduledTime: "",
    sendPush: true,
    sendEmail: false,
    type: NotificationType.GENERAL,
  })

  // Fetch notifications data
  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch all notifications
      const allNotifications = await notificationService.getAllNotifications()

      // Split into sent and scheduled
      const sent = allNotifications.filter(n => n.status === NotificationStatus.SENT)
      const scheduled = allNotifications.filter(n => n.status === NotificationStatus.SCHEDULED)

      setSentNotifications(sent)
      setScheduledNotifications(scheduled)

      // Get statistics
      const statistics = await notificationService.getNotificationStatistics()
      setStats(statistics)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications. Please try again.')
      toast.error("Failed to load notifications. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Load notifications on component mount
  React.useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter notifications based on search query
  const filteredSentNotifications = sentNotifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audienceDisplayMap[notification.audience].toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredScheduledNotifications = scheduledNotifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audienceDisplayMap[notification.audience].toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  // Toggle all notifications selection
  const toggleAllNotifications = (notifications: typeof sentNotifications) => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map((notification) => notification.id))
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the notification data
      const scheduledAt = notificationForm.schedule && notificationForm.scheduledDate && notificationForm.scheduledTime
        ? new Date(`${notificationForm.scheduledDate}T${notificationForm.scheduledTime}`)
        : undefined;

      // Create the notification
      await notificationService.createNotification({
        title: notificationForm.title,
        body: notificationForm.body,
        type: notificationForm.type,
        audience: notificationForm.audience,
        schedule: notificationForm.schedule,
        scheduledAt,
        sendPush: notificationForm.sendPush,
        sendEmail: notificationForm.sendEmail,
      })

      // Show success message
      if (notificationForm.schedule) {
        toast.success("Your notification has been scheduled successfully.")
      } else {
        toast.success("Your notification has been sent successfully.")
      }

      // Reset form
      setNotificationForm({
        title: "",
        body: "",
        audience: NotificationAudience.ALL,
        schedule: false,
        scheduledDate: "",
        scheduledTime: "",
        sendPush: true,
        sendEmail: false,
        type: NotificationType.GENERAL,
      })

      // Refresh notifications
      await fetchNotifications()

      // Switch to appropriate tab
      setActiveTab(notificationForm.schedule ? "scheduled" : "history")
    } catch (err) {
      console.error('Error creating notification:', err)
      toast.error("Failed to create notification. Please try again.")
    } finally {
      setIsSubmitting(false)
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
        <SiteHeader title="Notifications" />
        <div className="space-y-6 p-6">
          {/* Header with page name */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground">
                Send and manage notifications to your customers
              </p>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalSent}</div>
                    <p className="text-xs text-muted-foreground">
                      Total sent notifications
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalScheduled}</div>
                    <p className="text-xs text-muted-foreground">
                      Pending notifications
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.averageOpenRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Based on notification history
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.averageClickRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Based on notification history
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs for compose and history */}
          <Tabs defaultValue="compose" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="history">Sent</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>

            {/* Compose Tab */}
            <TabsContent value="compose" className="mt-6 space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Compose Notification</CardTitle>
                    <CardDescription>
                      Create a new notification to send to your customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="Enter notification title"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="Enter notification content"
                        className="min-h-[120px]"
                        value={notificationForm.body}
                        onChange={(e) => setNotificationForm({...notificationForm, body: e.target.value})}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Keep your message clear and concise for better engagement
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notification Type</label>
                      <Select
                        value={notificationForm.type}
                        onValueChange={(value) => setNotificationForm({...notificationForm, type: value as NotificationType})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(notificationTypeDisplayMap).map(([type, display]) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center">
                                <span>{display}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Audience</label>
                      <Select
                        value={notificationForm.audience}
                        onValueChange={(value) => setNotificationForm({...notificationForm, audience: value as NotificationAudience})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(audienceDisplayMap).map(([audience, display]) => (
                            <SelectItem key={audience} value={audience}>
                              <div className="flex items-center">
                                {audience === NotificationAudience.ALL && <IconUsers className="mr-2 h-4 w-4" />}
                                {audience === NotificationAudience.PREMIUM_USERS && <IconCrown className="mr-2 h-4 w-4" />}
                                {audience === NotificationAudience.FREE_USERS && <IconUserCheck className="mr-2 h-4 w-4" />}
                                {audience === NotificationAudience.SPECIFIC_USER && <IconUserCheck className="mr-2 h-4 w-4" />}
                                <span>{display}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Schedule for Later</label>
                        <p className="text-sm text-muted-foreground">
                          Send this notification at a specific date and time
                        </p>
                      </div>
                      <Switch
                        checked={notificationForm.schedule}
                        onCheckedChange={(checked) => setNotificationForm({...notificationForm, schedule: checked})}
                      />
                    </div>

                    {notificationForm.schedule && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date</label>
                          <Input
                            type="date"
                            value={notificationForm.scheduledDate}
                            onChange={(e) => setNotificationForm({...notificationForm, scheduledDate: e.target.value})}
                            required={notificationForm.schedule}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Time</label>
                          <Input
                            type="time"
                            value={notificationForm.scheduledTime}
                            onChange={(e) => setNotificationForm({...notificationForm, scheduledTime: e.target.value})}
                            required={notificationForm.schedule}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-sm font-medium">Delivery Methods</h3>

                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Push Notification</label>
                          <p className="text-sm text-muted-foreground">
                            Send as a push notification to mobile devices
                          </p>
                        </div>
                        <Switch
                          checked={notificationForm.sendPush}
                          onCheckedChange={(checked) => setNotificationForm({...notificationForm, sendPush: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-sm text-muted-foreground">
                            Also send this notification as an email
                          </p>
                        </div>
                        <Switch
                          checked={notificationForm.sendEmail}
                          onCheckedChange={(checked) => setNotificationForm({...notificationForm, sendEmail: checked})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    <IconSend className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : notificationForm.schedule ? "Schedule" : "Send Now"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Notifications</CardTitle>
                  <CardDescription>
                    View and manage previously sent notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and filters */}
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search notifications..."
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
                          <SelectValue placeholder="Filter by audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Audiences</SelectItem>
                          <SelectItem value="all-users">All Users</SelectItem>
                          <SelectItem value="premium-users">Premium Users</SelectItem>
                          <SelectItem value="free-users">Free Users</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedNotifications.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9"
                          onClick={async () => {
                            try {
                              // Confirm deletion
                              if (confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
                                // Delete each selected notification
                                for (const id of selectedNotifications) {
                                  await notificationService.deleteNotification(id);
                                }

                                // Show success message
                                toast.success(`${selectedNotifications.length} notification(s) have been deleted.`);

                                // Clear selection
                                setSelectedNotifications([]);

                                // Refresh notifications
                                await fetchNotifications();
                              }
                            } catch (err) {
                              console.error('Error deleting notifications:', err);
                              toast.error("Failed to delete notifications. Please try again.");
                            }
                          }}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete ({selectedNotifications.length})
                        </Button>
                      )}
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
                                filteredSentNotifications.length > 0 &&
                                selectedNotifications.length === filteredSentNotifications.length
                              }
                              onCheckedChange={() => toggleAllNotifications(filteredSentNotifications)}
                              aria-label="Select all notifications"
                            />
                          </TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Sent Date</TableHead>
                          <TableHead>Open Rate</TableHead>
                          <TableHead>Click Rate</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex justify-center items-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                <span className="ml-2">Loading notifications...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex justify-center items-center text-destructive">
                                <IconAlertCircle className="mr-2 h-5 w-5" />
                                {error}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredSentNotifications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No notifications found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSentNotifications.map((notification) => (
                            <TableRow key={notification.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedNotifications.includes(notification.id)}
                                  onCheckedChange={() => toggleNotificationSelection(notification.id)}
                                  aria-label={`Select ${notification.title}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <IconBell className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {notification.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {notificationTypeDisplayMap[notification.type]}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {audienceDisplayMap[notification.audience]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{formatDate(new Date(notification.sentAt))}</span>
                                  <span className="text-xs text-muted-foreground">{formatTime(new Date(notification.sentAt))}</span>
                                </div>
                              </TableCell>
                              <TableCell>N/A</TableCell>
                              <TableCell>N/A</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    toast.info(notification.body, {
                                      description: `Type: ${notificationTypeDisplayMap[notification.type]}`,
                                    });
                                  }}
                                >
                                  <IconEye className="h-4 w-4" />
                                  <span className="sr-only">View details</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scheduled Tab */}
            <TabsContent value="scheduled" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Notifications</CardTitle>
                  <CardDescription>
                    View and manage scheduled notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and filters */}
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search scheduled notifications..."
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
                          <SelectValue placeholder="Filter by audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Audiences</SelectItem>
                          <SelectItem value="all-users">All Users</SelectItem>
                          <SelectItem value="premium-users">Premium Users</SelectItem>
                          <SelectItem value="free-users">Free Users</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedNotifications.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9"
                          onClick={async () => {
                            try {
                              // Confirm deletion
                              if (confirm(`Are you sure you want to delete ${selectedNotifications.length} scheduled notification(s)?`)) {
                                // Delete each selected notification
                                for (const id of selectedNotifications) {
                                  await notificationService.deleteNotification(id);
                                }

                                // Show success message
                                toast.success(`${selectedNotifications.length} scheduled notification(s) have been deleted.`);

                                // Clear selection
                                setSelectedNotifications([]);

                                // Refresh notifications
                                await fetchNotifications();
                              }
                            } catch (err) {
                              console.error('Error deleting scheduled notifications:', err);
                              toast.error("Failed to delete scheduled notifications. Please try again.");
                            }
                          }}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete ({selectedNotifications.length})
                        </Button>
                      )}
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
                                filteredScheduledNotifications.length > 0 &&
                                selectedNotifications.length === filteredScheduledNotifications.length
                              }
                              onCheckedChange={() => toggleAllNotifications(filteredScheduledNotifications)}
                              aria-label="Select all scheduled notifications"
                            />
                          </TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Scheduled For</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              <div className="flex justify-center items-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                <span className="ml-2">Loading scheduled notifications...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              <div className="flex justify-center items-center text-destructive">
                                <IconAlertCircle className="mr-2 h-5 w-5" />
                                {error}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredScheduledNotifications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No scheduled notifications found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredScheduledNotifications.map((notification) => (
                            <TableRow key={notification.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedNotifications.includes(notification.id)}
                                  onCheckedChange={() => toggleNotificationSelection(notification.id)}
                                  aria-label={`Select ${notification.title}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <IconCalendarEvent className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {notification.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {notificationTypeDisplayMap[notification.type]}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {audienceDisplayMap[notification.audience]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{notification.scheduledAt ? formatDate(new Date(notification.scheduledAt)) : 'N/A'}</span>
                                  <span className="text-xs text-muted-foreground">{notification.scheduledAt ? formatTime(new Date(notification.scheduledAt)) : 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                  {notification.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      toast.info(notification.body, {
                                        description: `Type: ${notificationTypeDisplayMap[notification.type]}`,
                                      });
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={async () => {
                                      try {
                                        await notificationService.deleteNotification(notification.id);
                                        toast.success("The scheduled notification has been cancelled.");
                                        fetchNotifications();
                                      } catch (err) {
                                        toast.error("Failed to cancel notification.");
                                      }
                                    }}
                                  >
                                    Cancel
                                  </Button>
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
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
