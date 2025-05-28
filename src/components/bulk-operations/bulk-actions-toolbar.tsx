"use client"

import * as React from "react"
import { 
  IconTrash, 
  IconEdit, 
  IconEye, 
  IconEyeOff, 
  IconStar, 
  IconStarOff,
  IconTag,
  IconDownload,
  IconX,
  IconCheck,
  IconLoader2
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  variant?: "default" | "destructive" | "outline" | "secondary"
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationDescription?: string
}

interface BulkActionsToolbarProps {
  selectedItems: string[]
  totalItems: number
  onClearSelection: () => void
  onSelectAll: () => void
  actions: BulkAction[]
  onAction: (actionId: string, selectedItems: string[]) => Promise<void>
  resourceType: string // "songs", "artists", "collections", etc.
}

export function BulkActionsToolbar({
  selectedItems,
  totalItems,
  onClearSelection,
  onSelectAll,
  actions,
  onAction,
  resourceType
}: BulkActionsToolbarProps) {
  const [isActionLoading, setIsActionLoading] = React.useState(false)
  const [confirmAction, setConfirmAction] = React.useState<BulkAction | null>(null)

  const handleAction = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action)
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: BulkAction) => {
    try {
      setIsActionLoading(true)
      await onAction(action.id, selectedItems)
      
      toast.success(`Bulk ${action.label.toLowerCase()} completed`, {
        description: `Successfully processed ${selectedItems.length} ${resourceType}`
      })
      
      onClearSelection()
    } catch (error) {
      console.error(`Bulk ${action.label} failed:`, error)
      toast.error(`Bulk ${action.label.toLowerCase()} failed`, {
        description: `Failed to process ${resourceType}. Please try again.`
      })
    } finally {
      setIsActionLoading(false)
      setConfirmAction(null)
    }
  }

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {selectedItems.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedItems.length < totalItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="text-sm"
            >
              Select all {totalItems}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          {actions.slice(0, 2).map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleAction(action)}
                disabled={isActionLoading}
                className="gap-2"
              >
                {isActionLoading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {action.label}
              </Button>
            )
          })}

          {/* More Actions Dropdown */}
          {actions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {actions.slice(2).map((action, index) => {
                  const Icon = action.icon
                  return (
                    <React.Fragment key={action.id}>
                      {index === 0 && actions.length > 2 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => handleAction(action)}
                        disabled={isActionLoading}
                        className={action.variant === "destructive" ? "text-destructive" : ""}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {action.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmationTitle || `Confirm ${confirmAction?.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmationDescription || 
                `Are you sure you want to ${confirmAction?.label.toLowerCase()} ${selectedItems.length} ${resourceType}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={confirmAction?.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Predefined bulk actions for different resource types
export const songBulkActions: BulkAction[] = [
  {
    id: "activate",
    label: "Activate",
    icon: IconEye,
    variant: "default"
  },
  {
    id: "deactivate", 
    label: "Deactivate",
    icon: IconEyeOff,
    variant: "secondary"
  },
  {
    id: "feature",
    label: "Feature",
    icon: IconStar,
    variant: "outline"
  },
  {
    id: "unfeature",
    label: "Unfeature", 
    icon: IconStarOff,
    variant: "outline"
  },
  {
    id: "add-tags",
    label: "Add Tags",
    icon: IconTag,
    variant: "outline"
  },
  {
    id: "export",
    label: "Export",
    icon: IconDownload,
    variant: "outline"
  },
  {
    id: "delete",
    label: "Delete",
    icon: IconTrash,
    variant: "destructive",
    requiresConfirmation: true,
    confirmationTitle: "Delete Songs",
    confirmationDescription: "Are you sure you want to delete these songs? This action cannot be undone and will remove all associated data including ratings and comments."
  }
]

export const artistBulkActions: BulkAction[] = [
  {
    id: "activate",
    label: "Activate",
    icon: IconEye,
    variant: "default"
  },
  {
    id: "deactivate",
    label: "Deactivate", 
    icon: IconEyeOff,
    variant: "secondary"
  },
  {
    id: "feature",
    label: "Feature",
    icon: IconStar,
    variant: "outline"
  },
  {
    id: "export",
    label: "Export",
    icon: IconDownload,
    variant: "outline"
  },
  {
    id: "delete",
    label: "Delete",
    icon: IconTrash,
    variant: "destructive",
    requiresConfirmation: true,
    confirmationTitle: "Delete Artists",
    confirmationDescription: "Are you sure you want to delete these artists? This will also affect all songs by these artists."
  }
]

export const collectionBulkActions: BulkAction[] = [
  {
    id: "activate",
    label: "Activate",
    icon: IconEye,
    variant: "default"
  },
  {
    id: "deactivate",
    label: "Deactivate",
    icon: IconEyeOff, 
    variant: "secondary"
  },
  {
    id: "export",
    label: "Export",
    icon: IconDownload,
    variant: "outline"
  },
  {
    id: "delete",
    label: "Delete",
    icon: IconTrash,
    variant: "destructive",
    requiresConfirmation: true
  }
]
