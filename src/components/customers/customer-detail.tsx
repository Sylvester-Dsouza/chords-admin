"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconEdit,
  IconUser,
  IconMail,
  IconPhone,
  IconWorld,
  IconCalendar,
  IconClock,
  IconCrown,
  IconCircleCheck,
  IconCircleX,
  IconBrandFirebase,
  IconAd,
  IconCheck,
  IconAlertCircle,
  IconPlaylist,
  IconHeart,
  IconBell,
  IconMessageQuestion,
  IconCreditCard,
  IconMusic,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Customer } from "@/services/customer.service"
import adsService from "@/services/ads.service"
import subscriptionService from "@/services/subscription.service"
import playlistService, { Playlist } from "@/services/playlist.service"
import likedSongService from "@/services/liked-song.service"
import songRequestService from "@/services/song-request.service"
import notificationHistoryService from "@/services/notification-history.service"

// List of countries for display
const countries = {
  "US": "United States",
  "CA": "Canada",
  "GB": "United Kingdom",
  "AU": "Australia",
  "IN": "India",
  "DE": "Germany",
  "FR": "France",
  "IT": "Italy",
  "ES": "Spain",
  "BR": "Brazil",
  "MX": "Mexico",
  "JP": "Japan",
  "CN": "China",
  "KR": "South Korea",
  "RU": "Russia",
  "ZA": "South Africa",
  "NG": "Nigeria",
  "EG": "Egypt",
  "SA": "Saudi Arabia",
  "AE": "United Arab Emirates",
};

interface CustomerDetailProps {
  customer: Customer
  title: string
  isLoading?: boolean
  error?: string | null
}

export default function CustomerDetail({ customer, title, isLoading = false, error = null }: CustomerDetailProps) {
  const router = useRouter()
  const [adsRemoved, setAdsRemoved] = React.useState<boolean | null>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = React.useState<boolean>(false)
  const [isRemovingAds, setIsRemovingAds] = React.useState(false)
  const [isRestoringAds, setIsRestoringAds] = React.useState(false)

  // State for customer data
  const [playlists, setPlaylists] = React.useState<Playlist[]>([])
  const [likedSongs, setLikedSongs] = React.useState<any[]>([])
  const [songRequests, setSongRequests] = React.useState<any[]>([])
  const [notificationHistory, setNotificationHistory] = React.useState<any[]>([])
  const [activeSubscription, setActiveSubscription] = React.useState<any>(null)

  // Loading states
  const [loadingPlaylists, setLoadingPlaylists] = React.useState(false)
  const [loadingLikedSongs, setLoadingLikedSongs] = React.useState(false)
  const [loadingSongRequests, setLoadingSongRequests] = React.useState(false)
  const [loadingNotifications, setLoadingNotifications] = React.useState(false)

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Check if customer has ads removed and active subscription
  React.useEffect(() => {
    const checkAdsStatus = async () => {
      if (!customer) return;

      try {
        // Check if customer has ads removed
        const adsRemovedStatus = await adsService.hasAdsRemoved(customer.id);
        setAdsRemoved(adsRemovedStatus);

        // Check if customer has active subscription
        const subscription = await subscriptionService.getCustomerActiveSubscription(customer.id);
        setHasActiveSubscription(!!subscription);
        setActiveSubscription(subscription);
      } catch (err) {
        console.error('Failed to check ads status:', err);
        // Don't show error toast, just log it
      }
    };

    checkAdsStatus();
  }, [customer]);

  // Fetch customer playlists
  const fetchPlaylists = React.useCallback(async () => {
    if (!customer) return;

    try {
      setLoadingPlaylists(true);
      const data = await playlistService.getCustomerPlaylists(customer.id);
      setPlaylists(data);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      // Don't show error toast, just log it
    } finally {
      setLoadingPlaylists(false);
    }
  }, [customer]);

  // Fetch customer liked songs
  const fetchLikedSongs = React.useCallback(async () => {
    if (!customer) return;

    try {
      setLoadingLikedSongs(true);
      console.log('Fetching liked songs for customer:', customer.id);
      const data = await likedSongService.getCustomerLikedSongs(customer.id);
      console.log('Liked songs data received:', data);
      setLikedSongs(data);
    } catch (err) {
      console.error('Failed to fetch liked songs:', err);
      // Don't show error toast, just log it
    } finally {
      setLoadingLikedSongs(false);
    }
  }, [customer]);

  // Fetch customer song requests
  const fetchSongRequests = React.useCallback(async () => {
    if (!customer) return;

    try {
      setLoadingSongRequests(true);
      const data = await songRequestService.getCustomerSongRequests(customer.id);
      setSongRequests(data);
    } catch (err) {
      console.error('Failed to fetch song requests:', err);
      // Don't show error toast, just log it
    } finally {
      setLoadingSongRequests(false);
    }
  }, [customer]);

  // Fetch customer notification history
  const fetchNotificationHistory = React.useCallback(async () => {
    if (!customer) return;

    try {
      setLoadingNotifications(true);
      const data = await notificationHistoryService.getCustomerNotificationHistory(customer.id);
      setNotificationHistory(data);
    } catch (err) {
      console.error('Failed to fetch notification history:', err);
      // Don't show error toast, just log it
    } finally {
      setLoadingNotifications(false);
    }
  }, [customer]);

  // Handle removing ads
  const handleRemoveAds = async () => {
    if (!customer) return;

    setIsRemovingAds(true);
    try {
      await adsService.removeAds(customer.id);
      setAdsRemoved(true);
      toast.success("Ads removed", {
        description: `Ads have been removed for ${customer.name || customer.email}.`,
        icon: <IconCheck className="h-4 w-4" />,
      });
    } catch (err: any) {
      console.error('Failed to remove ads:', err);
      toast.error("Failed to remove ads", {
        description: err.message || "An error occurred while removing ads.",
        icon: <IconAlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsRemovingAds(false);
    }
  };

  // Handle restoring ads
  const handleRestoreAds = async () => {
    if (!customer) return;

    setIsRestoringAds(true);
    try {
      await adsService.restoreAds(customer.id);
      setAdsRemoved(false);
      toast.success("Ads restored", {
        description: `Ads have been restored for ${customer.name || customer.email}.`,
        icon: <IconCheck className="h-4 w-4" />,
      });
    } catch (err: any) {
      console.error('Failed to restore ads:', err);
      toast.error("Failed to restore ads", {
        description: err.message || "An error occurred while restoring ads.",
        icon: <IconAlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsRestoringAds(false);
    }
  };

  // Fetch all customer data when the component mounts
  React.useEffect(() => {
    if (customer) {
      fetchPlaylists();
      fetchLikedSongs();
      fetchSongRequests();
      fetchNotificationHistory();
    }
  }, [customer, fetchPlaylists, fetchLikedSongs, fetchSongRequests, fetchNotificationHistory]);

  // Format time for display
  const formatTime = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get country name from code
  const getCountryName = (code: string) => {
    return countries[code as keyof typeof countries] || code;
  }

  if (error) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={title} />
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
        <SiteHeader title={title} />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/customers")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={() => router.push(`/customers/${customer.id}/edit`)}
              disabled={isLoading}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit Customer
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Basic information about the customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[180px]" />
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconMail className="mr-2 h-4 w-4" />
                        Email
                      </div>
                      <div className="font-medium">{customer.email}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconUser className="mr-2 h-4 w-4" />
                        Name
                      </div>
                      <div className="font-medium">{customer.name || "Not provided"}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconPhone className="mr-2 h-4 w-4" />
                        Phone Number
                      </div>
                      <div className="font-medium">{customer.phoneNumber || "Not provided"}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconWorld className="mr-2 h-4 w-4" />
                        Country
                      </div>
                      <div className="font-medium">
                        {customer.country ? getCountryName(customer.country) : "Not provided"}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Account status and authentication details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[180px]" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          Account Status
                        </div>
                        <div className="font-medium">
                          {customer.isActive ? (
                            <div className="flex items-center">
                              <IconCircleCheck className="mr-2 h-4 w-4 text-green-500" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <IconCircleX className="mr-2 h-4 w-4 text-red-500" />
                              Inactive
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          Subscription
                        </div>
                        <div className="font-medium">
                          {customer.isPremium ? (
                            <Badge className="bg-yellow-500">
                              <IconCrown className="mr-1 h-3 w-3" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconAd className="mr-2 h-4 w-4" />
                        Ads Status
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {adsRemoved === null ? (
                            "Loading..."
                          ) : adsRemoved ? (
                            <div className="flex items-center">
                              <IconCircleCheck className="mr-2 h-4 w-4 text-green-500" />
                              Ads Removed
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <IconAd className="mr-2 h-4 w-4 text-yellow-500" />
                              Showing Ads
                            </div>
                          )}
                        </div>
                        <div>
                          {adsRemoved === null ? (
                            <Button variant="outline" size="sm" disabled>
                              Loading...
                            </Button>
                          ) : adsRemoved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRestoreAds}
                              disabled={isRestoringAds}
                            >
                              {isRestoringAds ? "Restoring..." : "Restore Ads"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveAds}
                              disabled={isRemovingAds || !hasActiveSubscription}
                              title={!hasActiveSubscription ? "Customer must have an active subscription to remove ads" : ""}
                            >
                              {isRemovingAds ? "Removing..." : "Remove Ads"}
                            </Button>
                          )}
                        </div>
                      </div>
                      {!hasActiveSubscription && !adsRemoved && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Customer must have an active subscription to remove ads
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconBrandFirebase className="mr-2 h-4 w-4 text-orange-500" />
                        Firebase UID
                      </div>
                      <div className="font-medium break-all">
                        {customer.firebaseUid || "Not linked to Firebase"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconCalendar className="mr-2 h-4 w-4" />
                        Account Created
                      </div>
                      <div className="font-medium">
                        {formatDate(customer.createdAt)}
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatTime(customer.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <IconClock className="mr-2 h-4 w-4" />
                        Last Login
                      </div>
                      <div className="font-medium">
                        {customer.lastLoginAt ? (
                          <>
                            {formatDate(customer.lastLoginAt)}
                            <span className="text-sm text-muted-foreground ml-2">
                              {formatTime(customer.lastLoginAt)}
                            </span>
                          </>
                        ) : (
                          "Never logged in"
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabbed interface for customer data */}
          <Tabs defaultValue="playlists" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="playlists">
                <IconPlaylist className="mr-2 h-4 w-4" />
                Playlists
              </TabsTrigger>
              <TabsTrigger value="liked-songs">
                <IconHeart className="mr-2 h-4 w-4" />
                Liked Songs
              </TabsTrigger>
              <TabsTrigger value="song-requests">
                <IconMessageQuestion className="mr-2 h-4 w-4" />
                Song Requests
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <IconBell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <IconCreditCard className="mr-2 h-4 w-4" />
                Subscription
              </TabsTrigger>
            </TabsList>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Playlists</CardTitle>
                  <CardDescription>
                    Playlists created by this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPlaylists ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span className="ml-3">Loading playlists...</span>
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      This customer hasn't created any playlists yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Songs</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {playlists.map((playlist) => (
                          <TableRow key={playlist.id}>
                            <TableCell className="font-medium">{playlist.name}</TableCell>
                            <TableCell>{playlist.songs?.length || 0}</TableCell>
                            <TableCell>{formatDate(playlist.createdAt)}</TableCell>
                            <TableCell>{formatDate(playlist.updatedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Liked Songs Tab */}
            <TabsContent value="liked-songs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Liked Songs</CardTitle>
                  <CardDescription>
                    Songs liked by this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingLikedSongs ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span className="ml-3">Loading liked songs...</span>
                    </div>
                  ) : likedSongs.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      This customer hasn't liked any songs yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Album</TableHead>
                          <TableHead>Liked On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {likedSongs.map((song) => (
                          <TableRow key={song.id}>
                            <TableCell className="font-medium">{song.title}</TableCell>
                            <TableCell>{song.artist?.name || 'Unknown Artist'}</TableCell>
                            <TableCell>{song.album || 'N/A'}</TableCell>
                            <TableCell>{formatDate(song.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Song Requests Tab */}
            <TabsContent value="song-requests" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Song Requests</CardTitle>
                  <CardDescription>
                    Song requests submitted by this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSongRequests ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span className="ml-3">Loading song requests...</span>
                    </div>
                  ) : songRequests.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      This customer hasn't submitted any song requests yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Song Name</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Upvotes</TableHead>
                          <TableHead>Requested On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {songRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.songName}</TableCell>
                            <TableCell>{request.artistName || 'Not specified'}</TableCell>
                            <TableCell>
                              <Badge variant={request.status === 'COMPLETED' ? 'default' :
                                     request.status === 'APPROVED' || request.status === 'IN_PROGRESS' ? 'outline' :
                                     request.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{request.upvotes}</TableCell>
                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification History</CardTitle>
                  <CardDescription>
                    Notifications received by this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingNotifications ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <span className="ml-3">Loading notifications...</span>
                    </div>
                  ) : notificationHistory.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      This customer hasn't received any notifications yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Read</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notificationHistory.map((notification) => (
                          <TableRow key={notification.id}>
                            <TableCell className="font-medium">{notification.notification.title}</TableCell>
                            <TableCell>
                              <Badge variant={notification.status === 'READ' || notification.status === 'CLICKED' ? 'default' : 'secondary'}>
                                {notification.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(notification.notification.sentAt)}</TableCell>
                            <TableCell>{notification.readAt ? formatDate(notification.readAt) : 'Not read'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Current subscription information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSubscription ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Plan</div>
                          <div className="font-medium">{activeSubscription.plan?.name || 'Unknown Plan'}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Status</div>
                          <div className="font-medium">
                            <Badge variant={activeSubscription.status === 'ACTIVE' ? 'default' :
                                    activeSubscription.status === 'TRIAL' ? 'outline' : 'destructive'}>
                              {activeSubscription.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Start Date</div>
                          <div className="font-medium">{formatDate(activeSubscription.startDate)}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Renewal Date</div>
                          <div className="font-medium">{formatDate(activeSubscription.renewalDate)}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-medium">
                            ${activeSubscription.plan?.price.toFixed(2) || '0.00'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Auto-Renew</div>
                          <div className="font-medium">
                            {activeSubscription.isAutoRenew ? (
                              <div className="flex items-center">
                                <IconCircleCheck className="mr-2 h-4 w-4 text-green-500" />
                                Enabled
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <IconCircleX className="mr-2 h-4 w-4 text-red-500" />
                                Disabled
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {activeSubscription.canceledAt && (
                        <div className="p-4 border rounded-md bg-destructive/10 mt-4">
                          <h4 className="font-semibold mb-2">Subscription Canceled</h4>
                          <p className="text-sm">Canceled on {formatDate(activeSubscription.canceledAt)}</p>
                          {activeSubscription.cancelReason && (
                            <p className="text-sm mt-2">Reason: {activeSubscription.cancelReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      This customer doesn't have an active subscription.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
