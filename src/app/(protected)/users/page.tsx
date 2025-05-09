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
  IconShield,
  IconEdit,
  IconEye,
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import userService, { User, UserRole } from "@/services/user.service"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    email: true,
    role: true,
    status: true,
    lastLogin: true,
    createdAt: true,
  })

  // Fetch users from the API
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await userService.getAllUsers()
        setUsers(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch users:', err)
        setError('Failed to load users. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Delete user function
  const deleteUser = async (userId: string) => {
    try {
      if (confirm('Are you sure you want to delete this user?')) {
        await userService.deleteUser(userId)
        setUsers(users.filter(user => user.id !== userId))
        toast.success('User deleted successfully')
      }
    } catch (err) {
      console.error('Failed to delete user:', err)
      toast.error('Failed to delete user')
    }
  }

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  // Toggle all users selection
  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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
        <SiteHeader title="Admin Users" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
              <p className="text-muted-foreground">
                Manage admin users and their permissions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Import Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-users')?.click()}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <input
                id="import-users"
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

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/import/csv`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                      body: formData,
                    });

                    if (!response.ok) {
                      throw new Error('Failed to import users');
                    }

                    const result = await response.json();

                    toast.success(`Imported ${result.imported} users. ${result.errors?.length || 0} errors.`);

                    // Refresh the users list
                    setLoading(true);
                    userService.getAllUsers()
                      .then(data => {
                        setUsers(data);
                        setError(null);
                      })
                      .catch(err => {
                        console.error('Failed to fetch users:', err);
                        setError('Failed to load users. Please try again later.');
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  } catch (error) {
                    console.error('Error importing users:', error);
                    toast.error("Failed to import users. Please try again.");
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

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/export/csv`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) {
                      throw new Error('Failed to export users');
                    }

                    // Get the CSV data
                    const csvData = await response.text();

                    // Create a blob and download link
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast.success("Users exported successfully.");
                  } catch (error) {
                    console.error('Error exporting users:', error);
                    toast.error("Failed to export users. Please try again.");
                  }
                }}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/users/new')}
              >
                <IconUserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : users.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : users.filter(user => user.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : users.length > 0 ?
                    `${Math.round((users.filter(user => user.isActive).length / users.length) * 100)}% of total users` :
                    'No users'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : users.filter(user => user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : users.length > 0 ?
                    `${Math.round((users.filter(user => user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN).length / users.length) * 100)}% of users` :
                    'No users'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : users.filter(user => {
                    if (!user.lastLoginAt) return false;
                    const now = new Date();
                    const lastLogin = user.lastLoginAt instanceof Date ? user.lastLoginAt : new Date(user.lastLoginAt);
                    const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  In the last 7 days
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
                    placeholder="Search admin users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-[300px]"
                  />
                  <Button variant="outline" size="sm" className="h-9">
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <IconFilter className="mr-2 h-4 w-4" />
                        Columns
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
                        checked={visibleColumns.role}
                        onCheckedChange={(checked) =>
                          setVisibleColumns({ ...visibleColumns, role: checked })
                        }
                      >
                        Role
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
                  {selectedUsers.length > 0 && (
                    <Button variant="destructive" size="sm" className="h-9">
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete ({selectedUsers.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="ml-3">Loading users...</span>
              </div>
            )}

            {/* Table */}
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredUsers.length > 0 &&
                          selectedUsers.length === filteredUsers.length
                        }
                        onCheckedChange={toggleAllUsers}
                        aria-label="Select all admin users"
                      />
                    </TableHead>
                    {visibleColumns.name && <TableHead>Name</TableHead>}
                    {visibleColumns.email && <TableHead>Email</TableHead>}
                    {visibleColumns.role && <TableHead>Role</TableHead>}
                    {visibleColumns.status && <TableHead>Status</TableHead>}
                    {visibleColumns.lastLogin && <TableHead>Last Login</TableHead>}
                    {visibleColumns.createdAt && <TableHead>Created</TableHead>}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          1 +
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="h-24 text-center"
                      >
                        No admin users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            aria-label={`Select ${user.name || user.email}`}
                          />
                        </TableCell>
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <IconUser className="mr-2 h-4 w-4 text-muted-foreground" />
                              {user.name || 'No Name'}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.email && (
                          <TableCell>
                            <div className="flex items-center">
                              <IconMail className="mr-2 h-4 w-4 text-muted-foreground" />
                              {user.email}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.role && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.role === UserRole.SUPER_ADMIN
                                  ? "border-red-500 text-red-500"
                                  : user.role === UserRole.ADMIN
                                  ? "border-blue-500 text-blue-500"
                                  : user.role === UserRole.CONTRIBUTOR
                                  ? "border-green-500 text-green-500"
                                  : "border-yellow-500 text-yellow-500"
                              }
                            >
                              {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && <IconShield className="mr-1 h-3 w-3" />}
                              {user.role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`h-2 w-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-300"}`}></div>
                              <span>{user.isActive ? "Active" : "Inactive"}</span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.lastLogin && (
                          <TableCell>
                            {user.lastLoginAt ? (
                              <div className="flex flex-col">
                                <span>{formatDate(new Date(user.lastLoginAt))}</span>
                                <span className="text-xs text-muted-foreground">{formatTime(new Date(user.lastLoginAt))}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell>{formatDate(new Date(user.createdAt))}</TableCell>
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
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/users/${user.id}/edit`)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem onClick={() => router.push(`/users/${user.id}`)}>
                                <IconEye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuCheckboxItem>
                              <Separator />
                              <DropdownMenuCheckboxItem onClick={() => deleteUser(user.id)}>
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
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-sm text-muted-foreground">
                Showing <strong>1</strong> to <strong>{filteredUsers.length}</strong> of{" "}
                <strong>{filteredUsers.length}</strong> admin users
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
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
