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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MediaFile } from "@/services/media.service"
import mediaService from "@/services/media.service"

interface MediaGridProps {
  files: MediaFile[]
  selectedFiles: string[]
  onFileSelect: (fileId: string) => void
  onFileClick: (file: MediaFile) => void
  onDeleteFile: (file: MediaFile) => void
  onCopyUrl: (url: string) => void
  onOpenFile: (url: string) => void
}

export function MediaGrid({
  files,
  selectedFiles,
  onFileSelect,
  onFileClick,
  onDeleteFile,
  onCopyUrl,
  onOpenFile,
}: MediaGridProps) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-4">
      {files.map((file) => (
        <MediaGridItem
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
    </div>
  )
}

interface MediaGridItemProps {
  file: MediaFile
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  onDelete: () => void
  onCopyUrl: () => void
  onOpenFile: () => void
}

function MediaGridItem({
  file,
  isSelected,
  onSelect,
  onClick,
  onDelete,
  onCopyUrl,
  onOpenFile,
}: MediaGridItemProps) {
  const isImage = mediaService.isImageFile(file.mimeType)
  const isAudio = mediaService.isAudioFile(file.mimeType)
  const isVideo = mediaService.isVideoFile(file.mimeType)

  return (
    <div className={`group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Actions dropdown */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm">
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
      </div>

      {/* File preview */}
      <div className="aspect-square bg-muted flex items-center justify-center cursor-pointer" onClick={onClick}>
        {isImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-4xl">
            {mediaService.getFileTypeIcon(file.mimeType)}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="p-2">
        <div className="text-xs font-medium truncate" title={file.name}>
          {file.name}
        </div>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="outline" className={`text-xs ${mediaService.getBucketColor(file.bucket)}`}>
            {file.bucket}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {mediaService.formatFileSize(file.size)}
          </span>
        </div>
        
        {/* Usage indicator */}
        {file.usageCount > 0 ? (
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs">
              Used in {file.usageCount} item(s)
            </Badge>
          </div>
        ) : (
          <div className="mt-1">
            <Badge variant="destructive" className="text-xs">
              <IconAlertTriangle className="mr-1 h-3 w-3" />
              Unused
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
