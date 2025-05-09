"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconDownload,
  IconFilter,
  IconSearch,
  IconUser,
  IconTrash,
  IconMail,
  IconDotsVertical,
  IconUserPlus,
  IconCrown,
  IconCalendarStats,
  IconEye,
  IconPencil,
  IconCheck,
  IconAlertCircle,
  IconUpload,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import customerService, { Customer } from "@/services/customer.service"

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    email: true,
    subscription: true,
    status: true,
    lastLogin: true,
    createdAt: true,
  })

  // Fetch customers on component mount
  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const data = await customerService.getAllCustomers()
        setCustomers(data)
      } catch (err: any) {
        console.error('Failed to fetch customers:', err)
        setError(`Failed to load customers: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get paginated customers
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Toggle customer selection
  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    )
  }

  // Toggle all customers selection
  const toggleAllCustomers = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id))
    } else {
      setSelectedCustomers([])
    }
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format time for display
  const formatTime = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <SiteHeader title="Customers" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <p className="text-muted-foreground">
                Manage customer accounts and subscriptions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Import Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-customers')?.click()}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <input
                id="import-customers"
                type="file"
                accept=".csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  try {
                    // Create FormData
                    const formData = new FormData();
                    formData.append('file', file);

                    // Call API to import data
                    const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
                    if (!token) {
                      throw new Error('Authentication token not found. Please log in again.');
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/import/csv`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                      body: formData,
                    });

                    if (!response.ok) {
                      throw new Error('Failed to import customers');
                    }

                    const result = await response.json();

                    toast.success(`Imported ${result.imported} customers. ${result.errors?.length || 0} errors.`);

                    // Refresh the customers list
                    setLoading(true);
                    customerService.getAllCustomers()
                      .then(data => {
                        setCustomers(data);
                        setError(null);
                      })
                      .catch(err => {
                        console.error('Failed to fetch customers:', err);
                        setError('Failed to load customers. Please try again later.');
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  } catch (error) {
                    console.error('Error importing customers:', error);
                    toast.error("Failed to import customers. Please try again.");
                  } finally {
                    // Reset the file input
                    event.target.value = '';
                  }
                }}
                className="hidden"
              />

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    // Call API to export data
                    const token = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null;
                    if (!token) {
                      throw new Error('Authentication token not found. Please log in again.');
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/export/csv`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) {
                      throw new Error('Failed to export customers');
                    }

                    // Get the CSV data
                    const csvData = await response.text();

                    // Create a blob and download link
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast.success("Customers exported successfully.");
                  } catch (error) {
                    console.error('Error exporting customers:', error);
                    toast.error("Failed to export customers. Please try again.");
                  }
                }}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/customers/new')}
              >
                <IconUserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : customers.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : `${customers.length} total customers`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : customers.filter(customer => customer.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : customers.length > 0 ?
                    `${Math.round((customers.filter(customer => customer.isActive).length / customers.length) * 100)}% of total customers` :
                    'No customers'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Premium Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : customers.filter(customer => customer.isPremium).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : customers.length > 0 ?
                    `${Math.round((customers.filter(customer => customer.isPremium).length / customers.length) * 100)}% of customers` :
                    'No customers'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : customers.filter(customer => {
                    if (!customer.lastLoginAt) return false;
                    const now = new Date();
                    const lastLogin = new Date(customer.lastLoginAt);
                    const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active in the last 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table with filters */}
          <div className="rounded-md border">
            {/* Table filters */}
            <div className="border-b p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page when search changes
                    }}
                    className="h-9 w-full sm:w-[300px]"
                  />
                  <Button variant="outline" size="sm" className="h-9">
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <IconFilter className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.name}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, name: checked })
                        }
                      >
                        Name
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.email}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, email: checked })
                        }
                      >
                        Email
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.subscription}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, subscription: checked })
                        }
                      >
                        Subscription
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.status}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, status: checked })
                        }
                      >
                        Status
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.lastLogin}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, lastLogin: checked })
                        }
                      >
                        Last Login
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.createdAt}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, createdAt: checked })
                        }
                      >
                        Created At
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedCustomers.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
                          // Here you would delete the selected customers
                          toast.success(`${selectedCustomers.length} customer(s) deleted`, {
                            description: 'The selected customers have been deleted.',
                            icon: <IconCheck className="h-4 w-4" />,
                          })
                          setSelectedCustomers([])
                        }
                      }}
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete ({selectedCustomers.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>

          {/* Table content */}
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="ml-3">Loading customers...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                <IconAlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCustomers(filteredCustomers.map(customer => customer.id))
                          } else {
                            setSelectedCustomers([])
                          }
                        }}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {visibleColumns.name && <TableHead>Name</TableHead>}
                    {visibleColumns.email && <TableHead>Email</TableHead>}
                    {visibleColumns.subscription && <TableHead>Subscription</TableHead>}
                    {visibleColumns.status && <TableHead>Status</TableHead>}
                    {visibleColumns.lastLogin && <TableHead>Last Login</TableHead>}
                    {visibleColumns.createdAt && <TableHead>Created At</TableHead>}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() => toggleCustomerSelection(customer.id)}
                            aria-label={`Select ${customer.name || customer.email}`}
                          />
                        </TableCell>
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                              {customer.name || 'No Name'}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.email && (
                          <TableCell>
                            <div className="flex items-center">
                              <IconMail className="mr-2 h-4 w-4 text-muted-foreground" />
                              {customer.email}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.subscription && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                customer.isPremium
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-gray-500 text-gray-500"
                              }
                            >
                              {customer.isPremium && <IconCrown className="mr-1 h-3 w-3" />}
                              {customer.isPremium ? 'Premium' : 'Free'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`h-2 w-2 rounded-full ${customer.isActive ? "bg-green-500" : "bg-gray-300"}`}></div>
                              <span>{customer.isActive ? "Active" : "Inactive"}</span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.lastLogin && (
                          <TableCell>
                            <div className="flex flex-col">
                              {customer.lastLoginAt ? (
                                <>
                                  <span>{formatDate(customer.lastLoginAt)}</span>
                                  <span className="text-xs text-muted-foreground">{formatTime(customer.lastLoginAt)}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Never</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(customer.createdAt)}</span>
                              <span className="text-xs text-muted-foreground">{formatTime(customer.createdAt)}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/customers/${customer.id}/edit`)}>
                                <IconPencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/customers/${customer.id}`)}>
                                <IconEye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuCheckboxItem>
                              <Separator />
                              <DropdownMenuCheckboxItem onClick={() => {
                                if (confirm('Are you sure you want to delete this customer?')) {
                                  // Here you would delete the customer
                                  toast.success('Customer deleted successfully')
                                  setCustomers(customers.filter(c => c.id !== customer.id))
                                }
                              }}>
                                <IconTrash className="mr-2 h-4 w-4 text-destructive" />
                                Delete
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-sm text-muted-foreground">
                {filteredCustomers.length === 0 ? (
                  <span>No customers found</span>
                ) : (
                  <>
                    Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</strong> of{" "}
                    <strong>{filteredCustomers.length}</strong> customers
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || filteredCustomers.length === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= Math.ceil(filteredCustomers.length / itemsPerPage) || filteredCustomers.length === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
