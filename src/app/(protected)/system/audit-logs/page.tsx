"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SystemMonitoringService } from "@/services/system-monitoring.service"
import { toast } from "sonner"
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

// Define audit log interface
interface AuditLog {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  action: string;
  userId: string | null;
  targetId: string | null;
  targetType: string | null;
  ip: string | null;
  userAgent: string | null;
  details: any;
}

// Define pagination interface
interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [severityFilter, setSeverityFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load audit logs from API
  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, typeFilter, severityFilter]);

  // Load audit logs from API
  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filters
      const filters: Record<string, string> = {};

      if (typeFilter !== "ALL") {
        filters.type = typeFilter;
      }

      if (severityFilter !== "ALL") {
        filters.severity = severityFilter;
      }

      // Get audit logs from API
      const response = await SystemMonitoringService.getAuditLogs(
        currentPage,
        itemsPerPage,
        filters
      );

      // Update state
      setAuditLogs(response.logs || []);
      setPagination(response.pagination || {
        page: currentPage,
        limit: itemsPerPage,
        total: response.logs?.length || 0,
        pages: Math.ceil((response.logs?.length || 0) / itemsPerPage)
      });
    } catch (err: any) {
      console.error("Error loading audit logs:", err);

      // Check if it's a network error
      if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
        setError("Cannot connect to the API server. Please check if the API server is running and accessible.");
        toast.error("API connection error. Please check if the API server is running.");
      } else if (err.response?.status === 401) {
        setError("Authentication error. Please log in again.");
        toast.error("Authentication error");
        // Don't redirect here - the auth context will handle that
      } else {
        setError("Failed to load audit logs. Please try again.");
        toast.error("Failed to load audit logs");
      }

      setAuditLogs([]);
      setPagination({
        page: 1,
        limit: itemsPerPage,
        total: 0,
        pages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    loadAuditLogs();
  };

  // Filter logs based on search term
  const filteredLogs = auditLogs.filter(log => {
    if (searchTerm === "") return true;

    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip && log.ip.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={applyFilters}
                    disabled={loading}
                  >
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
                {loading ? "Loading audit logs..." :
                 error ? "Error loading audit logs" :
                 `Showing ${filteredLogs.length} of ${pagination.total} logs`}
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

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-3">Loading audit logs...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-12 text-red-500">
                    <IconAlertCircle className="h-6 w-6 mr-2" />
                    <span>{error}</span>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="flex justify-center items-center py-12 text-muted-foreground">
                    <IconAlertCircle className="h-6 w-6 mr-2" />
                    <span>No audit logs found</span>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLogs.map((log) => (
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
                )}
              </div>

              {/* Pagination */}
              {!loading && !error && pagination.pages > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {/* Generate pagination links */}
                      {Array.from({ length: pagination.pages }).map((_, i) => {
                        // Only show 5 pages at a time
                        if (
                          i === 0 || // First page
                          i === pagination.pages - 1 || // Last page
                          (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current page
                        ) {
                          return (
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
                          );
                        }

                        // Show ellipsis for skipped pages
                        if (
                          (i === 1 && currentPage > 3) || // Ellipsis after first page
                          (i === pagination.pages - 2 && currentPage < pagination.pages - 2) // Ellipsis before last page
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < pagination.pages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage === pagination.pages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
