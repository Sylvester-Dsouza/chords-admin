'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconClock,
  IconMicrophone,
  IconEye
} from '@tabler/icons-react'
import coursesService, { Course, Lesson } from '@/services/courses.service'

export default function LessonsPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [loading, setLoading] = React.useState(true)
  const [course, setCourse] = React.useState<any>(null)
  const [lessons, setLessons] = React.useState<Lesson[]>([])
  const [error, setError] = React.useState<string | null>(null)

  // Fetch course and lessons
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch course details
        const courseData = await coursesService.getCourseById(courseId)
        setCourse(courseData)

        // Fetch lessons for this course
        const lessonsData = await coursesService.getLessonsByCourse(courseId)
        setLessons(lessonsData)

        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load course and lessons data.')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchData()
    }
  }, [courseId])

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (confirm(`Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`)) {
      try {
        await coursesService.deleteLesson(lessonId)
        toast.success('Lesson deleted successfully')

        // Refresh lessons list
        const updatedLessons = await coursesService.getLessonsByCourse(courseId)
        setLessons(updatedLessons)
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
          <SiteHeader title="Manage Lessons" />
          <div className="flex justify-center items-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading lessons...</span>
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
          <SiteHeader title="Manage Lessons" />
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
        <SiteHeader title={`Lessons - ${course.title}`} />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Lesson Management</h1>
                <p className="text-muted-foreground">
                  {course.title} • {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/courses/${courseId}/lessons/new`)}
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Add New Lesson
            </Button>
          </div>

          {/* Course Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                      <IconMicrophone className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{course.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Days:</span>
                      <span className="ml-2 font-medium">{course.totalDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lessons:</span>
                      <span className="ml-2 font-medium">{lessons.length}/{course.totalLessons}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Level:</span>
                      <span className="ml-2 font-medium">{course.level}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{course.courseType || 'Vocal'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Lessons Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Course Lessons</CardTitle>
                <Badge variant="outline">
                  {lessons.length} / {course.totalLessons} lessons
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <IconMicrophone className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No lessons created yet</p>
                  <p className="text-muted-foreground">
                    Start building your course by adding the first lesson
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push(`/courses/${courseId}/lessons/new`)}
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create First Lesson
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Practice Song</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">
                            Day {lesson.dayNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {lesson.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IconClock className="h-4 w-4 text-muted-foreground" />
                              {lesson.duration} min
                            </div>
                          </TableCell>
                          <TableCell>
                            {lesson.practiceSongTitle || '-'}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
                                title="View lesson"
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/courses/${courseId}/lessons/${lesson.id}/edit`)}
                                title="Edit lesson"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                title="Delete lesson"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
