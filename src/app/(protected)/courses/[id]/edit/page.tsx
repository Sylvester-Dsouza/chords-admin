"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconEye,
  IconTrash,
  IconStar
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import coursesService, { Course, UpdateCourseDto } from "@/services/courses.service"
import { CourseForm, CourseFormValues } from "@/components/courses/course-form"

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch course data
  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const courseData = await coursesService.getCourseById(courseId)
        setCourse(courseData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch course:', err)
        setError('Failed to load course details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const onSubmit = async (data: CourseFormValues) => {
    if (!course) return

    try {
      setSaving(true)

      // Prepare the data for API
      const updateData: UpdateCourseDto = {
        title: data.title,
        subtitle: data.subtitle || undefined,
        description: data.description,
        level: data.level,
        courseType: data.courseType,
        imageUrl: data.imageUrl || undefined,
        totalDays: data.totalDays,
        totalLessons: data.totalLessons,
        estimatedHours: data.estimatedHours,
        price: data.price,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      }

      const updatedCourse = await coursesService.updateCourse(course.id, updateData)
      setCourse(updatedCourse)

      toast.success("Course updated successfully!")
      router.push(`/courses/${updatedCourse.id}`)
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!course) return

    if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      try {
        await coursesService.deleteCourse(course.id)
        toast.success('Course deleted successfully')
        router.push('/courses')
      } catch (error) {
        console.error('Failed to delete course:', error)
        toast.error('Failed to delete course. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Course" />
          <div className="flex justify-center items-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading course details...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !course) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Course" />
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Course not found'}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
        <SiteHeader title={`Edit: ${course.title}`} />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                <p className="text-muted-foreground">
                  Update course information and settings
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View Course
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.viewCount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.enrollmentCount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.completionRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {course.averageRating ? course.averageRating.toFixed(1) : '-'}
                  </div>
                  <IconStar className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {course.price ? `₹${course.price}` : 'Free'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use the reusable form component */}
          <CourseForm
            mode="edit"
            initialData={course}
            onSubmit={onSubmit}
            onDelete={handleDelete}
            loading={saving}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
