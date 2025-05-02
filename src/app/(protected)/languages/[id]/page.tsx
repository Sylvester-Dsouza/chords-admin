"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { IconAlertCircle } from "@tabler/icons-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { LanguageForm } from "@/components/languages/language-form"
import languageService, { Language } from "@/services/language.service"

export default function EditLanguagePage() {
  const params = useParams()
  const router = useRouter()
  const [language, setLanguage] = React.useState<Language | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchLanguage = async () => {
      try {
        setIsLoading(true)
        const id = params.id as string
        const data = await languageService.getLanguage(id)
        setLanguage(data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch language:', err)
        setError(`Failed to load language: ${err.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguage()
  }, [params.id])

  if (isLoading) {
    return <div className="p-6">Loading language...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!language) {
    return <div className="p-6">Language not found</div>
  }

  return <LanguageForm initialData={language} mode="edit" />
}
