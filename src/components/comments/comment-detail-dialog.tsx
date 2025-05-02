"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Comment } from "@/services/comment-service"
import { format } from "date-fns"

interface CommentDetailDialogProps {
  comment: Comment | null
  isOpen: boolean
  onClose: () => void
  onReply: (text: string) => void
}

export function CommentDetailDialog({
  comment,
  isOpen,
  onClose,
  onReply,
}: CommentDetailDialogProps) {
  const [replyText, setReplyText] = useState("")

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText)
      setReplyText("")
    }
  }

  if (!comment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comment Details</DialogTitle>
          <DialogDescription>
            View and respond to this comment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main comment */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={comment.customer?.profilePicture || ''} 
                  alt={comment.customer?.name || 'User'} 
                />
                <AvatarFallback>
                  {comment.customer?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{comment.customer?.name || 'Unknown User'}</div>
                  <div className="text-sm text-muted-foreground">
                    {comment.createdAt ? format(new Date(comment.createdAt), 'PPpp') : 'Unknown date'}
                  </div>
                </div>
                <div className="mt-2 text-sm">{comment.text}</div>
                <div className="mt-2 flex items-center gap-2">
                  {comment.isDeleted ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                  {comment.likesCount !== undefined && comment.likesCount > 0 && (
                    <Badge variant="outline">{comment.likesCount} likes</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Song info */}
          {comment.song && (
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Song Information</div>
              <div className="mt-2">
                <div className="font-medium">{comment.song.title}</div>
                <div className="text-sm text-muted-foreground">{comment.song.artist.name}</div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Replies ({comment.replies.length})</div>
              <div className="space-y-2 pl-6">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={reply.customer?.profilePicture || ''} 
                          alt={reply.customer?.name || 'User'} 
                        />
                        <AvatarFallback>
                          {reply.customer?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{reply.customer?.name || 'Unknown User'}</div>
                          <div className="text-sm text-muted-foreground">
                            {reply.createdAt ? format(new Date(reply.createdAt), 'PPpp') : 'Unknown date'}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">{reply.text}</div>
                        <div className="mt-2 flex items-center gap-2">
                          {reply.isDeleted ? (
                            <Badge variant="destructive">Deleted</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                          {reply.likesCount !== undefined && reply.likesCount > 0 && (
                            <Badge variant="outline">{reply.likesCount} likes</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply form */}
          {!comment.isDeleted && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Reply as Admin</div>
                <Textarea
                  placeholder="Write your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!comment.isDeleted && (
            <Button onClick={handleReply} disabled={!replyText.trim()}>
              Send Reply
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
