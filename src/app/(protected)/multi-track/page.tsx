'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Music, Clock, HardDrive, Eye, Edit, Plus, Filter, User } from 'lucide-react'
import songService, { Song } from '@/services/song.service'
import { formatDuration, formatFileSize } from '@/lib/utils'
import MultiTrackUpload from '@/components/multi-track/multi-track-upload'

// Use the Song interface from the song service but with a more specific multi-track type
type SongWithMultiTrack = Song

export default function MultiTrackPage() {
  const [songs, setSongs] = useState<SongWithMultiTrack[]>([])
  const [filteredSongs, setFilteredSongs] = useState<SongWithMultiTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [trackFilter, setTrackFilter] = useState<string>('all')
  const [selectedSong, setSelectedSong] = useState<SongWithMultiTrack | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  useEffect(() => {
    fetchSongs()
  }, [])

  useEffect(() => {
    filterSongs()
  }, [songs, searchTerm, statusFilter, trackFilter])

  const fetchSongs = async () => {
    try {
      setLoading(true)
      const response = await songService.getAllSongs()
      setSongs(response)
    } catch (error) {
      console.error('Error fetching songs:', error)
      toast.error('Failed to fetch songs')
    } finally {
      setLoading(false)
    }
  }

  const filterSongs = () => {
    let filtered = songs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'with-multitrack') {
        filtered = filtered.filter(song => song.multiTrack)
      } else if (statusFilter === 'without-multitrack') {
        filtered = filtered.filter(song => !song.multiTrack)
      }
    }

    // Track filter
    if (trackFilter !== 'all') {
      filtered = filtered.filter(song => {
        if (!song.multiTrack) return false
        
        const trackCount = [
          song.multiTrack.vocalsUrl,
          song.multiTrack.bassUrl,
          song.multiTrack.drumsUrl,
          song.multiTrack.otherUrl
        ].filter(Boolean).length

        switch (trackFilter) {
          case 'complete':
            return trackCount === 4
          case 'partial':
            return trackCount > 0 && trackCount < 4
          case 'empty':
            return trackCount === 0
          default:
            return true
        }
      })
    }

    setFilteredSongs(filtered)
  }

  const handleEditMultiTrack = (song: SongWithMultiTrack) => {
    setSelectedSong(song)
    setShowUploadDialog(true)
  }

  const handleUploadSuccess = () => {
    setShowUploadDialog(false)
    fetchSongs() // Refresh the list
    toast.success('Multi-track updated successfully!')
  }

  const getTrackCount = (song: SongWithMultiTrack): number => {
    if (!song.multiTrack) return 0
    return [
      song.multiTrack.vocalsUrl,
      song.multiTrack.bassUrl,
      song.multiTrack.drumsUrl,
      song.multiTrack.otherUrl
    ].filter(Boolean).length
  }

  const getTrackStatus = (song: SongWithMultiTrack): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    const trackCount = getTrackCount(song)
    
    if (trackCount === 0) {
      return { label: 'No Tracks', variant: 'outline' }
    } else if (trackCount === 4) {
      return { label: 'Complete', variant: 'default' }
    } else {
      return { label: `${trackCount}/4 Tracks`, variant: 'secondary' }
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
          <SiteHeader title="Multi-Track Management" />
          <div className="flex items-center justify-center h-64 p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading songs...</p>
            </div>
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
        <SiteHeader title="Multi-Track Management" />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Multi-Track Management</h1>
              <p className="text-muted-foreground">Manage multi-track audio for your songs</p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search songs or artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All songs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Songs</SelectItem>
                      <SelectItem value="with-multitrack">With Multi-Track</SelectItem>
                      <SelectItem value="without-multitrack">Without Multi-Track</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Track Completion</label>
                  <Select value={trackFilter} onValueChange={setTrackFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All tracks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="complete">Complete (4/4)</SelectItem>
                      <SelectItem value="partial">Partial (1-3)</SelectItem>
                      <SelectItem value="empty">Empty (0/4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Songs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Songs ({filteredSongs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Song</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Multi-Track Status</TableHead>
                      <TableHead>Tracks</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSongs.map((song) => {
                      const trackStatus = getTrackStatus(song)
                      return (
                        <TableRow key={song.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {song.imageUrl && (
                                <img
                                  src={song.imageUrl}
                                  alt={song.title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{song.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {song.difficulty && (
                                    <span className="inline-flex items-center gap-1">
                                      <span>{song.difficulty}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {song.artist?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {song.key && (
                              <Badge variant="outline">{song.key}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={trackStatus.variant}>
                              {trackStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {song.multiTrack ? (
                                <div className="space-y-1">
                                  {song.multiTrack.vocalsUrl && <div>• Vocals</div>}
                                  {song.multiTrack.bassUrl && <div>• Bass</div>}
                                  {song.multiTrack.drumsUrl && <div>• Drums</div>}
                                  {song.multiTrack.otherUrl && <div>• Other</div>}
                                  {getTrackCount(song) === 0 && <div className="text-muted-foreground">No tracks</div>}
                                </div>
                              ) : (
                                <div className="text-muted-foreground">No multi-track</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {song.viewCount || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMultiTrack(song)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              {song.multiTrack ? 'Edit' : 'Add'} Multi-Track
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {(!filteredSongs || filteredSongs.length === 0) && (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No songs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || trackFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'No songs available.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Dialog */}
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedSong?.multiTrack ? 'Edit' : 'Add'} Multi-Track - {selectedSong?.title}
                </DialogTitle>
              </DialogHeader>
              {selectedSong && (
                <MultiTrackUpload
                  songId={selectedSong.id}
                  onSuccess={handleUploadSuccess}
                  onCancel={() => setShowUploadDialog(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
