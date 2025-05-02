"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconMessageCircle, IconLoader2, IconDownload } from "@tabler/icons-react"
import { CommentsTable } from "@/components/comments/comments-table"
import { CommentsFilter } from "@/components/comments/comments-filter"
import { CommentDetailDialog } from "@/components/comments/comment-detail-dialog"
import { CommentService, Comment, CommentFilters } from "@/services/comment-service"
// Moderation functionality removed

export default function CommentsPage() {
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [newCommentsToday, setNewCommentsToday] = useState(0)
  // Flagged comments state removed
  const [mostActiveSong, setMostActiveSong] = useState<{ id: string; title: string; commentCount: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<CommentFilters>({})
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Load comments and stats
  useEffect(() => {
    const loadCommentsAndStats = async () => {
      setLoading(true)
      try {
        // Load comments with current filters and pagination
        const commentsResponse = await CommentService.getComments({
          ...filters,
          page: currentPage,
          limit: 10,
        })
        setComments(commentsResponse.data)
        setTotalPages(Math.ceil(commentsResponse.total / commentsResponse.limit))

        // Load comment statistics
        const stats = await CommentService.getCommentStats()
        setTotalComments(stats.totalComments)
        setNewCommentsToday(stats.newCommentsToday)
        // Flagged comments removed
        setMostActiveSong(stats.mostActiveSong)
      } catch (error) {
        console.error("Error loading comments:", error)
        toast.error("Failed to load comments. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadCommentsAndStats()
  }, [currentPage, filters, toast])

  // Handle filter changes
  const handleFilterChange = (newFilters: CommentFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle view comment
  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment)
    setIsDetailDialogOpen(true)
  }

  // Handle reply to comment
  const handleReplyToComment = (comment: Comment) => {
    setSelectedComment(comment)
    setIsDetailDialogOpen(true)
  }

  // Handle send reply
  const handleSendReply = async (text: string) => {
    if (!selectedComment) return

    try {
      await CommentService.replyToComment(selectedComment.id, text)
      toast.success("Reply sent successfully.")
      setIsDetailDialogOpen(false)

      // Refresh comments
      const commentsResponse = await CommentService.getComments({
        ...filters,
        page: currentPage,
        limit: 10,
      })
      setComments(commentsResponse.data)
    } catch (error) {
      console.error("Error replying to comment:", error)
      toast.error("Failed to send reply. Please try again.")
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (comment: Comment) => {
    try {
      await CommentService.deleteComment(comment.id)
      toast.success("Comment deleted successfully.")

      // Refresh comments
      const commentsResponse = await CommentService.getComments({
        ...filters,
        page: currentPage,
        limit: 10,
      })
      setComments(commentsResponse.data)
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment. Please try again.")
    }
  }

  // Handle restore comment
  const handleRestoreComment = async (comment: Comment) => {
    try {
      await CommentService.restoreComment(comment.id)
      toast.success("Comment restored successfully.")

      // Refresh comments
      const commentsResponse = await CommentService.getComments({
        ...filters,
        page: currentPage,
        limit: 10,
      })
      setComments(commentsResponse.data)
    } catch (error) {
      console.error("Error restoring comment:", error)
      toast.error("Failed to restore comment. Please try again.")
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
        <SiteHeader title="Comments" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
              <p className="text-muted-foreground">
                View and manage user comments across all songs
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "-" : totalComments}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : "From all songs"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Comments Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "-" : newCommentsToday}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : "In the last 24 hours"}
                </p>
              </CardContent>
            </Card>
            {/* Flagged comments card removed */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Active Song</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "-" : (mostActiveSong ? mostActiveSong.title : "None")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : (mostActiveSong ? `${mostActiveSong.commentCount} comments` : "No comments yet")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Moderation Queue removed */}

          {/* Table with filters */}
          <div className="rounded-md border">
            {/* Table filters */}
            <div className="border-b p-4">
              <CommentsFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Comments table */}
            {loading ? (
              <div className="flex h-[300px] w-full items-center justify-center">
                <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center p-4">
                  <IconMessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No comments found matching your filters
                  </p>
                </div>
              </div>
            ) : (
              <>
                <CommentsTable
                  comments={comments}
                  onViewComment={handleViewComment}
                  onReplyToComment={handleReplyToComment}
                  onDeleteComment={handleDeleteComment}
                  onRestoreComment={handleRestoreComment}
                />
                <div className="flex items-center justify-between border-t px-4 py-2">
                  <div className="text-sm text-muted-foreground">
                    Showing <strong>{(currentPage - 1) * 10 + 1}</strong> to <strong>{Math.min(currentPage * 10, totalComments)}</strong> of{" "}
                    <strong>{totalComments}</strong> comments
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comment detail dialog */}
        <CommentDetailDialog
          comment={selectedComment}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          onReply={handleSendReply}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
