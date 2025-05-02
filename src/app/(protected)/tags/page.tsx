"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconDownload,
  IconFilter,
  IconPlus,
  IconSearch,
  IconTag,
  IconTrash,
  IconUpload,
  IconDotsVertical,
  IconPencil,
  IconCheck,
  IconAlertCircle,
  IconColorSwatch,
  IconInfoCircle,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Alert, AlertDescription } from "@/components/ui/alert"
import tagService, { Tag } from "@/services/tag.service"

export default function TagsPage() {
  const router = useRouter()
  const [tags, setTags] = React.useState<Tag[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")

  // Fetch tags on component mount
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const data = await tagService.getAllTags()
        setTags(data)
      } catch (err: any) {
        console.error('Failed to fetch tags:', err)
        setError(`Failed to load tags: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  // Filter tags based on search query
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  )

  // Toggle tag selection
  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Toggle all tags selection
  const toggleAllTags = (checked: boolean) => {
    if (checked) {
      setSelectedTags(filteredTags.map((tag) => tag.id))
    } else {
      setSelectedTags([])
    }
  }

  // Delete selected tags
  const deleteSelectedTags = async () => {
    if (!selectedTags.length) return

    if (confirm(`Are you sure you want to delete ${selectedTags.length} tag(s)?`)) {
      try {
        // Delete each selected tag
        for (const tagId of selectedTags) {
          await tagService.deleteTag(tagId)
        }

        // Update the tags list
        setTags(tags.filter(tag => !selectedTags.includes(tag.id)))

        // Clear selection
        setSelectedTags([])

        // Show success message
        toast.success(`${selectedTags.length} tag(s) deleted`, {
          description: 'The selected tags have been deleted.',
          icon: <IconCheck className="h-4 w-4" />,
        })
      } catch (err: any) {
        console.error('Failed to delete tags:', err)
        toast.error('Failed to delete tags', {
          description: err.message || 'An error occurred while deleting tags.',
          icon: <IconAlertCircle className="h-4 w-4" />,
        })
      }
    }
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <SiteHeader title="Tags" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
              <p className="text-muted-foreground">
                Manage tags for categorizing songs
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/tags/new')}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : tags.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : `${tags.length} total tags`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tagged Songs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : '...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tags used in songs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Used Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : tags.length > 0 ? tags[0].name : 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most frequently used tag
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table with filters */}
          <div className="rounded-md border">
            {/* Table filters */}
            <div className="border-b p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-[300px]"
                  />
                  <Button variant="outline" size="sm" className="h-9">
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTags.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      onClick={deleteSelectedTags}
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete ({selectedTags.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="relative w-full overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-3">Loading tags...</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <IconAlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTags(filteredTags.map(tag => tag.id))
                            } else {
                              setSelectedTags([])
                            }
                          }}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No tags found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTags.map((tag) => (
                        <TableRow key={tag.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => toggleTagSelection(tag.id)}
                              aria-label={`Select ${tag.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                                style={{
                                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                                  color: tag.color || undefined,
                                  borderColor: tag.color || undefined
                                }}
                              >
                                <IconTag className="h-3 w-3" />
                                {tag.name}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {tag.description || <span className="text-muted-foreground italic">No description</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: tag.color || undefined }}
                              ></div>
                              <span className="text-xs font-mono">{tag.color || 'None'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(tag.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/tags/${tag.id}/edit`)}
                              >
                                <IconPencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
                                    try {
                                      await tagService.deleteTag(tag.id)
                                      setTags(tags.filter(t => t.id !== tag.id))
                                      toast.success('Tag deleted', {
                                        description: `The tag "${tag.name}" has been deleted.`,
                                        icon: <IconCheck className="h-4 w-4" />,
                                      })
                                    } catch (err: any) {
                                      toast.error('Failed to delete tag', {
                                        description: err.message || 'An error occurred while deleting the tag.',
                                        icon: <IconAlertCircle className="h-4 w-4" />,
                                      })
                                    }
                                  }
                                }}
                              >
                                <IconTrash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Tag usage info */}
            <div className="flex items-start gap-2 border-t p-4">
              <IconInfoCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Tags help categorize songs and make them easier to find. You can assign multiple tags to each song.
                  Tags can be used for genres, themes, occasions, or any other categorization that makes sense for your content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
