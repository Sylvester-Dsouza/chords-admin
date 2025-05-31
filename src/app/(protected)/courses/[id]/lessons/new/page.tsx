'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { IconArrowLeft } from '@tabler/icons-react'
import coursesService, { CreateLessonDto } from '@/services/courses.service'
import { LessonForm } from '@/components/courses/lesson-form'

export default function NewLessonPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [loading, setLoading] = React.useState(false)
  const [course, setCourse] = React.useState<any>(null)
  const [nextDayNumber, setNextDayNumber] = React.useState<number>(1)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch course details and existing lessons
  React.useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course with lessons to get existing day numbers
        const courseData = await coursesService.getCourseById(courseId, true)
        setCourse(courseData)

        // Calculate next available day number
        if (courseData.lessons && courseData.lessons.length > 0) {
          const existingDayNumbers = courseData.lessons.map(lesson => lesson.dayNumber)
          const maxDayNumber = Math.max(...existingDayNumbers)
          setNextDayNumber(maxDayNumber + 1)
        } else {
          setNextDayNumber(1)
        }
      } catch (err) {
        console.error('Failed to fetch course:', err)
        setError('Failed to load course details.')
      }
    }

    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true)
      // Add courseId to form data to create CreateLessonDto
      const lessonData: CreateLessonDto = {
        ...formData,
        courseId
      }
      await coursesService.createLesson(lessonData)
      toast.success('Lesson created successfully!')
      router.push(`/courses/${courseId}`)
    } catch (error: any) {
      console.error('Error creating lesson:', error)

      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Access denied. Please check your permissions.')
        } else if (error.response.status === 401) {
          toast.error('Authentication required. Please log in again.')
        } else {
          toast.error(`Failed to create lesson: ${error.response.data?.message || error.message}`)
        }
      } else {
        toast.error('Failed to create lesson. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="New Lesson" />
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!course) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="New Lesson" />
          <div className="flex justify-center items-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading course details...</span>
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
        <SiteHeader title={`New Lesson - ${course.title}`} />
        <div className="space-y-6 p-6">
          {/* Header */}
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
              <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
              <p className="text-muted-foreground">
                Add a new lesson to "{course.title}"
              </p>
            </div>
          </div>

          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm font-medium">Course Title</p>
                  <p className="text-sm text-muted-foreground">{course.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-sm text-muted-foreground">{course.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Days</p>
                  <p className="text-sm text-muted-foreground">{course.totalDays} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Suggested Day Number</p>
                  <p className="text-sm text-muted-foreground">Day {nextDayNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Form */}
          <LessonForm
            mode="create"
            courseId={courseId}
            initialData={{ dayNumber: nextDayNumber }}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
