'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IconEdit,
  IconUsers,
  IconEye,
  IconEyeOff,
  IconMicrophone,
  IconClock,
  IconCalendar,
  IconStar,
  IconTrendingUp,
  IconBook,
  IconMusic
} from "@tabler/icons-react"

import { Course, LessonSummary } from "@/services/courses.service"

interface CourseDashboardProps {
  course: Course
  lessons: LessonSummary[]
  onTogglePublished: () => void
  onDelete: () => void
}

export function CourseDashboard({
  course,
  lessons,
  onTogglePublished,
  onDelete: _onDelete
}: CourseDashboardProps) {
  const router = useRouter()

  // Calculate course statistics
  const publishedLessons = lessons.filter(lesson => lesson.isPublished).length
  const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  const averageLessonDuration = lessons.length > 0 ? Math.round(totalDuration / lessons.length) : 0

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <IconMicrophone className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
                {course.isFeatured && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    <IconStar className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              {course.subtitle && (
                <p className="text-lg text-muted-foreground mb-2">{course.subtitle}</p>
              )}
              <p className="text-muted-foreground mb-4">{course.description}</p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <IconBook className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{course.totalDays} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconMusic className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{course.courseType || 'Vocal'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Est. Hours:</span>
                  <span className="font-medium">{course.estimatedHours}h</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push(`/courses/${course.id}/edit`)}
            >
              <div className="flex items-center gap-3">
                <IconEdit className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Edit Course</div>
                  <div className="text-sm text-muted-foreground">Update details</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push(`/courses/${course.id}/lessons`)}
            >
              <div className="flex items-center gap-3">
                <IconUsers className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Lessons</div>
                  <div className="text-sm text-muted-foreground">{lessons.length} lessons</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={onTogglePublished}
            >
              <div className="flex items-center gap-3">
                {course.isPublished ? (
                  <IconEyeOff className="h-5 w-5" />
                ) : (
                  <IconEye className="h-5 w-5" />
                )}
                <div className="text-left">
                  <div className="font-medium">
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {course.isPublished ? 'Make private' : 'Make public'}
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => {
                // TODO: Implement analytics view
                router.push(`/courses/${course.id}/analytics`)
              }}
            >
              <div className="flex items-center gap-3">
                <IconTrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Performance data</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <IconBook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedLessons} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalDuration / 60)}h {totalDuration % 60}m</div>
            <p className="text-xs text-muted-foreground">
              ~{averageLessonDuration} min per lesson
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.enrollmentCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {course.completionRate || 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <IconStar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.averageRating ? course.averageRating.toFixed(1) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {course.ratingCount || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lessons Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Lessons</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/courses/${course.id}/lessons`)}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-8">
              <IconMicrophone className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No lessons created yet</p>
              <Button
                className="mt-4"
                onClick={() => router.push(`/courses/${course.id}/lessons/new`)}
              >
                Create First Lesson
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons
                .sort((a, b) => b.dayNumber - a.dayNumber)
                .slice(0, 5)
                .map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/courses/${course.id}/lessons/${lesson.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {lesson.dayNumber}
                      </div>
                      <div>
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {lesson.duration} min • {lesson.practiceSongTitle || 'No practice song'}
                        </div>
                      </div>
                    </div>
                    <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                      {lesson.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
