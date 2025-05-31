'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconClock,
  IconMicrophone,
  IconMusic,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react'
import coursesService, { Lesson } from '@/services/courses.service'

export default function LessonViewPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string
  const [loading, setLoading] = React.useState(true)
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

  const handleTogglePublished = async () => {
    if (!lesson) return

    try {
      const updatedLesson = await coursesService.updateLesson(lessonId, {
        isPublished: !lesson.isPublished
      })
      setLesson(updatedLesson)
      toast.success(`Lesson ${updatedLesson.isPublished ? 'published' : 'unpublished'} successfully`)
    } catch (error) {
      console.error('Failed to update lesson status:', error)
      toast.error('Failed to update lesson status. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!lesson) return

    if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
      try {
        await coursesService.deleteLesson(lessonId)
        toast.success('Lesson deleted successfully')
        router.push(`/courses/${courseId}/lessons`)
      } catch (error) {
        console.error('Failed to delete lesson:', error)
        toast.error('Failed to delete lesson. Please try again.')
      }
    }
  }

  const formatDate = (date: Date | string) => {
    if (!date) return '-'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return '-'
    }
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Lesson Details" />
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
          <SiteHeader title="Lesson Details" />
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
        <SiteHeader title={lesson.title} />
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
                <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
                <p className="text-muted-foreground">
                  Day {lesson.dayNumber} - {lesson.course?.title}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePublished}
              >
                {lesson.isPublished ? (
                  <>
                    <IconEyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <IconEye className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}/lessons/${lessonId}/edit`)}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Lesson Overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lesson Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Lesson Details</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={
                          lesson.isPublished
                            ? "border-green-500 text-green-500"
                            : "border-yellow-500 text-yellow-500"
                        }
                      >
                        {lesson.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {lesson.isActive && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{lesson.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {lesson.instructions || 'No instructions provided'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Media Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Media Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lesson.videoUrl ? (
                    <div>
                      <h4 className="font-medium mb-2">Video</h4>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Video: {lesson.videoUrl}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IconMicrophone className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No video content</p>
                    </div>
                  )}

                  {lesson.audioUrl && (
                    <div>
                      <h4 className="font-medium mb-2">Audio</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Audio: {lesson.audioUrl}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Day Number</span>
                    <span className="font-medium">Day {lesson.dayNumber}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <div className="flex items-center gap-1">
                      <IconClock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{lesson.duration} min</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sort Order</span>
                    <span className="font-medium">{lesson.sortOrder}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium text-xs">{formatDate(lesson.createdAt)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Updated</span>
                    <span className="font-medium text-xs">{formatDate(lesson.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Practice Song */}
              <Card>
                <CardHeader>
                  <CardTitle>Practice Song</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.practiceSongTitle ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconMusic className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{lesson.practiceSongTitle}</span>
                      </div>
                      {lesson.practiceSong && (
                        <div className="text-sm text-muted-foreground">
                          <p>Artist: {lesson.practiceSong.artist}</p>
                          {lesson.practiceSong.key && <p>Key: {lesson.practiceSong.key}</p>}
                          {lesson.practiceSong.tempo && <p>Tempo: {lesson.practiceSong.tempo} BPM</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <IconMusic className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No practice song assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
