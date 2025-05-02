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
  IconDownload,
  IconCpu,
  IconDatabase,
  IconChartLine,
  IconClockHour4,
  IconAlertCircle,
  IconFilter,
  IconCalendar
} from "@tabler/icons-react"
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

// Mock performance data
const performanceData = {
  avgResponseTime: 120, // ms
  p95ResponseTime: 250, // ms
  p99ResponseTime: 450, // ms
  requestsPerMinute: 350,
  errorRate: 0.5, // percentage
  cpuUsage: 32, // percentage
  memoryUsage: 45, // percentage
  diskUsage: 28, // percentage
  databaseConnections: 24,
  activeUsers: 156
};

// Mock slow queries
const slowQueries = [
  { 
    query: "SELECT * FROM songs WHERE tags @> ARRAY['worship', 'contemporary'] ORDER BY title",
    avgTime: 450, // ms
    calls: 56,
    lastExecuted: "10 minutes ago",
    hasIndex: false
  },
  { 
    query: "SELECT s.*, a.name FROM songs s JOIN artists a ON s.artist_id = a.id WHERE s.title ILIKE '%praise%'",
    avgTime: 320, // ms
    calls: 124,
    lastExecuted: "2 minutes ago",
    hasIndex: true
  },
  { 
    query: "SELECT c.* FROM comments c WHERE c.song_id = ? ORDER BY c.created_at DESC",
    avgTime: 280, // ms
    calls: 342,
    lastExecuted: "1 minute ago",
    hasIndex: true
  },
  { 
    query: "SELECT * FROM users WHERE last_login > NOW() - INTERVAL '7 days'",
    avgTime: 210, // ms
    calls: 12,
    lastExecuted: "30 minutes ago",
    hasIndex: false
  },
  { 
    query: "SELECT * FROM playlists WHERE user_id = ? AND is_public = true",
    avgTime: 180, // ms
    calls: 78,
    lastExecuted: "5 minutes ago",
    hasIndex: true
  }
];

// Mock endpoint performance
const endpointPerformance = [
  { 
    endpoint: "/api/songs",
    method: "GET",
    avgTime: 145, // ms
    requests: 1245,
    errors: 2,
    cacheHitRate: 92 // percentage
  },
  { 
    endpoint: "/api/artists",
    method: "GET",
    avgTime: 120, // ms
    requests: 876,
    errors: 0,
    cacheHitRate: 88 // percentage
  },
  { 
    endpoint: "/api/songs/:id",
    method: "GET",
    avgTime: 180, // ms
    requests: 2345,
    errors: 5,
    cacheHitRate: 95 // percentage
  },
  { 
    endpoint: "/api/comments",
    method: "POST",
    avgTime: 210, // ms
    requests: 456,
    errors: 8,
    cacheHitRate: 0 // percentage
  },
  { 
    endpoint: "/api/auth/login",
    method: "POST",
    avgTime: 250, // ms
    requests: 345,
    errors: 12,
    cacheHitRate: 0 // percentage
  }
];

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState("24h")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate refreshing performance data
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Performance data refreshed");
    }, 1000);
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
        <SiteHeader title="Performance Monitoring" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
              <p className="text-muted-foreground">
                Monitor API and database performance metrics
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <IconCalendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
                <IconRefresh className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Key performance metrics for the last {timeRange === "1h" ? "hour" : 
                                                     timeRange === "6h" ? "6 hours" : 
                                                     timeRange === "24h" ? "24 hours" : 
                                                     timeRange === "7d" ? "7 days" : "30 days"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.avgResponseTime} ms</div>
                    <div className="flex items-center mt-2">
                      <IconClockHour4 className="h-4 w-4 text-muted-foreground mr-1" />
                      <p className="text-xs text-muted-foreground">
                        P95: {performanceData.p95ResponseTime} ms | P99: {performanceData.p99ResponseTime} ms
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Requests / Minute</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.requestsPerMinute}</div>
                    <div className="flex items-center mt-2">
                      <IconChartLine className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-xs text-green-500">
                        +12% from yesterday
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.errorRate}%</div>
                    <div className="flex items-center mt-2">
                      <IconAlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                      <p className="text-xs text-amber-500">
                        {performanceData.errorRate > 1 ? "Above threshold" : "Within acceptable range"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.activeUsers}</div>
                    <div className="flex items-center mt-2">
                      <IconChartLine className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-xs text-blue-500">
                        Currently online
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.cpuUsage}%</div>
                    <Progress value={performanceData.cpuUsage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Server load is {performanceData.cpuUsage < 50 ? "normal" : performanceData.cpuUsage < 80 ? "moderate" : "high"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.memoryUsage}%</div>
                    <Progress value={performanceData.memoryUsage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {performanceData.memoryUsage < 60 ? "Sufficient memory available" : "Consider optimization"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Database Connections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.databaseConnections} / 100</div>
                    <Progress value={(performanceData.databaseConnections / 100) * 100} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {performanceData.databaseConnections < 50 ? "Connection pool healthy" : "Consider increasing pool size"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Endpoint Performance */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
              <CardDescription>
                Response times and error rates by endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Cache Hit Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpointPerformance.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          endpoint.method === "GET" ? "bg-blue-50 text-blue-600 border-blue-200" :
                          endpoint.method === "POST" ? "bg-green-50 text-green-600 border-green-200" :
                          endpoint.method === "PUT" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-red-50 text-red-600 border-red-200"
                        }>
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell className={
                        endpoint.avgTime < 150 ? "text-green-600" :
                        endpoint.avgTime < 250 ? "text-amber-600" : "text-red-600"
                      }>
                        {endpoint.avgTime} ms
                      </TableCell>
                      <TableCell>{endpoint.requests.toLocaleString()}</TableCell>
                      <TableCell className={endpoint.errors > 0 ? "text-red-600" : ""}>
                        {endpoint.errors} ({((endpoint.errors / endpoint.requests) * 100).toFixed(2)}%)
                      </TableCell>
                      <TableCell>
                        {endpoint.cacheHitRate > 0 ? `${endpoint.cacheHitRate}%` : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Slow Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Slow Database Queries</CardTitle>
              <CardDescription>
                Database queries taking longer than expected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Query</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Last Executed</TableHead>
                    <TableHead>Index Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slowQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{query.query}</TableCell>
                      <TableCell className={
                        query.avgTime < 200 ? "text-green-600" :
                        query.avgTime < 300 ? "text-amber-600" : "text-red-600"
                      }>
                        {query.avgTime} ms
                      </TableCell>
                      <TableCell>{query.calls}</TableCell>
                      <TableCell>{query.lastExecuted}</TableCell>
                      <TableCell>
                        {query.hasIndex ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                <IconDatabase className="mr-2 h-4 w-4" />
                View Query Analyzer
              </Button>
            </CardFooter>
          </Card>

          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Suggested improvements based on performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-start">
                    <IconDatabase className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Add index for tags search</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create a GIN index on the tags column to improve performance of tag-based searches.
                      </p>
                      <pre className="mt-2 rounded-md bg-muted p-2 text-xs">
                        CREATE INDEX idx_songs_tags ON songs USING GIN (tags);
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-start">
                    <IconCpu className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Optimize title search query</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use a trigram index for text search instead of ILIKE for better performance.
                      </p>
                      <pre className="mt-2 rounded-md bg-muted p-2 text-xs">
                        CREATE INDEX idx_songs_title_trigram ON songs USING GIN (title gin_trgm_ops);
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-start">
                    <IconClockHour4 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Increase cache TTL for chord diagrams</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Chord diagrams rarely change. Consider increasing the cache TTL from 24 hours to 7 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
