"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AnalyticsService } from "@/services/analytics.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconRefresh,
  IconChartBar,
  IconEye,
  IconHeart,
  IconMessageCircle,
  IconCalendar,
  IconUsers
} from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// Mock data for now - will be replaced with API calls
const mockData = {
  mostViewedSongs: [
    { id: "1", title: "Amazing Grace", artist: { name: "John Newton" }, viewCount: 1245 },
    { id: "2", title: "How Great Is Our God", artist: { name: "Chris Tomlin" }, viewCount: 987 },
    { id: "3", title: "10,000 Reasons", artist: { name: "Matt Redman" }, viewCount: 876 },
    { id: "4", title: "What A Beautiful Name", artist: { name: "Hillsong Worship" }, viewCount: 765 },
    { id: "5", title: "Oceans", artist: { name: "Hillsong United" }, viewCount: 654 }
  ],
  mostViewedArtists: [
    { id: "1", name: "Hillsong Worship", viewCount: 3245 },
    { id: "2", name: "Chris Tomlin", viewCount: 2987 },
    { id: "3", name: "Elevation Worship", viewCount: 2876 },
    { id: "4", name: "Bethel Music", viewCount: 2765 },
    { id: "5", name: "Matt Redman", viewCount: 2654 }
  ],
  mostViewedCollections: [
    { id: "1", name: "Top Worship Songs", viewCount: 2145 },
    { id: "2", name: "Christmas Carols", viewCount: 1987 },
    { id: "3", name: "Easter Songs", viewCount: 1876 },
    { id: "4", name: "Hymns", viewCount: 1765 },
    { id: "5", name: "Acoustic Worship", viewCount: 1654 }
  ],
  userActivity: {
    activeUsers: 1245,
    newUsers: 87,
    totalSessions: 3456,
    avgSessionDuration: 420 // in seconds
  },
  contentEngagement: {
    viewsByType: {
      song: 12345,
      artist: 5678,
      collection: 2345
    },
    totalLikes: 4567,
    totalComments: 2345
  }
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month")
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(mockData)

  // Load data from API with rate limit handling
  const loadData = async () => {
    setIsLoading(true)

    try {
      // Show a loading toast to indicate the process might take some time
      toast.loading("Loading analytics data...", {
        id: "analytics-loading",
        duration: 10000 // 10 seconds
      })

      const analyticsData = await AnalyticsService.getAllAnalytics(period)
      setData(analyticsData)

      // Dismiss the loading toast and show success
      toast.dismiss("analytics-loading")
      toast.success("Analytics data refreshed")
    } catch (error: any) {
      console.error("Error loading analytics data:", error)
      toast.dismiss("analytics-loading")

      // Check if it's an authentication error
      if (error.message === 'AUTH_ERROR') {
        toast.error("Authentication error. Please log in again.")
        // Don't redirect here - the auth context will handle that
      } else if (error.response?.status === 429) {
        // Rate limit error
        toast.error("Rate limit exceeded. Please wait a moment and try again.", {
          duration: 5000
        })
        // Fallback to mock data in case of error
        setData(mockData)
      } else {
        toast.error("Failed to load analytics data. Please try again later.")
        // Fallback to mock data in case of error
        setData(mockData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and when period changes
  useEffect(() => {
    // Add a debounce to prevent multiple rapid requests when period changes
    const timer = setTimeout(async () => {
      await loadData()
    }, 300) // 300ms debounce

    // Cleanup function to clear the timeout if component unmounts or period changes again
    return () => clearTimeout(timer)
  }, [period])

  // Format seconds to minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
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
        <SiteHeader title="Analytics" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">
                View key metrics about your app usage
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={period} onValueChange={setPeriod} disabled={isLoading}>
                <SelectTrigger className="w-[180px]">
                  <IconCalendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : (
                    data.contentEngagement.viewsByType.song +
                    data.contentEngagement.viewsByType.artist +
                    data.contentEngagement.viewsByType.collection
                  ).toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <IconEye className="h-4 w-4 text-muted-foreground mr-1" />
                  <p className="text-xs text-muted-foreground">
                    Content views in selected period
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : data.userActivity.activeUsers.toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <IconUsers className="h-4 w-4 text-muted-foreground mr-1" />
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "..." : data.userActivity.newUsers} new users
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : data.contentEngagement.totalLikes.toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <IconHeart className="h-4 w-4 text-muted-foreground mr-1" />
                  <p className="text-xs text-muted-foreground">
                    Song likes in selected period
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : data.contentEngagement.totalComments.toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <IconMessageCircle className="h-4 w-4 text-muted-foreground mr-1" />
                  <p className="text-xs text-muted-foreground">
                    Comments in selected period
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Viewed Content */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Most Viewed Songs */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Songs</CardTitle>
                <CardDescription>
                  Top songs by view count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : (
                    data.mostViewedSongs.map((song) => (
                      <div key={song.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.artist.name}</p>
                        </div>
                        <div className="flex items-center">
                          <IconEye className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm font-medium">{song.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Viewed Artists */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Artists</CardTitle>
                <CardDescription>
                  Top artists by view count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : (
                    data.mostViewedArtists.map((artist) => (
                      <div key={artist.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{artist.name}</p>
                        </div>
                        <div className="flex items-center">
                          <IconEye className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm font-medium">{artist.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Viewed Collections */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Collections</CardTitle>
                <CardDescription>
                  Top collections by view count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : (
                    data.mostViewedCollections.map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{collection.name}</p>
                        </div>
                        <div className="flex items-center">
                          <IconEye className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm font-medium">{collection.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                User engagement metrics for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : data.userActivity.activeUsers.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">New Users</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : data.userActivity.newUsers.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : data.userActivity.totalSessions.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg. Session Duration</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : formatDuration(data.userActivity.avgSessionDuration)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
