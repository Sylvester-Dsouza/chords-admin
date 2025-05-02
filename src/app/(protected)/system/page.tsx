"use client"

import { useState, useEffect } from "react"
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
  IconServer,
  IconShieldLock,
  IconAlertTriangle,
  IconCpu,
  IconDatabase,
  IconRefresh,
  IconDownload,
  IconChartLine,
  IconClockHour4,
  IconUsers,
  IconBan,
  IconKey,
  IconEye,
  IconAlertCircle,
  IconDeviceDesktop,
  IconClock,
  IconCloud
} from "@tabler/icons-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

// Mock data for system monitoring
const systemData = {
  cpu: 32,
  memory: 45,
  disk: 28,
  requests: 1243,
  cacheHitRate: 78,
  avgResponseTime: 120, // in ms
  activeUsers: 156,
  blockedIps: 12,
  securityAlerts: 3,
  auditLogs: 1245,
  tokenRotations: 87,
  suspiciousActivities: 5
}

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("performance")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState(systemData)

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate API call delay
    setTimeout(() => {
      // Generate slightly different values for demonstration
      setData({
        ...data,
        cpu: Math.min(100, Math.max(10, data.cpu + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))),
        memory: Math.min(100, Math.max(10, data.memory + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))),
        disk: Math.min(100, Math.max(10, data.disk + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2))),
        requests: data.requests + Math.floor(Math.random() * 10),
        cacheHitRate: Math.min(100, Math.max(50, data.cacheHitRate + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))),
        avgResponseTime: Math.max(80, data.avgResponseTime + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10)),
        activeUsers: Math.max(100, data.activeUsers + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)),
        securityAlerts: Math.max(0, data.securityAlerts + (Math.random() > 0.8 ? 1 : 0)),
      })
      setIsRefreshing(false)
      toast.success("System data refreshed")
    }, 1000)
  }

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [data])

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
                    <div className="text-2xl font-bold">{data.cpu}%</div>
                    <Progress value={data.cpu} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Server load is {data.cpu < 50 ? "normal" : data.cpu < 80 ? "moderate" : "high"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.memory}%</div>
                    <Progress value={data.memory} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.memory < 60 ? "Sufficient memory available" : "Consider optimization"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.disk}%</div>
                    <Progress value={data.disk} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.disk < 70 ? "Sufficient space available" : "Consider cleanup"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.requests.toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <IconChartLine className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-xs text-green-500">
                        +12% from yesterday
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
                        <span className="text-sm text-muted-foreground">{data.avgResponseTime - 20}ms</span>
                      </div>
                      <Progress value={((data.avgResponseTime - 20) / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Artists API</span>
                        <span className="text-sm text-muted-foreground">{data.avgResponseTime - 40}ms</span>
                      </div>
                      <Progress value={((data.avgResponseTime - 40) / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Comments API</span>
                        <span className="text-sm text-muted-foreground">{data.avgResponseTime}ms</span>
                      </div>
                      <Progress value={(data.avgResponseTime / 500) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Auth API</span>
                        <span className="text-sm text-muted-foreground">{data.avgResponseTime - 30}ms</span>
                      </div>
                      <Progress value={((data.avgResponseTime - 30) / 500) * 100} className="h-2" />
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
                          <div className="text-sm">{data.avgResponseTime * 0.8}ms</div>
                          <div className="text-sm">342</div>
                          <div className="text-sm">Yes</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">getCommentsByPostId</div>
                          <div className="text-sm">{data.avgResponseTime}ms</div>
                          <div className="text-sm">156</div>
                          <div className="text-sm">Yes</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                          <div className="text-sm">searchSongsByText</div>
                          <div className="text-sm">{data.avgResponseTime * 1.2}ms</div>
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
                    <div className="text-2xl font-bold">{data.cacheHitRate}%</div>
                    <Progress value={data.cacheHitRate} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.cacheHitRate > 75 ? "Excellent" : data.cacheHitRate > 50 ? "Good" : "Needs improvement"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Redis Memory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">256 MB</div>
                    <div className="flex items-center mt-2">
                      <IconCloud className="h-4 w-4 text-blue-500 mr-1" />
                      <p className="text-xs text-muted-foreground">
                        42% utilized
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,245</div>
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
                    <div className="text-2xl font-bold">{data.activeUsers}</div>
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
                    <div className="text-2xl font-bold">{data.blockedIps}</div>
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
                    <div className="text-2xl font-bold">{data.securityAlerts}</div>
                    <div className="flex items-center mt-2">
                      <IconAlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                      <p className="text-xs text-amber-500">
                        {data.securityAlerts > 0 ? "Requires attention" : "All clear"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Token Rotations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.tokenRotations}</div>
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
