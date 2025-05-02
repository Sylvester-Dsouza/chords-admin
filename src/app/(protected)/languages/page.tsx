"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconPencil,
  IconBrandChrome,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import languageService, { Language } from "@/services/language.service"

export default function LanguagesPage() {
  const router = useRouter()
  const [languages, setLanguages] = React.useState<Language[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [languageToDelete, setLanguageToDelete] = React.useState<Language | null>(null)

  // Fetch languages
  React.useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true)
        const data = await languageService.getAllLanguages()
        setLanguages(data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch languages:', err)
        setError(`Failed to load languages: ${err.message || 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  // Filter languages based on search query
  const filteredLanguages = React.useMemo(() => {
    return languages.filter(language =>
      language.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [languages, searchQuery])

  // Handle language deletion
  const handleDelete = async () => {
    if (!languageToDelete) return

    try {
      await languageService.deleteLanguage(languageToDelete.id)
      setLanguages(languages.filter(language => language.id !== languageToDelete.id))
      toast.success("Language deleted successfully", {
        description: `${languageToDelete.name} has been removed.`,
        icon: <IconCheck className="h-4 w-4" />,
      })
    } catch (err: any) {
      console.error('Failed to delete language:', err)
      toast.error("Failed to delete language", {
        description: err.message || 'An error occurred while deleting the language.',
        icon: <IconX className="h-4 w-4" />,
      })
    } finally {
      setLanguageToDelete(null)
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
        <SiteHeader title="Languages" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Languages</h1>
              <p className="text-muted-foreground">
                Manage languages for songs
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/languages/new")}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add Language
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table with filters */}
          <div className="rounded-md border">
            {/* Table filters */}
            <div className="border-b p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-[300px]"
                  />
                  <Button variant="outline" size="sm" className="h-9">
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative w-full overflow-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-3">Loading languages...</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <IconAlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => {}}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLanguages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          {searchQuery ? 'No languages match your search' : 'No languages found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLanguages.map((language) => (
                        <TableRow key={language.id}>
                          <TableCell>
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => {}}
                              aria-label={`Select ${language.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconBrandChrome className="mr-2 h-4 w-4 text-muted-foreground" />
                              {language.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={language.isActive ? "default" : "secondary"} className={language.isActive ? "bg-green-500" : ""}>
                              {language.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(language.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/languages/${language.id}`)}
                              >
                                <IconPencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLanguageToDelete(language)}
                              >
                                <IconTrash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!languageToDelete} onOpenChange={(open) => !open && setLanguageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the language &quot;{languageToDelete?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
