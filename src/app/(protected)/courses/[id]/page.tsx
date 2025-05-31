"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import coursesService, { Course, LessonSummary } from "@/services/courses.service"
import { CourseDashboard } from "@/components/courses/course-dashboard"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = React.useState<Course | null>(null)
  const [lessons, setLessons] = React.useState<LessonSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch course details
  React.useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)

        // Fetch course with lessons
        const courseData = await coursesService.getCourseById(courseId, true)
        setCourse(courseData)
        setLessons(courseData.lessons || [])

        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch course data:', err)

        // More detailed error logging
        if (err.response) {
          console.error('Response status:', err.response.status)
          console.error('Response data:', err.response.data)
          console.error('Response headers:', err.response.headers)

          if (err.response.status === 404) {
            setError('Course not found. It may have been deleted or the ID is incorrect.')
          } else if (err.response.status === 403) {
            setError('Access denied. Please check your permissions or try logging in again.')
          } else if (err.response.status === 401) {
            setError('Authentication required. Please log in again.')
          } else {
            setError(`Failed to load course details: ${err.response.data?.message || err.message}`)
          }
        } else if (err.request) {
          console.error('Request made but no response received:', err.request)
          setError('Network error. Please check your connection and try again.')
        } else {
          console.error('Error setting up request:', err.message)
          setError(`Failed to load course details: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const handleDeleteCourse = async () => {
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

  const handleTogglePublished = async () => {
    if (!course) return

    try {
      const updatedCourse = await coursesService.updateCourse(course.id, {
        isPublished: !course.isPublished
      })
      setCourse(updatedCourse)
      toast.success(`Course ${updatedCourse.isPublished ? 'published' : 'unpublished'} successfully`)
    } catch (error) {
      console.error('Failed to update course status:', error)
      toast.error('Failed to update course status. Please try again.')
    }
  }



  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Course Details" />
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
          <SiteHeader title="Course Details" />
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
        <SiteHeader title={course.title} />
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
                <h1 className="text-3xl font-bold tracking-tight">Course Details</h1>
                <p className="text-muted-foreground">
                  Manage course information and lessons
                </p>
              </div>
            </div>
          </div>

          {/* Course Dashboard */}
          <CourseDashboard
            course={course}
            lessons={lessons}
            onTogglePublished={handleTogglePublished}
            onDelete={handleDeleteCourse}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
