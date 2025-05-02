"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconDotsVertical, IconMessageReply, IconTrash, IconEye, IconRestore } from "@tabler/icons-react"
import { Comment } from "@/services/comment-service"
import { formatDistanceToNow } from "date-fns"

interface CommentsTableProps {
  comments: Comment[]
  onViewComment: (comment: Comment) => void
  onReplyToComment: (comment: Comment) => void
  onDeleteComment: (comment: Comment) => void
  onRestoreComment: (comment: Comment) => void
}

export function CommentsTable({
  comments,
  onViewComment,
  onReplyToComment,
  onDeleteComment,
  onRestoreComment,
}: CommentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Comment</TableHead>
          <TableHead>Song</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No comments found.
            </TableCell>
          </TableRow>
        ) : (
          comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.customer?.profilePicture || ''}
                      alt={comment.customer?.name || 'User'}
                    />
                    <AvatarFallback>
                      {comment.customer?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{comment.customer?.name || 'Unknown User'}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[300px] truncate">
                  {comment.text}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {comment.song ? (
                  <div>
                    <div className="font-medium">{comment.song.title}</div>
                    <div className="text-sm text-muted-foreground">{comment.song.artist.name}</div>
                  </div>
                ) : (
                  'Unknown Song'
                )}
              </TableCell>
              <TableCell>
                {comment.createdAt ? (
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                ) : (
                  'Unknown'
                )}
              </TableCell>
              <TableCell>
                {comment.isDeleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
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
                    <DropdownMenuItem onClick={() => onViewComment(comment)}>
                      <IconEye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {!comment.isDeleted && (
                      <>
                        <DropdownMenuItem onClick={() => onReplyToComment(comment)}>
                          <IconMessageReply className="mr-2 h-4 w-4" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteComment(comment)}
                          className="text-destructive focus:text-destructive"
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {comment.isDeleted && (
                      <DropdownMenuItem onClick={() => onRestoreComment(comment)}>
                        <IconRestore className="mr-2 h-4 w-4" />
                        Restore
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
