"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  IconDeviceFloppy,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconMusic,
  IconVideo,
  IconHeadphones,
  IconClock,
  IconCalendar,
  IconFileText
} from "@tabler/icons-react"



// Validation schema for lesson form
const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  dayNumber: z.number().min(1, "Day number must be at least 1").max(365, "Day number must be less than 365"),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(480, "Duration must be less than 8 hours"),
  practiceSongId: z.string().optional(),
  practiceSongTitle: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  audioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPublished: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0),
})

export type LessonFormValues = z.infer<typeof lessonFormSchema>

export interface LessonFormProps {
  mode: 'create' | 'edit' | 'view'
  courseId: string
  initialData?: Partial<LessonFormValues & { id: string }>
  onSubmit?: (data: LessonFormValues) => Promise<void>
  onDelete?: () => Promise<void>
  onTogglePublished?: () => Promise<void>
  loading?: boolean
  className?: string
}

export function LessonForm({
  mode,
  courseId: _courseId,
  initialData,
  onSubmit,
  onDelete,
  onTogglePublished,
  loading = false,
  className
}: LessonFormProps) {
  const isReadOnly = mode === 'view'

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      dayNumber: initialData?.dayNumber || 1,
      duration: initialData?.duration || 30,
      practiceSongId: initialData?.practiceSongId || "",
      practiceSongTitle: initialData?.practiceSongTitle || "",
      instructions: initialData?.instructions || "",
      videoUrl: initialData?.videoUrl || "",
      audioUrl: initialData?.audioUrl || "",
      isPublished: initialData?.isPublished || false,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
      sortOrder: initialData?.sortOrder || 0,
    },
  })

  const handleSubmit = async (values: LessonFormValues) => {
    if (!onSubmit) return

    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedValues = {
        ...values,
        practiceSongId: values.practiceSongId?.trim() || undefined,
        practiceSongTitle: values.practiceSongTitle?.trim() || undefined,
        videoUrl: values.videoUrl?.trim() || undefined,
        audioUrl: values.audioUrl?.trim() || undefined,
      }

      // Pass the cleaned form values to the parent component
      // The parent will handle adding courseId for create mode
      await onSubmit(cleanedValues)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to save lesson. Please try again.')
    }
  }

  const handleTogglePublished = async () => {
    if (!onTogglePublished) return
    try {
      await onTogglePublished()
    } catch (error) {
      console.error('Toggle published error:', error)
      toast.error('Failed to update lesson status. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    if (confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      try {
        await onDelete()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete lesson. Please try again.')
      }
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
                  <CardTitle className="flex items-center gap-2">
                    <IconFileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter lesson title..."
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter lesson description..."
                            className="min-h-[100px]"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description of what students will learn in this lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dayNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconCalendar className="h-4 w-4" />
                            Day Number *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Which day of the course this lesson belongs to
                            {mode === 'create' && initialData?.dayNumber && (
                              <span className="block text-primary font-medium mt-1">
                                Suggested: Day {initialData.dayNumber}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconClock className="h-4 w-4" />
                            Duration (minutes) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="480"
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated time to complete this lesson
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Practice Song */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconMusic className="h-5 w-5" />
                    Practice Song
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="practiceSongTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Practice Song Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter practice song title..."
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Song that students will practice during this lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Lesson Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter detailed lesson instructions..."
                            className="min-h-[200px]"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed step-by-step instructions for the lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconVideo className="h-4 w-4" />
                            Video URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://..."
                              {...field}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional video lesson URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="audioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconHeadphones className="h-4 w-4" />
                            Audio URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://..."
                              {...field}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional audio guide URL
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
              {/* Lesson Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Published</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={form.watch('isPublished') ? 'default' : 'secondary'}
                      >
                        {form.watch('isPublished') ? 'Published' : 'Draft'}
                      </Badge>
                      {!isReadOnly && (
                        <FormField
                          control={form.control}
                          name="isPublished"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={form.watch('isActive') ? 'default' : 'destructive'}
                      >
                        {form.watch('isActive') ? 'Active' : 'Inactive'}
                      </Badge>
                      {!isReadOnly && (
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Order for displaying lessons (0 = first)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              {!isReadOnly && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                      {loading ? 'Saving...' : mode === 'create' ? 'Create Lesson' : 'Update Lesson'}
                    </Button>

                    {mode === 'edit' && onTogglePublished && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleTogglePublished}
                        disabled={loading}
                      >
                        {form.watch('isPublished') ? (
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

                    {mode === 'edit' && onDelete && (
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        onClick={handleDelete}
                        disabled={loading}
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Delete Lesson
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Lesson Preview */}
              {mode === 'view' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Day</span>
                      <span className="font-medium">Day {form.watch('dayNumber')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{form.watch('duration')} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={form.watch('isPublished') ? 'default' : 'secondary'}
                      >
                        {form.watch('isPublished') ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    {form.watch('practiceSongTitle') && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Practice Song</span>
                        <span className="font-medium text-right max-w-[120px] truncate">
                          {form.watch('practiceSongTitle')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
