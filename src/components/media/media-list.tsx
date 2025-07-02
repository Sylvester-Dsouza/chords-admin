"use client"

import * as React from "react"
import {
  IconEye,
  IconTrash,
  IconCopy,
  IconExternalLink,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { MediaFile } from "@/services/media.service"
import mediaService from "@/services/media.service"

interface MediaListProps {
  files: MediaFile[]
  selectedFiles: string[]
  onFileSelect: (fileId: string) => void
  onSelectAll: () => void
  onFileClick: (file: MediaFile) => void
  onDeleteFile: (file: MediaFile) => void
  onCopyUrl: (url: string) => void
  onOpenFile: (url: string) => void
}

export function MediaList({
  files,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onFileClick,
  onDeleteFile,
  onCopyUrl,
  onOpenFile,
}: MediaListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <IconAlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No files found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or upload some files.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedFiles.length === files.length && files.length > 0}
              onCheckedChange={onSelectAll}
              aria-label="Select all files"
            />
          </TableHead>
          <TableHead className="w-16">Preview</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Bucket</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <MediaListItem
            key={file.id}
            file={file}
            isSelected={selectedFiles.includes(file.id)}
            onSelect={() => onFileSelect(file.id)}
            onClick={() => onFileClick(file)}
            onDelete={() => onDeleteFile(file)}
            onCopyUrl={() => onCopyUrl(file.url)}
            onOpenFile={() => onOpenFile(file.url)}
          />
        ))}
      </TableBody>
    </Table>
  )
}

interface MediaListItemProps {
  file: MediaFile
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  onDelete: () => void
  onCopyUrl: () => void
  onOpenFile: () => void
}

function MediaListItem({
  file,
  isSelected,
  onSelect,
  onClick,
  onDelete,
  onCopyUrl,
  onOpenFile,
}: MediaListItemProps) {
  const isImage = mediaService.isImageFile(file.mimeType)

  return (
    <TableRow className={isSelected ? 'bg-muted/50' : ''}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${file.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-lg">
              {mediaService.getFileTypeIcon(file.mimeType)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <button
            onClick={onClick}
            className="text-left font-medium hover:underline max-w-[200px] truncate"
            title={file.name}
          >
            {file.name}
          </button>
          <span className="text-xs text-muted-foreground">
            {file.path}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-lg">{mediaService.getFileTypeIcon(file.mimeType)}</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {mediaService.getFileExtension(file.name).toUpperCase() || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground">
              {file.mimeType}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-mono">
          {mediaService.formatFileSize(file.size)}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={mediaService.getBucketColor(file.bucket)}>
          {file.bucket}
        </Badge>
      </TableCell>
      <TableCell>
        {file.usageCount > 0 ? (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="text-xs w-fit">
              {file.usageCount} reference(s)
            </Badge>
            <div className="flex flex-wrap gap-1">
              {file.usedIn.slice(0, 3).map((usage, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs ${mediaService.getUsageTypeColor(usage.type)}`}
                >
                  {mediaService.getUsageTypeIcon(usage.type)} {usage.type}
                </Badge>
              ))}
              {file.usedIn.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{file.usedIn.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <Badge variant="destructive" className="text-xs">
            <IconAlertTriangle className="mr-1 h-3 w-3" />
            Unused
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {new Date(file.createdAt).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconEye className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              <IconEye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenFile}>
              <IconExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyUrl}>
              <IconCopy className="mr-2 h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
