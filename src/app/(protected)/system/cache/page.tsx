"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconRefresh,
  IconTrash,
  IconCloud,
  IconDatabase,
  IconClock,
  IconKey,
  IconSearch,
  IconFilter,
  IconAlertCircle,
  IconEye
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock cache data
const cacheStats = {
  totalMemory: 256, // MB
  usedMemory: 108, // MB
  hitRate: 78, // percentage
  missRate: 22, // percentage
  keyCount: 1245,
  operations: 45678,
  uptime: "3 days, 12 hours",
  connectedClients: 12
};

const cacheKeys = [
  { key: "song:a1b2c3d4", type: "Song", size: "12 KB", ttl: "30 min", hits: 342 },
  { key: "songs:list", type: "Song List", size: "45 KB", ttl: "5 min", hits: 1245 },
  { key: "artist:e5f6g7h8", type: "Artist", size: "8 KB", ttl: "30 min", hits: 156 },
  { key: "artists:list", type: "Artist List", size: "32 KB", ttl: "5 min", hits: 876 },
  { key: "chord:C_guitar", type: "Chord Diagram", size: "4 KB", ttl: "24 hours", hits: 2345 },
  { key: "chord:G_piano", type: "Chord Diagram", size: "5 KB", ttl: "24 hours", hits: 1876 },
  { key: "auth:token:i9j0k1l2", type: "Auth Token", size: "2 KB", ttl: "15 min", hits: 45 },
  { key: "user:m3n4o5p6", type: "User", size: "10 KB", ttl: "30 min", hits: 123 },
  { key: "comment:q7r8s9t0", type: "Comment", size: "6 KB", ttl: "15 min", hits: 78 },
  { key: "comments:song:u1v2w3x4", type: "Comment List", size: "28 KB", ttl: "5 min", hits: 456 }
];

export default function CachePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Filter cache keys based on search term and type filter
  const filteredKeys = cacheKeys.filter(item => {
    const matchesSearch = searchTerm === "" ||
      item.key.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Simulate refreshing cache stats
  const refreshStats = () => {
    setIsRefreshing(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Cache statistics refreshed");
    }, 1000);
  };

  // Simulate clearing cache
  const clearCache = (pattern = "*") => {
    setIsClearing(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsClearing(false);
      toast.success(pattern === "*"
        ? "All cache entries cleared"
        : `Cache entries matching '${pattern}' cleared`);
    }, 1500);
  };

  // Simulate clearing a specific cache key
  const clearCacheKey = (key: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: `Clearing cache key ${key}...`,
        success: `Cache key ${key} cleared successfully`,
        error: "Failed to clear cache key"
      }
    );
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
        <SiteHeader title="Cache Management" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cache Management</h1>
              <p className="text-muted-foreground">
                Monitor and manage Redis cache
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={refreshStats} disabled={isRefreshing}>
                <IconRefresh className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
              <Button variant="destructive" size="sm" onClick={() => clearCache()} disabled={isClearing}>
                <IconTrash className="mr-2 h-4 w-4" />
                Clear All Cache
              </Button>
            </div>
          </div>

          {/* Cache Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Overview</CardTitle>
              <CardDescription>
                Redis cache server statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cacheStats.usedMemory} MB / {cacheStats.totalMemory} MB</div>
                    <Progress value={(cacheStats.usedMemory / cacheStats.totalMemory) * 100} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round((cacheStats.usedMemory / cacheStats.totalMemory) * 100)}% utilized
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cacheStats.hitRate}%</div>
                    <Progress value={cacheStats.hitRate} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {cacheStats.missRate}% miss rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cacheStats.keyCount.toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <IconKey className="h-4 w-4 text-muted-foreground mr-1" />
                      <p className="text-xs text-muted-foreground">
                        Active cache entries
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cacheStats.operations.toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <IconDatabase className="h-4 w-4 text-muted-foreground mr-1" />
                      <p className="text-xs text-muted-foreground">
                        Total operations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Redis Server</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className="text-sm font-medium">
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Online</Badge>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Uptime:</span>
                        <span className="text-sm font-medium">{cacheStats.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Connected Clients:</span>
                        <span className="text-sm font-medium">{cacheStats.connectedClients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Version:</span>
                        <span className="text-sm font-medium">Redis 7.0.5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Songs:</span>
                        <span className="text-sm font-medium">342 keys</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Artists:</span>
                        <span className="text-sm font-medium">156 keys</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Chord Diagrams:</span>
                        <span className="text-sm font-medium">423 keys</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Auth Tokens:</span>
                        <span className="text-sm font-medium">78 keys</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Cache Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Keys</CardTitle>
              <CardDescription>
                Browse and manage individual cache entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
                <div className="flex items-center space-x-2 flex-1">
                  <IconSearch className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cache keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Key Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="Song">Songs</SelectItem>
                      <SelectItem value="Song List">Song Lists</SelectItem>
                      <SelectItem value="Artist">Artists</SelectItem>
                      <SelectItem value="Artist List">Artist Lists</SelectItem>
                      <SelectItem value="Chord Diagram">Chord Diagrams</SelectItem>
                      <SelectItem value="Auth Token">Auth Tokens</SelectItem>
                      <SelectItem value="User">Users</SelectItem>
                      <SelectItem value="Comment">Comments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>TTL</TableHead>
                      <TableHead>Hits</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((item) => (
                      <TableRow key={item.key}>
                        <TableCell className="font-mono text-sm">{item.key}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.ttl}</TableCell>
                        <TableCell>{item.hits.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => clearCacheKey(item.key)}>
                              <IconTrash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredKeys.length} of {cacheKeys.length} cache keys
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => clearCache("song:*")}>
                  Clear Song Cache
                </Button>
                <Button variant="outline" size="sm" onClick={() => clearCache("auth:*")}>
                  Clear Auth Cache
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Cache Warming */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Warming</CardTitle>
              <CardDescription>
                Pre-populate cache with frequently accessed data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Popular Songs</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Cache the top 100 most viewed songs
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Warm Cache
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Common Chords</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Cache diagrams for common chords
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Warm Cache
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Featured Content</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Cache all featured songs and collections
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Warm Cache
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">All Artists</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Cache the complete artist directory
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Warm Cache
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
