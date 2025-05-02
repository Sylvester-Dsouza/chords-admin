"use client"

import * as React from "react"
import {
  IconMusic,
  IconUser,
  IconFolder,
  IconStar,
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

// Sample data for featured content
const featuredSongs = [
  { id: "1", title: "Amazing Grace", artist: "John Newton", type: "song", position: 1, active: true },
  { id: "2", title: "How Great Is Our God", artist: "Chris Tomlin", type: "song", position: 2, active: true },
  { id: "3", title: "10,000 Reasons", artist: "Matt Redman", type: "song", position: 3, active: true },
  { id: "4", title: "Oceans (Where Feet May Fail)", artist: "Hillsong United", type: "song", position: 4, active: true },
  { id: "5", title: "What A Beautiful Name", artist: "Hillsong Worship", type: "song", position: 5, active: false },
]

const featuredArtists = [
  { id: "1", name: "Chris Tomlin", songCount: 12, type: "artist", position: 1, active: true },
  { id: "2", name: "Hillsong Worship", songCount: 18, type: "artist", position: 2, active: true },
  { id: "3", name: "Matt Redman", songCount: 8, type: "artist", position: 3, active: true },
  { id: "4", name: "Elevation Worship", songCount: 14, type: "artist", position: 4, active: false },
]

const featuredCollections = [
  { id: "1", name: "Worship Favorites", songCount: 15, type: "collection", position: 1, active: true },
  { id: "2", name: "Hymns Collection", songCount: 20, type: "collection", position: 2, active: true },
  { id: "3", name: "Easter Songs", songCount: 12, type: "collection", position: 3, active: false },
]

export default function FeaturedPage() {
  const [activeTab, setActiveTab] = React.useState("songs")
  
  // Move item up in the list
  const moveUp = (id: string, type: string) => {
    console.log(`Moving ${type} with ID ${id} up`)
    // Implementation would update the position in the database
  }
  
  // Move item down in the list
  const moveDown = (id: string, type: string) => {
    console.log(`Moving ${type} with ID ${id} down`)
    // Implementation would update the position in the database
  }
  
  // Toggle active status
  const toggleActive = (id: string, type: string, currentStatus: boolean) => {
    console.log(`Toggling ${type} with ID ${id} to ${!currentStatus}`)
    // Implementation would update the active status in the database
  }
  
  // Remove from featured
  const removeFromFeatured = (id: string, type: string) => {
    console.log(`Removing ${type} with ID ${id} from featured`)
    // Implementation would remove the item from featured in the database
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
        <SiteHeader title="Featured Content" />
        <div className="space-y-6 p-6">
          {/* Header with page name */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Featured Content</h1>
              <p className="text-muted-foreground">
                Manage content featured on the homepage
              </p>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Featured Songs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{featuredSongs.filter(s => s.active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {featuredSongs.filter(s => s.active).length} active / {featuredSongs.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Featured Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{featuredArtists.filter(a => a.active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {featuredArtists.filter(a => a.active).length} active / {featuredArtists.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Featured Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{featuredCollections.filter(c => c.active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {featuredCollections.filter(c => c.active).length} active / {featuredCollections.length} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different content types */}
          <Tabs defaultValue="songs" onValueChange={setActiveTab} value={activeTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="songs">Songs</TabsTrigger>
                <TabsTrigger value="artists">Artists</TabsTrigger>
                <TabsTrigger value="collections">Collections</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <IconPlus className="mr-2 h-4 w-4" />
                Add {activeTab === "songs" ? "Song" : activeTab === "artists" ? "Artist" : "Collection"}
              </Button>
            </div>
            
            <TabsContent value="songs" className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featuredSongs.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell className="font-medium">{song.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IconMusic className="mr-2 h-4 w-4 text-muted-foreground" />
                          {song.title}
                        </div>
                      </TableCell>
                      <TableCell>{song.artist}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={song.active} 
                            onCheckedChange={() => toggleActive(song.id, song.type, song.active)}
                          />
                          <span>{song.active ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => moveUp(song.id, song.type)}
                            disabled={song.position === 1}
                          >
                            <IconArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => moveDown(song.id, song.type)}
                            disabled={song.position === featuredSongs.length}
                          >
                            <IconArrowDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeFromFeatured(song.id, song.type)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="artists" className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Songs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featuredArtists.map((artist) => (
                    <TableRow key={artist.id}>
                      <TableCell className="font-medium">{artist.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                          {artist.name}
                        </div>
                      </TableCell>
                      <TableCell>{artist.songCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={artist.active} 
                            onCheckedChange={() => toggleActive(artist.id, artist.type, artist.active)}
                          />
                          <span>{artist.active ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => moveUp(artist.id, artist.type)}
                            disabled={artist.position === 1}
                          >
                            <IconArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => moveDown(artist.id, artist.type)}
                            disabled={artist.position === featuredArtists.length}
                          >
                            <IconArrowDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeFromFeatured(artist.id, artist.type)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="collections" className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Songs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featuredCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">{collection.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IconFolder className="mr-2 h-4 w-4 text-muted-foreground" />
                          {collection.name}
                        </div>
                      </TableCell>
                      <TableCell>{collection.songCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={collection.active} 
                            onCheckedChange={() => toggleActive(collection.id, collection.type, collection.active)}
                          />
                          <span>{collection.active ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => moveUp(collection.id, collection.type)}
                            disabled={collection.position === 1}
                          >
                            <IconArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => moveDown(collection.id, collection.type)}
                            disabled={collection.position === featuredCollections.length}
                          >
                            <IconArrowDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeFromFeatured(collection.id, collection.type)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
