'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Music,
  Search,
  Filter,
  Upload,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { KaraokeUpload } from '@/components/karaoke/karaoke-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import songService, { Song } from '@/services/song.service';
import karaokeService from '@/services/karaoke.service';

interface KaraokeStats {
  totalKaraokeSongs: number;
  totalDownloads: number;
  totalPlays: number;
  totalStorageUsed: number;
}

export default function KaraokePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState<KaraokeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-karaoke' | 'without-karaoke'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'recent' | 'popular'>('title');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSongs();
    fetchStats();
  }, [currentPage, searchTerm, filterStatus, sortBy]);

  const fetchSongs = async () => {
    try {
      setLoading(true);

      // Use songService to get all songs (it handles the API response structure properly)
      const fetchedSongs = await songService.getAllSongs(searchTerm);

      // Ensure fetchedSongs is an array
      if (!Array.isArray(fetchedSongs)) {
        console.error('Expected array from songService.getAllSongs, got:', typeof fetchedSongs);
        setSongs([]);
        setTotalPages(1);
        return;
      }

      // Filter songs based on karaoke status
      let filteredSongs = fetchedSongs;
      if (filterStatus === 'with-karaoke') {
        filteredSongs = fetchedSongs.filter((song: Song) => song.karaoke && song.karaoke.status === 'ACTIVE');
      } else if (filterStatus === 'without-karaoke') {
        filteredSongs = fetchedSongs.filter((song: Song) => !song.karaoke || song.karaoke.status !== 'ACTIVE');
      }

      // Sort songs based on sortBy parameter
      if (sortBy === 'artist') {
        filteredSongs.sort((a, b) => a.artist.name.localeCompare(b.artist.name));
      } else if (sortBy === 'recent') {
        filteredSongs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'popular') {
        filteredSongs.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else {
        // Default to title sorting
        filteredSongs.sort((a, b) => a.title.localeCompare(b.title));
      }

      // Handle pagination manually since songService doesn't support it
      const itemsPerPage = 20;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedSongs = filteredSongs.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);

      setSongs(paginatedSongs);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching songs:', error);
      // Set empty state on error
      setSongs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await karaokeService.getKaraokeStats();
      setStats(stats);
    } catch (error) {
      console.error('Error fetching karaoke stats:', error);
    }
  };

  const handleUploadSuccess = () => {
    fetchSongs();
    fetchStats();
    setSelectedSong(null);
  };

  const handleRemoveSuccess = () => {
    fetchSongs();
    fetchStats();
    setSelectedSong(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Karaoke" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Karaoke Management</h1>
              <p className="text-muted-foreground">
                Upload and manage karaoke tracks for songs
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Music className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Karaoke Songs</p>
                      <p className="text-2xl font-bold">{stats.totalKaraokeSongs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Download className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                      <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                      <p className="text-2xl font-bold">{stats.totalPlays}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Upload className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                      <p className="text-2xl font-bold">{formatFileSize(stats.totalStorageUsed)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search songs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Songs</SelectItem>
                    <SelectItem value="with-karaoke">With Karaoke</SelectItem>
                    <SelectItem value="without-karaoke">Without Karaoke</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="artist">Artist A-Z</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Songs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : songs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No songs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No songs available.'}
                </p>
              </div>
            ) : (
              songs.map((song) => (
                <Card key={song.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{song.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {song.artist.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {song.karaoke && song.karaoke.status === 'ACTIVE' ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Has Karaoke
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            No Karaoke
                          </Badge>
                        )}

                        {song.key && (
                          <Badge variant="outline">Key: {song.key}</Badge>
                        )}
                      </div>

                      {song.karaoke && song.karaoke.status === 'ACTIVE' && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {song.karaoke.duration && (
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDuration(song.karaoke.duration)}
                            </div>
                          )}
                          {song.karaoke.fileSize && (
                            <div>Size: {formatFileSize(song.karaoke.fileSize)}</div>
                          )}
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            variant={song.karaoke && song.karaoke.status === 'ACTIVE' ? "outline" : "default"}
                            onClick={() => setSelectedSong(song)}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {song.karaoke && song.karaoke.status === 'ACTIVE' ? 'Manage Karaoke' : 'Add Karaoke'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {song.karaoke && song.karaoke.status === 'ACTIVE' ? 'Manage' : 'Add'} Karaoke
                            </DialogTitle>
                          </DialogHeader>
                          {selectedSong && (
                            <KaraokeUpload
                              songId={selectedSong.id}
                              songTitle={selectedSong.title}
                              artistName={selectedSong.artist.name}
                              currentKaraoke={{
                                hasKaraoke: !!(selectedSong.karaoke && selectedSong.karaoke.status === 'ACTIVE'),
                                karaokeFileUrl: selectedSong.karaoke?.fileUrl,
                                karaokeKey: selectedSong.karaoke?.key,
                                karaokeDuration: selectedSong.karaoke?.duration,
                              }}
                              onUploadSuccess={handleUploadSuccess}
                              onRemoveSuccess={handleRemoveSuccess}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      size="sm"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
