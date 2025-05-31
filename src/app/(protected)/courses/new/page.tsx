"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import coursesService, { CreateCourseDto } from "@/services/courses.service"
import { CourseForm, CourseFormValues } from "@/components/courses/course-form"

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setLoading(true)

      // Prepare the data for API
      const courseData: CreateCourseDto = {
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

      console.log("Creating course with data:", courseData)
      const newCourse = await coursesService.createCourse(courseData)

      toast.success("Course created successfully!")
      router.push(`/courses/${newCourse.id}`)
    } catch (error: any) {
      console.error("Error creating course:", error)

      // More detailed error logging
      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response data:", error.response.data)
        console.error("Response headers:", error.response.headers)

        if (error.response.status === 403) {
          toast.error("Access denied. Please check your permissions or try logging in again.")
        } else if (error.response.status === 401) {
          toast.error("Authentication required. Please log in again.")
        } else {
          toast.error(`Failed to create course: ${error.response.data?.message || error.message}`)
        }
      } else {
        toast.error("Failed to create course. Please try again.")
      }
    } finally {
      setLoading(false)
    }
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
        <SiteHeader title="Add New Course" />
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
                <h1 className="text-3xl font-bold tracking-tight">Add New Course</h1>
                <p className="text-muted-foreground">
                  Create a new training course for your customers
                </p>
              </div>
            </div>
          </div>

          {/* Use the reusable form component */}
          <CourseForm
            mode="create"
            onSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}