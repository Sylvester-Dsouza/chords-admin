"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  IconDownload,
  IconSearch,
  IconFilter,
  IconCalendar,
  IconAlertCircle,
  IconInfoCircle,
  IconAlertTriangle,
  IconX
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

// Mock audit log data
const auditLogs = [
  {
    id: "1",
    timestamp: "2023-05-01T12:34:56Z",
    type: "AUTH",
    severity: "INFO",
    action: "User login",
    userId: "user123",
    targetId: null,
    targetType: null,
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { success: true, method: "password" }
  },
  {
    id: "2",
    timestamp: "2023-05-01T12:30:22Z",
    type: "SECURITY",
    severity: "WARNING",
    action: "Failed login attempt",
    userId: null,
    targetId: null,
    targetType: null,
    ip: "203.0.113.42",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { reason: "Invalid password", attempts: 3 }
  },
  {
    id: "3",
    timestamp: "2023-05-01T11:45:12Z",
    type: "CONTENT",
    severity: "INFO",
    action: "Song updated",
    userId: "admin456",
    targetId: "song789",
    targetType: "song",
    ip: "192.168.1.5",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    details: { fields: ["title", "lyrics"] }
  },
  {
    id: "4",
    timestamp: "2023-05-01T10:22:33Z",
    type: "SECURITY",
    severity: "CRITICAL",
    action: "Suspicious request pattern detected",
    userId: null,
    targetId: null,
    targetType: null,
    ip: "198.51.100.23",
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    details: { patterns: ["SQL injection pattern", "XSS pattern"], path: "/api/songs" }
  },
  {
    id: "5",
    timestamp: "2023-05-01T09:15:44Z",
    type: "ADMIN",
    severity: "INFO",
    action: "User role changed",
    userId: "admin456",
    targetId: "user789",
    targetType: "user",
    ip: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { oldRole: "USER", newRole: "ADMIN" }
  },
  {
    id: "6",
    timestamp: "2023-05-01T08:30:12Z",
    type: "SYSTEM",
    severity: "ERROR",
    action: "Database connection error",
    userId: null,
    targetId: null,
    targetType: null,
    ip: null,
    userAgent: null,
    details: { error: "Connection timeout", database: "main" }
  },
  {
    id: "7",
    timestamp: "2023-05-01T07:45:22Z",
    type: "AUTH",
    severity: "INFO",
    action: "Token refreshed",
    userId: "user123",
    targetId: null,
    targetType: null,
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
    details: { deviceId: "iphone12" }
  },
  {
    id: "8",
    timestamp: "2023-05-01T06:12:33Z",
    type: "SECURITY",
    severity: "WARNING",
    action: "Rate limit exceeded",
    userId: "user456",
    targetId: null,
    targetType: null,
    ip: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { endpoint: "/api/songs", limit: 60, count: 75 }
  },
  {
    id: "9",
    timestamp: "2023-05-01T05:30:44Z",
    type: "CONTENT",
    severity: "INFO",
    action: "Comment created",
    userId: "user789",
    targetId: "song123",
    targetType: "song",
    ip: "192.168.1.20",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    details: { commentId: "comment456" }
  },
  {
    id: "10",
    timestamp: "2023-05-01T04:45:55Z",
    type: "USER",
    severity: "INFO",
    action: "User registered",
    userId: "user999",
    targetId: null,
    targetType: null,
    ip: "192.168.1.25",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { method: "email" }
  }
];

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [severityFilter, setSeverityFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter logs based on search term and filters
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip && log.ip.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "ALL" || log.type === typeFilter;
    const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Paginate logs
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get severity badge
  const getSeverityBadge = (severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'): React.ReactElement => {
    switch (severity) {
      case "INFO":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200"><IconInfoCircle className="h-3 w-3 mr-1" /> Info</Badge>;
      case "WARNING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200"><IconAlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
      case "ERROR":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200"><IconAlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case "CRITICAL":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><IconX className="h-3 w-3 mr-1" /> Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
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
        <SiteHeader title="Audit Logs" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
              <p className="text-muted-foreground">
                View and search security audit logs
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <IconCalendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter audit logs by type, severity, and search terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <IconSearch className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Log Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="AUTH">Authentication</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="CONTENT">Content</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Severities</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button variant="outline" className="w-full">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Showing {paginatedLogs.length} of {filteredLogs.length} logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 gap-4 p-4 font-medium">
                  <div>Timestamp</div>
                  <div>Action</div>
                  <div>User / IP</div>
                  <div>Type</div>
                  <div>Severity</div>
                  <div>Details</div>
                </div>
                <div className="divide-y">
                  {paginatedLogs.map((log) => (
                    <div key={log.id} className="grid grid-cols-6 gap-4 p-4">
                      <div className="text-sm">{formatTimestamp(log.timestamp)}</div>
                      <div className="text-sm font-medium">{log.action}</div>
                      <div className="text-sm">
                        {log.userId ? log.userId : "Anonymous"}
                        <br />
                        <span className="text-xs text-muted-foreground">{log.ip || "N/A"}</span>
                      </div>
                      <div className="text-sm">
                        <Badge variant="outline">{log.type}</Badge>
                      </div>
                      <div className="text-sm">
                        {getSeverityBadge(log.severity as 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL')}
                      </div>
                      <div className="text-sm">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.max(1, currentPage - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.ceil(filteredLogs.length / itemsPerPage) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.min(Math.ceil(filteredLogs.length / itemsPerPage), currentPage + 1));
                        }}
                        className={currentPage === Math.ceil(filteredLogs.length / itemsPerPage) ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
