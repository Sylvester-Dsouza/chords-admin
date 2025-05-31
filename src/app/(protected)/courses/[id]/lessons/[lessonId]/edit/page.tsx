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
import { IconArrowLeft, IconTrash, IconEye } from '@tabler/icons-react'
import coursesService, { Lesson, UpdateLessonDto } from '@/services/courses.service'
import { LessonForm } from '@/components/courses/lesson-form'

export default function EditLessonPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [lesson, setLesson] = React.useState<Lesson | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch lesson details
  React.useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true)
        const lessonData = await coursesService.getLessonById(lessonId)
        setLesson(lessonData)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch lesson:', err)

        if (err.response?.status === 404) {
          setError('Lesson not found. It may have been deleted.')
        } else {
          setError('Failed to load lesson details.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  const handleSubmit = async (formData: any) => {
    try {
      setSaving(true)
      // Convert form data to UpdateLessonDto
      const lessonData: UpdateLessonDto = formData
      const updatedLesson = await coursesService.updateLesson(lessonId, lessonData)
      setLesson(updatedLesson)
      toast.success('Lesson updated successfully!')
    } catch (error: any) {
      console.error('Error updating lesson:', error)

      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Access denied. Please check your permissions.')
        } else if (error.response.status === 401) {
          toast.error('Authentication required. Please log in again.')
        } else {
          toast.error(`Failed to update lesson: ${error.response.data?.message || error.message}`)
        }
      } else {
        toast.error('Failed to update lesson. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublished = async () => {
    if (!lesson) return

    try {
      setSaving(true)
      const updatedLesson = await coursesService.updateLesson(lessonId, {
        isPublished: !lesson.isPublished
      })
      setLesson(updatedLesson)
      toast.success(`Lesson ${updatedLesson.isPublished ? 'published' : 'unpublished'} successfully`)
    } catch (error) {
      console.error('Failed to update lesson status:', error)
      toast.error('Failed to update lesson status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!lesson) return

    if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
      try {
        await coursesService.deleteLesson(lessonId)
        toast.success('Lesson deleted successfully')
        router.push(`/courses/${courseId}`)
      } catch (error) {
        console.error('Failed to delete lesson:', error)
        toast.error('Failed to delete lesson. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Lesson" />
          <div className="flex justify-center items-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading lesson details...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !lesson) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Lesson" />
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Lesson not found'}</AlertDescription>
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
        <SiteHeader title={`Edit: ${lesson.title}`} />
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
                <h1 className="text-3xl font-bold tracking-tight">Edit Lesson</h1>
                <p className="text-muted-foreground">
                  Day {lesson.dayNumber} - {lesson.course?.title}
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
                onClick={() => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View Lesson
              </Button>
            </div>
          </div>

          {/* Course Info */}
          {lesson.course && (
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium">Course Title</p>
                    <p className="text-sm text-muted-foreground">{lesson.course.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Level</p>
                    <p className="text-sm text-muted-foreground">{lesson.course.level}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lesson Day</p>
                    <p className="text-sm text-muted-foreground">Day {lesson.dayNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lesson Form */}
          <LessonForm
            mode="edit"
            courseId={courseId}
            initialData={lesson}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            onTogglePublished={handleTogglePublished}
            loading={saving}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
