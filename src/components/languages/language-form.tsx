"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconCheck, IconDeviceFloppy } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import languageService, { Language, CreateLanguageDto, UpdateLanguageDto } from "@/services/language.service"

interface LanguageFormProps {
  initialData?: Language
  mode: 'create' | 'edit'
}

export function LanguageForm({ initialData, mode }: LanguageFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const title = mode === 'create' ? 'Create Language' : 'Edit Language'

  const [formState, setFormState] = React.useState({
    name: initialData?.name || "",
    isActive: initialData?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formState.name) {
        throw new Error("Name is required")
      }

      let result: Language

      if (mode === 'create') {
        // Create new language
        result = await languageService.createLanguage(formState as CreateLanguageDto)
        console.log('Language created successfully:', result)
        toast.success("Language created successfully", {
          description: `${formState.name} has been added.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      } else {
        // Update existing language
        if (!initialData?.id) {
          throw new Error("Language ID is missing for update")
        }
        result = await languageService.updateLanguage(initialData.id, formState as UpdateLanguageDto)
        console.log('Language updated successfully:', result)
        toast.success("Language updated successfully", {
          description: `${initialData.name} has been updated.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      }

      // Redirect to languages list
      router.push("/languages")
    } catch (err: any) {
      console.error(`Failed to ${mode} language:`, err)
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)

        // Handle array of error messages
        let errorMessage = err.response.data?.message;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(', ');
        }

        setError(`Failed to ${mode} language: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} language: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} language: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/languages")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Languages
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Language"}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Language Information</CardTitle>
                <CardDescription>
                  Basic information about the language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Enter language name"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Active</label>
                    <Switch
                      checked={formState.isActive}
                      onCheckedChange={(checked) => setFormState({...formState, isActive: checked})}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inactive languages won't appear in the app
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Language"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
