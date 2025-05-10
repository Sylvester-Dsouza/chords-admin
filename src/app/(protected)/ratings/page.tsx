"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconExternalLink,
  IconLoader2,
  IconRefresh,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react"

import ratingService, { RatingFilters, RatingStats, SongRating } from "@/services/rating.service"
import { RatingsFilter } from "@/components/ratings/ratings-filter"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function RatingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState<SongRating[]>([])
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [totalRatings, setTotalRatings] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [highestRatedSong, setHighestRatedSong] = useState<{ id: string; title: string; averageRating: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<RatingFilters>({})

  // Load ratings and stats
  useEffect(() => {
    const loadRatingsAndStats = async () => {
      setLoading(true)
      try {
        console.log("Loading ratings with filters:", filters, "page:", currentPage)

        // Load ratings with current filters and pagination
        const ratingsResponse = await ratingService.getAllRatings({
          ...filters,
          page: currentPage,
          limit: 10,
        })

        console.log("Ratings response:", ratingsResponse)

        if (ratingsResponse.data && Array.isArray(ratingsResponse.data)) {
          setRatings(ratingsResponse.data)
          setTotalRatings(ratingsResponse.total)
          setTotalPages(Math.ceil(ratingsResponse.total / ratingsResponse.limit))
        } else {
          console.warn("Unexpected ratings response format:", ratingsResponse)
          setRatings([])
          setTotalRatings(0)
          setTotalPages(1)
        }

        // Load rating statistics
        console.log("Loading rating statistics")
        try {
          // Try direct API call first for stats
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const statsResponse = await fetch(`${baseUrl}/api/song-ratings/public-stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log("Direct stats response:", statsData);

            setAverageRating(statsData.averageRating || 0);

            // Set highest rated song if available
            if (statsData.highestRatedSongs && statsData.highestRatedSongs.length > 0) {
              setHighestRatedSong(statsData.highestRatedSongs[0]);
            }
          } else {
            // Fall back to service method
            const stats = await ratingService.getRatingStats();
            console.log("Stats service response:", stats);

            if (stats) {
              setAverageRating(stats.averageRating || 0);

              // Set highest rated song if available
              if (stats.highestRatedSongs && stats.highestRatedSongs.length > 0) {
                setHighestRatedSong(stats.highestRatedSongs[0]);
              }
            }
          }
        } catch (statsError) {
          console.error("Error loading stats directly:", statsError);

          // Fall back to service method
          try {
            const stats = await ratingService.getRatingStats();
            console.log("Stats service response:", stats);

            if (stats) {
              setAverageRating(stats.averageRating || 0);

              // Set highest rated song if available
              if (stats.highestRatedSongs && stats.highestRatedSongs.length > 0) {
                setHighestRatedSong(stats.highestRatedSongs[0]);
              }
            }
          } catch (serviceError) {
            console.error("Error loading stats via service:", serviceError);
          }
        }

        // Set distribution stats
        if (filters.songId) {
          try {
            const songStats = await ratingService.getRatingStatsForSong(filters.songId)
            setStats(songStats)
          } catch (songStatsError) {
            console.error("Error loading song stats:", songStatsError)
            setStats({
              averageRating: averageRating || 0,
              ratingCount: totalRatings || 0,
              distribution: {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
              },
            })
          }
        } else {
          setStats({
            averageRating: averageRating || 0,
            ratingCount: totalRatings || 0,
            distribution: {
              "1": 0, // These would need to be populated from the API
              "2": 0,
              "3": 0,
              "4": 0,
              "5": 0,
            },
          })
        }
      } catch (error: any) {
        console.error("Error loading ratings:", error)
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
        toast.error("Failed to load ratings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadRatingsAndStats()
  }, [currentPage, filters, averageRating, totalRatings])

  // Handle filter changes
  const handleFilterChange = (newFilters: RatingFilters) => {
    console.log("Applying filters:", newFilters)
    // Convert string dates to proper format if needed
    const formattedFilters: RatingFilters = {
      ...newFilters,
      // Convert search to songId or customerId based on search pattern
      songId: newFilters.search?.startsWith('song:')
        ? newFilters.search.substring(5).trim()
        : undefined,
      customerId: newFilters.search?.startsWith('user:')
        ? newFilters.search.substring(5).trim()
        : undefined,
      // If search doesn't have a prefix, keep it as is for general search
      search: (!newFilters.search?.startsWith('song:') && !newFilters.search?.startsWith('user:'))
        ? newFilters.search
        : undefined
    }

    setFilters(formattedFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle delete rating
  const handleDeleteRating = async (id: string) => {
    try {
      await ratingService.deleteRating(id)
      toast.success("Rating deleted successfully.")

      // Refresh ratings
      const ratingsResponse = await ratingService.getAllRatings({
        ...filters,
        page: currentPage,
        limit: 10,
      })
      setRatings(ratingsResponse.data)
      setTotalRatings(ratingsResponse.total)
      setTotalPages(Math.ceil(ratingsResponse.total / ratingsResponse.limit))
    } catch (error) {
      console.error("Error deleting rating:", error)
      toast.error("Failed to delete rating. Please try again.")
    }
  }

  // Render stars for a rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          index < rating
            ? <IconStarFilled key={index} className="h-4 w-4 text-yellow-500" />
            : <IconStar key={index} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}</span>
      </div>
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
        <SiteHeader title="Ratings" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ratings</h1>
              <p className="text-muted-foreground">
                View and manage song ratings from customers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setLoading(true);
                  // Reset to first page and clear filters
                  setCurrentPage(1);
                  setFilters({});

                  try {
                    // Force a direct API call to refresh the data
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                    const response = await fetch(`${baseUrl}/api/song-ratings/public?page=1&limit=10`);
                    const data = await response.json();

                    if (response.ok) {
                      setRatings(data.data || []);
                      setTotalRatings(data.total || 0);
                      setTotalPages(Math.ceil((data.total || 0) / 10));
                      toast.success('Ratings refreshed successfully');
                    } else {
                      toast.error('Failed to refresh ratings');
                    }
                  } catch (error) {
                    console.error('Error refreshing ratings:', error);
                    toast.error('Error refreshing ratings');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "-" : totalRatings}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : "From all songs"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold mr-2">
                    {loading ? "-" : averageRating.toFixed(1)}
                  </div>
                  {!loading && renderStars(Math.round(averageRating))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : "Across all songs"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Highest Rated Song</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "-" : (highestRatedSong ? highestRatedSong.title : "None")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : (highestRatedSong ? `${highestRatedSong.averageRating.toFixed(1)} stars` : "No ratings yet")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table with filters */}
          <div className="rounded-md border">
            {/* Table filters */}
            <div className="border-b p-4">
              <RatingsFilter
                onFilterChange={handleFilterChange}
                onResetFilters={() => setFilters({})}
              />
            </div>

            {/* Ratings table */}
            {loading ? (
              <div className="flex h-[300px] w-full items-center justify-center">
                <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : ratings.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center p-4">
                  <IconStarFilled className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No ratings found matching your filters
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Song</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratings.map((rating) => (
                      <TableRow key={rating.id}>
                        <TableCell>
                          {rating.song ? (
                            <div>
                              <div className="font-medium">{rating.song.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {rating.song.artist?.name}
                              </div>
                            </div>
                          ) : (
                            "Unknown Song"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={rating.customer?.profilePicture || ""} />
                              <AvatarFallback>
                                {rating.customer?.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{rating.customer?.name || "Unknown"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{renderStars(rating.rating)}</TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate">
                            {rating.comment || <span className="text-muted-foreground italic">No comment</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rating.createdAt ? (
                            <div className="text-sm">
                              {format(new Date(rating.createdAt), "MMM d, yyyy")}
                            </div>
                          ) : (
                            'Unknown'
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <IconDotsVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {rating.song && (
                                <DropdownMenuItem onClick={() => router.push(`/songs/${rating.songId}`)}>
                                  <IconEye className="mr-2 h-4 w-4" />
                                  View Song
                                </DropdownMenuItem>
                              )}
                              {rating.customer && (
                                <DropdownMenuItem onClick={() => router.push(`/customers/${rating.customerId}`)}>
                                  <IconExternalLink className="mr-2 h-4 w-4" />
                                  View Customer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteRating(rating.id)}>
                                <IconTrash className="mr-2 h-4 w-4" />
                                Delete Rating
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t px-4 py-2">
                  <div className="text-sm text-muted-foreground">
                    Showing <strong>{totalRatings > 0 ? (currentPage - 1) * 10 + 1 : 0}</strong> to <strong>{Math.min(currentPage * 10, totalRatings)}</strong> of{" "}
                    <strong>{totalRatings}</strong> ratings
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
