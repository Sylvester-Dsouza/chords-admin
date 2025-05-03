"use client"

import { useState, useEffect } from "react"
import { getAuth } from "firebase/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconShieldLock,
  IconCpu,
  IconDatabase,
  IconRefresh,
  IconDownload,
  IconChartLine,
  IconUsers,
  IconBan,
  IconKey,
  IconAlertCircle,
  IconClock,
  IconCloud
} from "@tabler/icons-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { SystemMonitoringService } from "@/services/system-monitoring.service"

// Define interfaces for system monitoring data
interface SystemData {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
}

interface RequestsData {
  total: number;
  perMinute: number;
  byEndpoint: {
    songs: number;
    artists: number;
    collections: number;
    auth: number;
    admin: number;
    other: number;
  };
}

interface ErrorsData {
  total: number;
  rate: number;
  by4xx: number;
  by5xx: number;
}

interface ResponseTimesData {
  average: number;
  p95: number;
  p99: number;
  byEndpoint: {
    songs: number;
    artists: number;
    collections: number;
    auth: number;
    admin: number;
    other: number;
  };
}

interface DatabaseData {
  connections: number;
}

interface UsersData {
  active: number;
}

interface CacheMemoryData {
  used: string;
  max: string;
  percentage: number;
}

interface CacheKeysData {
  total: number;
  expires: number;
  persistent: number;
}

interface CacheData {
  available: boolean;
  hitRate: number;
  memory: CacheMemoryData;
  keys: CacheKeysData;
}

interface SecurityData {
  blockedIps: number;
  tokenRotations: number;
}

interface SystemMonitoringData {
  system: SystemData;
  requests: RequestsData;
  errors: ErrorsData;
  responseTimes: ResponseTimesData;
  database: DatabaseData;
  users: UsersData;
  cache: CacheData;
  security: SecurityData;
}

// Default data structure for system monitoring
const defaultData: SystemMonitoringData = {
  system: {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    uptime: '0d 0h 0m',
  },
  requests: {
    total: 0,
    perMinute: 0,
    byEndpoint: {
      songs: 0,
      artists: 0,
      collections: 0,
      auth: 0,
      admin: 0,
      other: 0,
    },
  },
  errors: {
    total: 0,
    rate: 0,
    by4xx: 0,
    by5xx: 0,
  },
  responseTimes: {
    average: 0,
    p95: 0,
    p99: 0,
    byEndpoint: {
      songs: 0,
      artists: 0,
      collections: 0,
      auth: 0,
      admin: 0,
      other: 0,
    },
  },
  database: {
    connections: 0,
  },
  users: {
    active: 0,
  },
  cache: {
    available: false,
    hitRate: 0,
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
  },
  security: {
    blockedIps: 0,
    tokenRotations: 0,
  },
}

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("performance")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState<SystemMonitoringData>(defaultData)
  const [error, setError] = useState<string | null>(null)

  // Load data from API
  const loadData = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      // Show a loading toast
      toast.loading("Loading system data...", {
        id: "system-loading",
        duration: 5000
      })

      // Get performance metrics
      const performanceData = await SystemMonitoringService.getPerformanceMetrics()

      // Get cache metrics
      const cacheData = await SystemMonitoringService.getCacheMetrics()

      // Combine data
      setData({
        ...performanceData,
        cache: cacheData,
      })

      // Dismiss loading toast and show success
      toast.dismiss("system-loading")
      toast.success("System data refreshed")
    } catch (err) {
      console.error("Error loading system data:", err)
      toast.dismiss("system-loading")
      toast.error("Failed to load system data")
      setError("Failed to load system data. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadData()

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="System Monitoring" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
              <p className="text-muted-foreground">
                Monitor performance, caching, and security metrics
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadData} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Display error if any */}
          {error && (
            <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-600">
              <div className="flex items-center">
                <IconAlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
              <div className="mt-2 text-sm">
                <details>
                  <summary>Debug Information</summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
                    <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}</p>
                    <p>Auth Status: {typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') ? 'Authenticated (localStorage)' : 'Not authenticated'}</p>
                    <p>Auth Cookie: {typeof document !== 'undefined' && document.cookie.includes('isAuthenticated=true') ? 'Present' : 'Not present'}</p>
                    <p>Token in Session Storage: {typeof window !== 'undefined' && sessionStorage.getItem('firebaseIdToken') ? 'Present' : 'Not present'}</p>
                    <button
                      className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                      onClick={() => {
                        // Force token refresh
                        const auth = getAuth();
                        const currentUser = auth.currentUser;
                        if (currentUser) {
                          currentUser.getIdToken(true).then(token => {
                            sessionStorage.setItem('firebaseIdToken', token);
                            alert('Token refreshed: ' + token.substring(0, 10) + '...');
                            // Reload the page
                            window.location.reload();
                          }).catch(err => {
                            alert('Error refreshing token: ' + err.message);
                          });
                        } else {
                          alert('No current user found');
                        }
                      }}
                    >
                      Force Token Refresh
                    </button>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Tabs for different monitoring aspects */}
          <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
              <TabsTrigger value="performance">
                <IconCpu className="mr-2 h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="caching">
                <IconDatabase className="mr-2 h-4 w-4" />
                Caching
              </TabsTrigger>
              <TabsTrigger value="security">
                <IconShieldLock className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              {/* System resource metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.system?.cpuUsage || 0}%</div>
                    <Progress value={data.system?.cpuUsage || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Server load is {(data.system?.cpuUsage || 0) < 50 ? "normal" : (data.system?.cpuUsage || 0) < 80 ? "moderate" : "high"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.system?.memoryUsage || 0}%</div>
                    <Progress value={data.system?.memoryUsage || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {(data.system?.memoryUsage || 0) < 60 ? "Sufficient memory available" : "Consider optimization"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.system?.diskUsage || 0}%</div>
                    <Progress value={data.system?.diskUsage || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {(data.system?.diskUsage || 0) < 70 ? "Sufficient space available" : "Consider cleanup"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(data.requests?.total || 0).toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <IconChartLine className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-xs text-green-500">
                        {data.requests?.perMinute || 0} req/min
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Response time metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Metrics</CardTitle>
                  <CardDescription>
                    Average response times for different API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Songs API</span>
                        <span className="text-sm text-muted-foreground">{data.responseTimes?.byEndpoint?.songs || 0}ms</span>
                      </div>
                      <Progress value={((data.responseTimes?.byEndpoint?.songs || 0) / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Artists API</span>
                        <span className="text-sm text-muted-foreground">{data.responseTimes?.byEndpoint?.artists || 0}ms</span>
                      </div>
                      <Progress value={((data.responseTimes?.byEndpoint?.artists || 0) / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Collections API</span>
                        <span className="text-sm text-muted-foreground">{data.responseTimes?.byEndpoint?.collections || 0}ms</span>
                      </div>
                      <Progress value={((data.responseTimes?.byEndpoint?.collections || 0) / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Auth API</span>
                        <span className="text-sm text-muted-foreground">{data.responseTimes?.byEndpoint?.auth || 0}ms</span>
                      </div>
                      <Progress value={((data.responseTimes?.byEndpoint?.auth || 0) / 500) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Query Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Database Query Performance</CardTitle>
                  <CardDescription>
                    Most time-consuming database queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                        <div>Query</div>
                        <div>Avg. Time</div>
                        <div>Calls</div>
                        <div>Index Used</div>
                      </div>
                      <div className="divide-y">
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">findAllSongsWithFilters</div>
                          <div className="text-sm">{data.responseTimes?.average || 0}ms</div>
                          <div className="text-sm">342</div>
                          <div className="text-sm">Yes</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">getCommentsByPostId</div>
                          <div className="text-sm">{data.responseTimes?.p95 || 0}ms</div>
                          <div className="text-sm">156</div>
                          <div className="text-sm">Yes</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">searchSongsByText</div>
                          <div className="text-sm">{data.responseTimes?.p99 || 0}ms</div>
                          <div className="text-sm">89</div>
                          <div className="text-sm">No</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Caching Tab */}
            <TabsContent value="caching" className="space-y-6">
              {/* Cache metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.cache?.hitRate || 0}%</div>
                    <Progress value={data.cache?.hitRate || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {(data.cache?.hitRate || 0) > 75 ? "Excellent" : (data.cache?.hitRate || 0) > 50 ? "Good" : "Needs improvement"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Redis Memory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.cache?.memory?.used || '0 MB'}</div>
                    <div className="flex items-center mt-2">
                      <IconCloud className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-xs text-muted-foreground">
                        {data.cache?.memory?.percentage || 0}% utilized
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.cache?.keys?.total?.toLocaleString() || 0}</div>
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
                    <CardTitle className="text-sm font-medium">Avg. TTL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15 min</div>
                    <div className="flex items-center mt-2">
                      <IconClock className="h-4 w-4 text-muted-foreground mr-1" />
                      <p className="text-xs text-muted-foreground">
                        Average time-to-live
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cache performance by type */}
              <Card>
                <CardHeader>
                  <CardTitle>Cache Performance by Type</CardTitle>
                  <CardDescription>
                    Hit rates for different types of cached content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Songs</span>
                        <span className="text-sm text-muted-foreground">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Artists</span>
                        <span className="text-sm text-muted-foreground">88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Chord Diagrams</span>
                        <span className="text-sm text-muted-foreground">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Auth Tokens</span>
                        <span className="text-sm text-muted-foreground">76%</span>
                      </div>
                      <Progress value={76} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cache invalidations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Cache Invalidations</CardTitle>
                  <CardDescription>
                    Cache keys that were recently invalidated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                      <div>Cache Key</div>
                      <div>Type</div>
                      <div>Invalidated At</div>
                      <div>Reason</div>
                    </div>
                    <div className="divide-y">
                      <div className="grid grid-cols-4 gap-4 p-4">
                        <div className="text-sm">song:a1b2c3d4</div>
                        <div className="text-sm">Song</div>
                        <div className="text-sm">2 minutes ago</div>
                        <div className="text-sm">Content update</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 p-4">
                        <div className="text-sm">songs:list</div>
                        <div className="text-sm">Song List</div>
                        <div className="text-sm">5 minutes ago</div>
                        <div className="text-sm">New song added</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 p-4">
                        <div className="text-sm">chord:C_guitar</div>
                        <div className="text-sm">Chord Diagram</div>
                        <div className="text-sm">1 hour ago</div>
                        <div className="text-sm">Manual refresh</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              {/* Security metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.users?.active || 0}</div>
                    <div className="flex items-center mt-2">
                      <IconUsers className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-xs text-muted-foreground">
                        Currently logged in
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.security?.blockedIps || 0}</div>
                    <div className="flex items-center mt-2">
                      <IconBan className="h-4 w-4 text-red-500 mr-1" />
                      <p className="text-xs text-muted-foreground">
                        Due to rate limit violations
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.errors?.rate || 0}%</div>
                    <div className="flex items-center mt-2">
                      <IconAlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                      <p className="text-xs text-amber-500">
                        {(data.errors?.rate || 0) > 1 ? "Requires attention" : "All clear"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Token Rotations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.security?.tokenRotations || 0}</div>
                    <div className="flex items-center mt-2">
                      <IconRefresh className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-xs text-muted-foreground">
                        In the last 24 hours
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Audit logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Audit Logs</CardTitle>
                  <CardDescription>
                    Security-related events from the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                      <div>Time</div>
                      <div>Action</div>
                      <div>User</div>
                      <div>IP Address</div>
                      <div>Severity</div>
                    </div>
                    <div className="divide-y">
                      <div className="grid grid-cols-5 gap-4 p-4">
                        <div className="text-sm">2 min ago</div>
                        <div className="text-sm">User login</div>
                        <div className="text-sm">john.doe@example.com</div>
                        <div className="text-sm">192.168.1.1</div>
                        <div className="text-sm text-green-500">Info</div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 p-4">
                        <div className="text-sm">15 min ago</div>
                        <div className="text-sm">Failed login attempt</div>
                        <div className="text-sm">unknown</div>
                        <div className="text-sm">203.0.113.42</div>
                        <div className="text-sm text-amber-500">Warning</div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 p-4">
                        <div className="text-sm">1 hour ago</div>
                        <div className="text-sm">Suspicious request pattern</div>
                        <div className="text-sm">anonymous</div>
                        <div className="text-sm">198.51.100.23</div>
                        <div className="text-sm text-red-500">Critical</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate limiting */}
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limiting Status</CardTitle>
                  <CardDescription>
                    Current rate limits and violations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Anonymous Tier</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <span className="text-sm">Limit:</span>
                            <span className="text-sm font-medium">30 req/min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Current Usage:</span>
                            <span className="text-sm font-medium">42%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Violations:</span>
                            <span className="text-sm font-medium">8 today</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Free Tier</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <span className="text-sm">Limit:</span>
                            <span className="text-sm font-medium">60 req/min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Current Usage:</span>
                            <span className="text-sm font-medium">28%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Violations:</span>
                            <span className="text-sm font-medium">3 today</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Premium Tier</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <span className="text-sm">Limit:</span>
                            <span className="text-sm font-medium">240 req/min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Current Usage:</span>
                            <span className="text-sm font-medium">12%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Violations:</span>
                            <span className="text-sm font-medium">0 today</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Admin Tier</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <span className="text-sm">Limit:</span>
                            <span className="text-sm font-medium">1000 req/min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Current Usage:</span>
                            <span className="text-sm font-medium">5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Violations:</span>
                            <span className="text-sm font-medium">0 today</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
