"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CacheService } from "@/services/cache.service"
import { SystemMonitoringService } from "@/services/system-monitoring.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconRefresh,
  IconTrash,
  IconDatabase,
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define cache key interface
interface CacheKey {
  key: string;
  type: string;
  size: string;
  ttl: string;
  hits: number;
}

// Define cache stats interface
interface CacheStats {
  memory: {
    used: string;
    max: string;
    percentage: number;
  };
  keys: {
    total: number;
    expires: number;
    persistent: number;
  };
  hitRate: number;
  available: boolean;
  topKeys: CacheKey[];
  uptime: string;
  connectedClients: number;
}

// Default cache data structure
const defaultCacheStats: CacheStats = {
  memory: {
    used: '0 MB',
    max: '0 MB',
    percentage: 0,
  },
  keys: {
    total: 0,
    expires: 0,
    persistent: 0,
  },
  hitRate: 0,
  available: false,
  topKeys: [],
  uptime: "0 days, 0 hours",
  connectedClients: 0
};

export default function CachePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [cacheStats, setCacheStats] = useState<CacheStats>(defaultCacheStats)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load cache data on mount
  useEffect(() => {
    loadCacheData();
  }, []);

  // Load cache data from API
  const loadCacheData = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const cacheData = await SystemMonitoringService.getCacheMetrics();
      setCacheStats(cacheData);
    } catch (err) {
      console.error("Error loading cache data:", err);
      setError("Failed to load cache data. Please try again.");
      toast.error("Failed to load cache data");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // Filter cache keys based on search term and type filter
  const filteredKeys = cacheStats.topKeys ? cacheStats.topKeys.filter(item => {
    const matchesSearch = searchTerm === "" ||
      item.key.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || item.type === typeFilter;

    return matchesSearch && matchesType;
  }) : [];

  // Refresh cache stats
  const refreshStats = async () => {
    setIsRefreshing(true);

    try {
      await loadCacheData();
      toast.success("Cache statistics refreshed");
    } catch (err) {
      console.error("Error refreshing cache stats:", err);
      toast.error("Failed to refresh cache statistics");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Clear all cache
  const clearCache = async (pattern = "*") => {
    setIsClearing(true);

    try {
      if (pattern === "*") {
        await CacheService.clearAllCache();
        toast.success("All cache entries cleared");
      } else {
        const prefix = pattern.replace(/:.*$/, '');
        await CacheService.clearCacheByPrefix(prefix);
        toast.success(`Cache entries matching '${pattern}' cleared`);
      }

      // Refresh cache stats after clearing
      await loadCacheData();
    } catch (err) {
      console.error("Error clearing cache:", err);
      toast.error("Failed to clear cache");
    } finally {
      setIsClearing(false);
    }
  };

  // Clear a specific cache key
  const clearCacheKey = async (key: string) => {
    try {
      // Create a promise that we can await
      const clearPromise = CacheService.clearCacheKey(key);

      // Show toast with the promise
      toast.promise(clearPromise, {
        loading: `Clearing cache key ${key}...`,
        success: `Cache key ${key} cleared successfully`,
        error: "Failed to clear cache key"
      });

      // Await the promise
      await clearPromise;

      // Refresh cache stats after clearing
      await loadCacheData();
    } catch (err) {
      console.error(`Error clearing cache key ${key}:`, err);
    }
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
                    <div className="text-2xl font-bold">{cacheStats.memory?.used || '0 MB'} / {cacheStats.memory?.max || '0 MB'}</div>
                    <Progress value={cacheStats.memory?.percentage || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {cacheStats.memory?.percentage || 0}% utilized
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cacheStats.hitRate || 0}%</div>
                    <Progress value={cacheStats.hitRate || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {100 - (cacheStats.hitRate || 0)}% miss rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(cacheStats.keys?.total || 0).toLocaleString()}</div>
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
                    <div className="text-2xl font-bold">{(cacheStats.keys?.expires || 0).toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <IconDatabase className="h-4 w-4 text-muted-foreground mr-1" />
                      <p className="text-xs text-muted-foreground">
                        Keys with expiration
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
                          <Badge variant="outline" className={cacheStats.available ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}>
                            {cacheStats.available ? "Online" : "Offline"}
                          </Badge>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Memory Type:</span>
                        <span className="text-sm font-medium">{cacheStats.available ? "Redis" : "Not Available"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Persistent Keys:</span>
                        <span className="text-sm font-medium">{cacheStats.keys?.persistent || 0}</span>
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
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </div>
                      ) : error ? (
                        <div className="flex justify-center py-4 text-red-500">
                          <IconAlertCircle className="h-5 w-5 mr-2" />
                          <span>{error}</span>
                        </div>
                      ) : !cacheStats.available ? (
                        <div className="flex justify-center py-4 text-amber-500">
                          <IconAlertCircle className="h-5 w-5 mr-2" />
                          <span>Redis cache not available</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Keys:</span>
                            <span className="text-sm font-medium">{cacheStats.keys?.total || 0} keys</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Expiring Keys:</span>
                            <span className="text-sm font-medium">{cacheStats.keys?.expires || 0} keys</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Persistent Keys:</span>
                            <span className="text-sm font-medium">{cacheStats.keys?.persistent || 0} keys</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Hit Rate:</span>
                            <span className="text-sm font-medium">{cacheStats.hitRate || 0}%</span>
                          </div>
                        </>
                      )}
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
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-3">Loading cache keys...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-12 text-red-500">
                    <IconAlertCircle className="h-6 w-6 mr-2" />
                    <span>{error}</span>
                  </div>
                ) : !cacheStats.available ? (
                  <div className="flex justify-center items-center py-12 text-amber-500">
                    <IconAlertCircle className="h-6 w-6 mr-2" />
                    <span>Redis cache not available</span>
                  </div>
                ) : filteredKeys.length === 0 ? (
                  <div className="flex justify-center items-center py-12 text-muted-foreground">
                    <IconAlertCircle className="h-6 w-6 mr-2" />
                    <span>No cache keys found</span>
                  </div>
                ) : (
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
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {cacheStats.topKeys ?
                  `Showing ${filteredKeys.length} of ${cacheStats.topKeys.length} cache keys` :
                  "No cache keys available"}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => clearCache("song:*")} disabled={!cacheStats.available || isClearing}>
                  Clear Song Cache
                </Button>
                <Button variant="outline" size="sm" onClick={() => clearCache("auth:*")} disabled={!cacheStats.available || isClearing}>
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
