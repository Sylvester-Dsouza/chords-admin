"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ArtistForm from "@/components/artists/artist-form"
import artistService, { Artist } from "@/services/artist.service"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle } from "@tabler/icons-react"

export default function EditArtistPage() {
  const params = useParams()
  const artistId = params.id as string
  
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true)
        const data = await artistService.getArtistById(artistId)
        setArtist(data)
      } catch (err: any) {
        console.error('Failed to fetch artist:', err)
        setError(`Failed to load artist: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (artistId) {
      fetchArtist()
    }
  }, [artistId])

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Artist" />
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading artist...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Artist" />
          <div className="p-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!artist) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Artist" />
          <div className="p-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>Artist not found</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return <ArtistForm mode="edit" initialData={artist} title={`Edit Artist: ${artist.name}`} />
}
