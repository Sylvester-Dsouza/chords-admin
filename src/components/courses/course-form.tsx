"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  IconMicrophone,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconEdit
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Course } from "@/services/courses.service"

// Form validation schema
const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().max(300, "Subtitle must be less than 300 characters").optional().or(z.literal("")),
  description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a level",
  }),
  courseType: z.string().min(1, "Course type is required").max(50, "Course type must be less than 50 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  totalDays: z.number().min(1, "Must be at least 1 day").max(365, "Cannot exceed 365 days"),
  totalLessons: z.number().min(1, "Must be at least 1 lesson").max(1000, "Cannot exceed 1000 lessons"),
  estimatedHours: z.number().min(1, "Must be at least 1 hour").max(1000, "Cannot exceed 1000 hours"),
  price: z.number().min(0, "Price cannot be negative"),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

export interface CourseFormProps {
  mode: 'create' | 'edit' | 'view'
  initialData?: Course
  onSubmit?: (data: CourseFormValues) => Promise<void>
  onDelete?: () => Promise<void>
  onTogglePublished?: () => Promise<void>
  loading?: boolean
  className?: string
}

export function CourseForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
  onTogglePublished,
  loading = false,
  className
}: CourseFormProps) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const isReadOnly = mode === 'view'

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      description: initialData?.description || "",
      level: initialData?.level || "Beginner",
      courseType: initialData?.courseType || "",
      imageUrl: initialData?.imageUrl || "",
      totalDays: initialData?.totalDays || 30,
      totalLessons: initialData?.totalLessons || 30,
      estimatedHours: initialData?.estimatedHours || 15,
      price: initialData?.price || 0,
      isPublished: initialData?.isPublished || false,
      isFeatured: initialData?.isFeatured || false,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  })

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        subtitle: initialData.subtitle || "",
        description: initialData.description,
        level: initialData.level,
        courseType: initialData.courseType || "",
        imageUrl: initialData.imageUrl || "",
        totalDays: initialData.totalDays,
        totalLessons: initialData.totalLessons,
        estimatedHours: initialData.estimatedHours,
        price: initialData.price || 0,
        isPublished: initialData.isPublished,
        isFeatured: initialData.isFeatured,
        isActive: initialData.isActive,
      })

      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl)
      }
    }
  }, [initialData, form])

  // Watch imageUrl changes for preview
  const imageUrl = form.watch("imageUrl")
  React.useEffect(() => {
    if (imageUrl && imageUrl.trim() !== "") {
      setImagePreview(imageUrl)
    } else {
      setImagePreview(null)
    }
  }, [imageUrl])

  const handleSubmit = async (data: CourseFormValues) => {
    if (onSubmit && !isReadOnly) {
      await onSubmit(data)
    }
  }

  const onSaveAsDraft = async () => {
    if (!isReadOnly) {
      const currentData = form.getValues()
      currentData.isPublished = false
      await handleSubmit(currentData)
    }
  }

  const onPublish = async () => {
    if (!isReadOnly) {
      const currentData = form.getValues()
      currentData.isPublished = true
      await handleSubmit(currentData)
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
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return '-'
    }
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter course title..."
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter course subtitle..."
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional subtitle to provide additional context
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what students will learn in this course..."
                            className="min-h-[120px]"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the course content and objectives
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level *</FormLabel>
                        {isReadOnly ? (
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={
                                field.value === "Beginner"
                                  ? "border-green-500 text-green-500"
                                  : field.value === "Intermediate"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-red-500 text-red-500"
                              }
                            >
                              {field.value}
                            </Badge>
                          </div>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Type *</FormLabel>
                        {isReadOnly ? (
                          <div className="mt-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                              {field.value}
                            </Badge>
                          </div>
                        ) : (
                          <FormControl>
                            <Input
                              placeholder="e.g., Vocal, Guitar, Piano, Music Production"
                              {...field}
                            />
                          </FormControl>
                        )}
                        <FormDescription>
                          Enter the type of course (e.g., Vocal, Guitar, Piano, Music Production, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Course Structure */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="totalDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Days</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Course duration in days
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalLessons"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Lessons</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of lessons
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Hours</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Total study time
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          URL to the course cover image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Course preview"
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => setImagePreview(null)}
                        />
                      ) : (
                        <div className="text-center">
                          <IconMicrophone className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            No image selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Set to 0 for free courses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Published</FormLabel>
                          <FormDescription>
                            Make this course visible to customers
                          </FormDescription>
                        </div>
                        <FormControl>
                          {isReadOnly ? (
                            <Badge
                              variant="outline"
                              className={
                                field.value
                                  ? "border-green-500 text-green-500"
                                  : "border-yellow-500 text-yellow-500"
                              }
                            >
                              {field.value ? "Published" : "Draft"}
                            </Badge>
                          ) : (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Highlight this course on the homepage
                          </FormDescription>
                        </div>
                        <FormControl>
                          {isReadOnly ? (
                            field.value ? (
                              <Badge variant="secondary">Featured</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not Featured</span>
                            )
                          ) : (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Enable enrollment for this course
                          </FormDescription>
                        </div>
                        <FormControl>
                          {isReadOnly ? (
                            <Badge
                              variant="outline"
                              className={
                                field.value
                                  ? "border-green-500 text-green-500"
                                  : "border-red-500 text-red-500"
                              }
                            >
                              {field.value ? "Active" : "Inactive"}
                            </Badge>
                          ) : (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Course Details (View Mode Only) */}
              {isReadOnly && initialData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Created</span>
                      <p className="font-medium">{formatDate(initialData.createdAt)}</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <p className="font-medium">{formatDate(initialData.updatedAt)}</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Views</span>
                      <p className="font-medium">{initialData.viewCount.toLocaleString()}</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Enrollments</span>
                      <p className="font-medium">{initialData.enrollmentCount.toLocaleString()}</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <p className="font-medium">{initialData.completionRate}%</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <p className="font-medium">
                        {initialData.averageRating ? initialData.averageRating.toFixed(1) : '-'}
                        {initialData.ratingCount > 0 && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({initialData.ratingCount} reviews)
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Form Actions */}
          {!isReadOnly && (
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>

              {mode === 'create' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSaveAsDraft}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconDeviceFloppy className="mr-2 h-4 w-4" />
                        Save as Draft
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={onPublish}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <IconEye className="mr-2 h-4 w-4" />
                        Publish Course
                      </>
                    )}
                  </Button>
                </>
              )}

              {mode === 'edit' && (
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* View Mode Actions */}
          {isReadOnly && (
            <div className="flex justify-end gap-4 pt-6 border-t">
              {onTogglePublished && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onTogglePublished}
                  disabled={loading}
                >
                  {initialData?.isPublished ? (
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
              )}

              <Button
                type="button"
                variant="outline"
                disabled={loading}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Course
              </Button>

              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={loading}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}