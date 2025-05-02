"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconMusic,
  IconUser,
  IconAlbum,
  IconKey,
  IconChartBar,
  IconTag
} from "@tabler/icons-react"

import { ChordFormatter } from "@/components/songs/chord-formatter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import songService, { Song } from "@/services/song.service"

export default function SongDetailPage() {
  const params = useParams()
  const router = useRouter()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSong = async () => {
      try {
        setLoading(true)
        const data = await songService.getSongById(songId)
        setSong(data)
      } catch (err: any) {
        console.error('Failed to fetch song:', err)
        setError(`Failed to load song: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (songId) {
      fetchSong()
    }
  }, [songId])

  const handleDelete = async () => {
    if (!song) return

    if (confirm(`Are you sure you want to delete "${song.title}"?`)) {
      try {
        await songService.deleteSong(songId)
        alert('Song deleted successfully')
        router.push('/songs')
      } catch (err: any) {
        console.error('Failed to delete song:', err)
        alert(`Failed to delete song: ${err.message || 'Unknown error'}`)
      }
    }
  }

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
          <SiteHeader title="Song Details" />
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading song...</span>
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
          <SiteHeader title="Song Details" />
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

  if (!song) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Song Details" />
          <div className="p-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>Song not found</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
        <SiteHeader title="Song Details" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/songs")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Songs
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{song.title}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/songs/${songId}/edit`)}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit Song
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Song
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Song Information */}
            <Card>
              <CardHeader>
                <CardTitle>Song Information</CardTitle>
                <CardDescription>
                  Basic details about this song
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconMusic className="mr-1 h-4 w-4" />
                      Title
                    </div>
                    <div className="font-medium">{song.title}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconUser className="mr-1 h-4 w-4" />
                      Artist
                    </div>
                    <div className="font-medium">{song.artist?.name || 'Unknown Artist'}</div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconAlbum className="mr-1 h-4 w-4" />
                      Album
                    </div>
                    <div className="font-medium">N/A</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconKey className="mr-1 h-4 w-4" />
                      Key
                    </div>
                    <div className="font-medium">{song.key || 'N/A'}</div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconChartBar className="mr-1 h-4 w-4" />
                      Difficulty
                    </div>
                    <div className="font-medium">{song.difficulty || 'N/A'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconTag className="mr-1 h-4 w-4" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {song.tags && song.tags.length > 0 ? (
                        song.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="font-medium">
                      {new Date(song.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Last Updated</div>
                    <div className="font-medium">
                      {new Date(song.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lyrics and Chords */}
            <Card>
              <CardHeader>
                <CardTitle>Lyrics and Chords</CardTitle>
                <CardDescription>
                  Song lyrics and chord notations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="lyrics" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                    <TabsTrigger value="chords">Chords</TabsTrigger>
                  </TabsList>
                  <TabsContent value="lyrics" className="mt-4">
                    <div className="rounded-md border p-4 min-h-[400px] whitespace-pre-wrap font-mono text-sm">
                      {/* Extract lyrics from chord sheet */}
                      {song.chordSheet
                        ? song.chordSheet
                            .replace(/\[([^\]]+)\]/g, '') // Remove all chord notations [Chord]
                            .replace(/\{([^\}]+)\}/g, '$1\n') // Replace {Section} with Section and add newline
                            .trim()
                        : 'No lyrics available'}
                    </div>
                  </TabsContent>
                  <TabsContent value="chords" className="mt-4">
                    <div className="rounded-md border p-4 min-h-[400px] overflow-auto">
                      <ChordFormatter
                        chordSheet={song.chordSheet}
                        className="text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
