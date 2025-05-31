"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconDownload,
  IconMicrophone,
  IconPlus,
  IconTrash,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconCopy,
  IconAlertCircle,
  IconUsers,
  IconStar,
  IconTrendingUp
} from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

import coursesService, { Course } from "@/services/courses.service"
import { BulkActionsToolbar } from "@/components/bulk-operations/bulk-actions-toolbar"
import { AdvancedFilters, FilterOption, FilterState } from "@/components/filters/advanced-filters"

// Define bulk actions for  courses
const CourseBulkActions = [
  {
    id: "publish",
    label: "Publish",
    icon: IconTrendingUp,
    variant: "default" as const,
    description: "Make selected courses available to customers"
  },
  {
    id: "unpublish",
    label: "Unpublish",
    icon: IconEye,
    variant: "outline" as const,
    description: "Hide selected courses from customers"
  },
  {
    id: "delete",
    label: "Delete",
    icon: IconTrash,
    variant: "destructive" as const,
    description: "Permanently delete selected courses"
  }
]

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([])

  // Advanced filters state
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    sortBy: "title",
    sortOrder: "asc",
    level: "all",
    status: "all",
    featured: "all"
  })

  const [visibleColumns] = React.useState({
    image: true,
    title: true,
    courseType: true,
    level: true,
    totalDays: true,
    totalLessons: true,
    enrollments: true,
    rating: true,
    status: true,
    featured: true,
    createdAt: true,
  })

  // Fetch courses from the API
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('🚀 Starting to fetch courses...')
        setLoading(true)
        const data = await coursesService.getAllCourses()

        console.log('📥 Received data from service:', data)
        console.log('📥 Data type:', typeof data)
        console.log('📥 Is data an array?', Array.isArray(data))
        console.log('📥 Data length:', data?.length)

        // Ensure we always set an array
        const coursesArray = Array.isArray(data) ? data : []
        console.log('📋 Setting courses array:', coursesArray)
        console.log('📋 Courses array length:', coursesArray.length)

        setCourses(coursesArray)
        setError(null)

        console.log('✅ Courses state updated successfully')
      } catch (err) {
        console.error('❌ Failed to fetch courses:', err)
        setError('Failed to load courses. Please try again later.')
        // Set empty array on error to prevent filter issues
        setCourses([])
      } finally {
        setLoading(false)
        console.log('🏁 Fetch courses completed')
      }
    }

    fetchCourses()
  }, [])

  // Filter and sort courses based on advanced filters
  const filteredAndSortedCourses = React.useMemo(() => {
    console.log('🔍 Filtering courses...')
    console.log('🔍 Input courses:', courses)
    console.log('🔍 Input courses type:', typeof courses)
    console.log('🔍 Input courses is array:', Array.isArray(courses))
    console.log('🔍 Input courses length:', courses?.length)

    // Ensure courses is an array before filtering
    if (!Array.isArray(courses)) {
      console.log('❌ Courses is not an array, returning empty array')
      return []
    }

    let filtered = courses.filter((course) => {
      const matchesSearch = !filters.search ||
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description.toLowerCase().includes(filters.search.toLowerCase())

      const matchesLevel = filters.level === "all" || course.level === filters.level
      const matchesStatus = filters.status === "all" ||
        (filters.status === "published" && course.isPublished) ||
        (filters.status === "draft" && !course.isPublished)
      const matchesFeatured = filters.featured === "all" ||
        (filters.featured === "featured" && course.isFeatured) ||
        (filters.featured === "not-featured" && !course.isFeatured)

      // Date range filtering
      if (filters.dateRange?.from) {
        const courseDate = new Date(course.createdAt)
        if (courseDate < filters.dateRange.from) return false
      }
      if (filters.dateRange?.to) {
        const courseDate = new Date(course.createdAt)
        if (courseDate > filters.dateRange.to) return false
      }

      return matchesSearch && matchesLevel && matchesStatus && matchesFeatured
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "level":
          aValue = a.level
          bValue = b.level
          break
        case "enrollments":
          aValue = a.enrollmentCount || 0
          bValue = b.enrollmentCount || 0
          break
        case "rating":
          aValue = a.averageRating || 0
          bValue = b.averageRating || 0
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })

    console.log('🎯 Filtered courses:', filtered)
    console.log('🎯 Filtered courses length:', filtered.length)

    return filtered
  }, [courses, filters])

  // Toggle course selection
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )
  }

  // Toggle all courses selection
  const toggleAllCourses = () => {
    if (selectedCourses.length === filteredAndSortedCourses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(filteredAndSortedCourses.map((course) => course.id))
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (actionId: string, selectedItems: string[]) => {
    try {
      switch (actionId) {
        case "publish":
          await coursesService.bulkUpdateCourseStatus(selectedItems, true)
          toast.success(`Published ${selectedItems.length} courses`)
          break
        case "unpublish":
          await coursesService.bulkUpdateCourseStatus(selectedItems, false)
          toast.success(`Unpublished ${selectedItems.length} courses`)
          break
        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedItems.length} courses? This action cannot be undone.`)) {
            await coursesService.bulkDeleteCourses(selectedItems)
            toast.success(`Deleted ${selectedItems.length} courses`)
          } else {
            return // Don't refresh if user cancelled
          }
          break
        default:
          throw new Error(`Unknown action: ${actionId}`)
      }

      // Refresh courses list
      const updatedCourses = await coursesService.getAllCourses()
      setCourses(Array.isArray(updatedCourses) ? updatedCourses : [])
      setSelectedCourses([])
    } catch (error) {
      console.error('Bulk action failed:', error)
      toast.error('Failed to perform bulk action. Please try again.')
    }
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }

  // Filter options for advanced filters
  const filterOptions: FilterOption[] = [
    {
      id: "level",
      label: "Level",
      type: "select",
      options: [
        { value: "Beginner", label: "Beginner" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Advanced", label: "Advanced" }
      ]
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" }
      ]
    },
    {
      id: "featured",
      label: "Featured",
      type: "select",
      options: [
        { value: "featured", label: "Featured" },
        { value: "not-featured", label: "Not Featured" }
      ]
    }
  ]

  const sortOptions = [
    { value: "title", label: "Title" },
    { value: "level", label: "Level" },
    { value: "enrollments", label: "Enrollments" },
    { value: "rating", label: "Rating" },
    { value: "createdAt", label: "Created Date" }
  ]

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Courses" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
              <p className="text-muted-foreground">
                Manage training courses and lessons for your customers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement export functionality
                  toast.info("Export functionality coming soon")
                }}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/courses/new')}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : Array.isArray(courses) ? courses.length : 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0).toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : Array.isArray(courses) && courses.length > 0 ? `${Math.round(courses.reduce((sum, course) => sum + (course.completionRate || 0), 0) / courses.length)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +7% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : Array.isArray(courses) && courses.length > 0 ? (courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length).toFixed(1) : '0.0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.ratingCount || 0), 0) : 0} reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
            searchPlaceholder="Search courses by title or description..."
            sortOptions={sortOptions}
            onReset={() => setFilters({
              search: "",
              sortBy: "title",
              sortOrder: "asc",
              level: "all",
              status: "all",
              featured: "all"
            })}
          />

          {/* Table with bulk operations */}
          <div className="rounded-md border">
            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar
              selectedItems={selectedCourses}
              totalItems={filteredAndSortedCourses.length}
              onClearSelection={() => setSelectedCourses([])}
              onSelectAll={toggleAllCourses}
              actions={CourseBulkActions}
              onAction={handleBulkAction}
              resourceType=" courses"
            />

            {/* Error message */}
            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Table */}
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredAndSortedCourses.length > 0 &&
                          selectedCourses.length === filteredAndSortedCourses.length
                        }
                        onCheckedChange={toggleAllCourses}
                        aria-label="Select all courses"
                      />
                    </TableHead>
                    {visibleColumns.image && <TableHead>Image</TableHead>}
                    {visibleColumns.title && <TableHead>Title</TableHead>}
                    {visibleColumns.courseType && <TableHead>Type</TableHead>}
                    {visibleColumns.level && <TableHead>Level</TableHead>}
                    {visibleColumns.totalDays && <TableHead className="text-center">Days</TableHead>}
                    {visibleColumns.totalLessons && <TableHead className="text-center">Lessons</TableHead>}
                    {visibleColumns.enrollments && <TableHead className="text-right">Enrollments</TableHead>}
                    {visibleColumns.rating && <TableHead className="text-center">Rating</TableHead>}
                    {visibleColumns.status && <TableHead>Status</TableHead>}
                    {visibleColumns.featured && <TableHead>Featured</TableHead>}
                    {visibleColumns.createdAt && <TableHead>Created</TableHead>}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        <div className="flex justify-center items-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span className="ml-3">Loading courses...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedCourses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        No courses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={() => toggleCourseSelection(course.id)}
                            aria-label={`Select ${course.title}`}
                          />
                        </TableCell>
                        {visibleColumns.image && (
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {course.imageUrl ? (
                                <img
                                  src={course.imageUrl}
                                  alt={`${course.title} cover`}
                                  className="w-10 h-10 rounded-md object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center ${course.imageUrl ? 'hidden' : 'flex'}`}
                              >
                                <IconMicrophone className="w-5 h-5 text-muted-foreground" />
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.title && (
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconMicrophone className="mr-2 h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{course.title}</div>
                                {course.subtitle && (
                                  <div className="text-sm text-muted-foreground">{course.subtitle}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.courseType && (
                          <TableCell>
                            <Badge variant="secondary">
                              {course.courseType || 'Vocal'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.level && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                course.level === "Beginner"
                                  ? "border-green-500 text-green-500"
                                  : course.level === "Intermediate"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-red-500 text-red-500"
                              }
                            >
                              {course.level}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.totalDays && (
                          <TableCell className="text-center">{course.totalDays}</TableCell>
                        )}
                        {visibleColumns.totalLessons && (
                          <TableCell className="text-center">{course.totalLessons}</TableCell>
                        )}
                        {visibleColumns.enrollments && (
                          <TableCell className="text-right">{(course.enrollmentCount || 0).toLocaleString()}</TableCell>
                        )}
                        {visibleColumns.rating && (
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <IconStar className="h-4 w-4 text-yellow-500" />
                              <span>{course.averageRating ? course.averageRating.toFixed(1) : '-'}</span>
                              {course.ratingCount > 0 && (
                                <span className="text-xs text-muted-foreground">({course.ratingCount})</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                course.isPublished
                                  ? "border-green-500 text-green-500"
                                  : "border-yellow-500 text-yellow-500"
                              }
                            >
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    course.isPublished ? "bg-green-500" : "bg-yellow-500"
                                  }`}
                                />
                                {course.isPublished ? "Published" : "Draft"}
                              </div>
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.featured && (
                          <TableCell>
                            {course.isFeatured && (
                              <Badge variant="secondary">
                                <IconStar className="mr-1 h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>{formatDate(course.createdAt)}</TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/courses/${course.id}/edit`)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/courses/${course.id}`)}>
                                <IconEye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/courses/${course.id}/lessons`)}>
                                <IconUsers className="mr-2 h-4 w-4" />
                                Manage Lessons
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>
                                <IconCopy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuCheckboxItem>
                              <Separator />
                              <DropdownMenuCheckboxItem onClick={() => {
                                if (confirm('Are you sure you want to delete this course?')) {
                                  coursesService.deleteCourse(course.id)
                                    .then(() => {
                                      setCourses(courses.filter(c => c.id !== course.id))
                                      toast.success('Course deleted successfully')
                                    })
                                    .catch((err: any) => {
                                      console.error('Failed to delete course:', err)
                                      toast.error('Failed to delete course. Please try again.')
                                    })
                                }
                              }}>
                                <IconTrash className="mr-2 h-4 w-4 text-destructive" />
                                Delete
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-sm text-muted-foreground">
                Showing <strong>1</strong> to <strong>{filteredAndSortedCourses.length}</strong> of{" "}
                <strong>{filteredAndSortedCourses.length}</strong> courses
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
