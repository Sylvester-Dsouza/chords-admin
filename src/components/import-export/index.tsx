"use client"

import { useState } from "react"
import { IconDownload, IconUpload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ImportExportButtonsProps {
  resourceType: string
  onImportSuccess?: () => void
}

export function ImportExportButtons({ resourceType, onImportSuccess }: ImportExportButtonsProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Handle file import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      // Call API to import data
      const response = await fetch(`/api/${resourceType}/import`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to import ${resourceType}`)
      }

      const result = await response.json()

      toast.success(`Import successful`, {
        description: `Imported ${result.imported} ${resourceType}. ${result.errors?.length || 0} errors.`,
      })

      // Call success callback if provided
      if (onImportSuccess) {
        onImportSuccess()
      }
    } catch (error) {
      console.error(`Error importing ${resourceType}:`, error)
      toast.error("Import failed", {
        description: `Failed to import ${resourceType}. Please try again.`,
      })
    } finally {
      setIsImporting(false)
      // Reset the file input
      event.target.value = ''
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Call API to export data
      const response = await fetch(`/api/${resourceType}/export`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Failed to export ${resourceType}`)
      }

      // Get the CSV data
      const csvData = await response.text()

      // Create a blob and download link
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resourceType}-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Export successful", {
        description: `${resourceType} exported successfully.`,
      })
    } catch (error) {
      console.error(`Error exporting ${resourceType}:`, error)
      toast.error("Export failed", {
        description: `Failed to export ${resourceType}. Please try again.`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      {/* Import Button - Using shadcn UI Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById(`import-${resourceType}`)?.click()}
        disabled={isImporting}
      >
        <IconUpload className="mr-2 h-4 w-4" />
        {isImporting ? "Importing..." : "Import"}
      </Button>
      <input
        id={`import-${resourceType}`}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />

      {/* Export Button - Using shadcn UI Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
      >
        <IconDownload className="mr-2 h-4 w-4" />
        {isExporting ? "Exporting..." : "Export"}
      </Button>
    </>
  )
}
