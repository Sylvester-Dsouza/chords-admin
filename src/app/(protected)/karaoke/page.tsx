'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { toast } from 'sonner'
import { Search, Music, Clock, HardDrive, Eye, Edit, Plus, Filter, User } from 'lucide-react'
import songService, { Song } from '@/services/song.service'
import { formatDuration, formatFileSize } from '@/lib/utils'
import MultiTrackUpload from '@/components/karaoke/multi-track-upload'

// Use the Song interface from the song service but with a more specific karaoke type
type SongWithKaraoke = Song

export default function KaraokePage() {
  const [songs, setSongs] = useState<SongWithKaraoke[]>([])
  const [filteredSongs, setFilteredSongs] = useState<SongWithKaraoke[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [trackFilter, setTrackFilter] = useState<string>('all')
  const [selectedSong, setSelectedSong] = useState<SongWithKaraoke | null>(null)
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
      const response = await songService.getSongs({
        page: 1,
        limit: 1000,
        includeKaraoke: true,
      })
      setSongs(response.songs || [])
    } catch (error) {
      console.error('Error fetching songs:', error)
      toast.error('Failed to fetch songs')
      setSongs([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterSongs = () => {
    // Ensure songs is an array before filtering
    if (!Array.isArray(songs)) {
      setFilteredSongs([])
      return
    }

    let filtered = [...songs]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'with-karaoke') {
        filtered = filtered.filter(song => song.karaoke && song.karaoke.status === 'ACTIVE')
      } else if (statusFilter === 'without-karaoke') {
        filtered = filtered.filter(song => !song.karaoke || song.karaoke.status !== 'ACTIVE')
      }
    }

    // Track type filter
    if (trackFilter !== 'all') {
      if (trackFilter === 'single-track') {
        filtered = filtered.filter(song =>
          song.karaoke &&
          song.karaoke.status === 'ACTIVE' &&
          (!song.karaoke.tracks || song.karaoke.tracks.length === 0)
        )
      } else if (trackFilter === 'multi-track') {
        filtered = filtered.filter(song =>
          song.karaoke &&
          song.karaoke.status === 'ACTIVE' &&
          song.karaoke.tracks &&
          song.karaoke.tracks.length > 0
        )
      }
    }

    setFilteredSongs(filtered)
  }

  const getKaraokeStatus = (song: SongWithKaraoke) => {
    if (!song.karaoke) return 'No Karaoke'
    if (song.karaoke.status !== 'ACTIVE') return 'Inactive'

    const trackCount = song.karaoke.tracks?.length || 0
    if (trackCount === 0) return 'Single Track'
    return `Multi-Track (${trackCount})`
  }

  const getKaraokeStatusColor = (song: SongWithKaraoke): "default" | "destructive" | "outline" | "secondary" => {
    if (!song.karaoke || song.karaoke.status !== 'ACTIVE') return 'secondary'
    const trackCount = song.karaoke.tracks?.length || 0
    if (trackCount === 0) return 'default'
    // Changed from 'success' to 'default' as 'success' is not a valid Badge variant
    return 'default'
  }

  const handleEditKaraoke = (song: SongWithKaraoke) => {
    setSelectedSong(song)
    setShowUploadDialog(true)
  }

  const handleUploadSuccess = async () => {
    try {
      // First fetch the updated song data
      if (selectedSong) {
        const updatedSong = await songService.getSongById(selectedSong.id)
        
        console.log('Fetched updated song with karaoke data:', updatedSong.karaoke)
        
        // Update the song in the songs array
        setSongs(prevSongs => 
          prevSongs.map(song => 
            song.id === updatedSong.id ? {...updatedSong} : song
          )
        )
        
        // Also update in filtered songs
        setFilteredSongs(prevSongs => 
          prevSongs.map(song => 
            song.id === updatedSong.id ? {...updatedSong} : song
          )
        )
        
        // Show success message with track count if available
        const trackCount = updatedSong.karaoke?.tracks?.length || 0
        if (trackCount > 0) {
          toast.success(`Karaoke updated successfully! ${trackCount} tracks available.`)
        } else {
          toast.success('Karaoke updated successfully!')
        }
      } else {
        toast.success('Karaoke updated successfully!')
      }
      
      setShowUploadDialog(false)
      setSelectedSong(null)
    } catch (error) {
      console.error('Error updating song data:', error)
      toast.error('Karaoke was uploaded but failed to refresh data')
      // Fallback to full refresh
      fetchSongs()
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
          <SiteHeader title="Karaoke Management" />
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
        <SiteHeader title="Karaoke Management" />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Karaoke Management</h1>
              <p className="text-muted-foreground">Manage karaoke tracks for your songs</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search songs or artists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Karaoke Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Songs</SelectItem>
                    <SelectItem value="with-karaoke">With Karaoke</SelectItem>
                    <SelectItem value="without-karaoke">Without Karaoke</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={trackFilter} onValueChange={setTrackFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Track Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single-track">Single Track</SelectItem>
                    <SelectItem value="multi-track">Multi-Track</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground flex items-center">
                  Showing {filteredSongs?.length || 0} of {songs?.length || 0} songs
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
                      <TableHead>Karaoke Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filteredSongs || []).map((song) => (
                      <TableRow key={song.id} className="hover:bg-muted/50">
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
                                {song.viewCount || 0} views
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {song.artist?.name || 'Unknown Artist'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{song.key || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getKaraokeStatusColor(song)}>
                            {getKaraokeStatus(song)}
                          </Badge>
                          {song.karaoke?.tracks && song.karaoke.tracks.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {song.karaoke.tracks?.map((track) => (
                                <Badge
                                  key={track.id}
                                  variant="outline"
                                  className="text-xs px-1 py-0"
                                >
                                  {track.trackType.toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {song.karaoke?.duration ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(song.karaoke.duration)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {song.karaoke?.fileSize ? (
                            <div className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(song.karaoke.fileSize)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {song.karaoke?.quality ? (
                            <Badge variant="outline">{song.karaoke.quality}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditKaraoke(song)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            {song.karaoke ? 'Edit' : 'Add'} Karaoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  {selectedSong?.karaoke ? 'Edit' : 'Add'} Karaoke - {selectedSong?.title}
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
