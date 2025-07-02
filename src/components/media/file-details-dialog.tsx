"use client"

import * as React from "react"
import {
  IconX,
  IconCopy,
  IconExternalLink,
  IconTrash,
  IconDownload,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { MediaFile } from "@/services/media.service"
import mediaService from "@/services/media.service"

interface FileDetailsDialogProps {
  file: MediaFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (file: MediaFile) => void
  onCopyUrl: (url: string) => void
  onOpenFile: (url: string) => void
}

export function FileDetailsDialog({
  file,
  open,
  onOpenChange,
  onDelete,
  onCopyUrl,
  onOpenFile,
}: FileDetailsDialogProps) {
  if (!file) return null

  const isImage = mediaService.isImageFile(file.mimeType)
  const isAudio = mediaService.isAudioFile(file.mimeType)
  const isVideo = mediaService.isVideoFile(file.mimeType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate mr-4">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="border rounded-lg overflow-hidden bg-muted">
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-auto max-h-96 object-contain"
                />
              ) : isVideo ? (
                <video
                  src={file.url}
                  controls
                  className="w-full h-auto max-h-96"
                >
                  Your browser does not support the video tag.
                </video>
              ) : isAudio ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <audio src={file.url} controls className="w-full">
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">
                    {mediaService.getFileTypeIcon(file.mimeType)}
                  </div>
                  <p className="text-muted-foreground">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenFile(file.url)}
              >
                <IconExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyUrl(file.url)}
              >
                <IconCopy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(file)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* File Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">File Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Name:</span>
                  <span className="col-span-2 text-sm break-all">{file.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Size:</span>
                  <span className="col-span-2 text-sm">{mediaService.formatFileSize(file.size)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <span className="col-span-2 text-sm">{file.mimeType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Bucket:</span>
                  <div className="col-span-2">
                    <Badge variant="outline" className={mediaService.getBucketColor(file.bucket)}>
                      {file.bucket}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Path:</span>
                  <span className="col-span-2 text-sm font-mono break-all">{file.path}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Created:</span>
                  <span className="col-span-2 text-sm">{new Date(file.createdAt).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Updated:</span>
                  <span className="col-span-2 text-sm">{new Date(file.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Usage Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Usage Information</h3>
              {file.usageCount > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Used in {file.usageCount} item(s)
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {file.usedIn.map((usage, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {mediaService.getUsageTypeIcon(usage.type)}
                          </span>
                          <div>
                            <div className="font-medium">{usage.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {usage.type} • {usage.field}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={mediaService.getUsageTypeColor(usage.type)}
                        >
                          {usage.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <IconAlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-medium text-orange-600 mb-2">Unused File</h4>
                  <p className="text-sm text-muted-foreground">
                    This file is not currently referenced by any content.
                    <br />
                    It can be safely deleted if no longer needed.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* URL Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">URL</h3>
              <div className="p-3 bg-muted rounded-lg">
                <code className="text-sm break-all">{file.url}</code>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
