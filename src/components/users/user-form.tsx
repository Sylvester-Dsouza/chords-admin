"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
  IconUser,
  IconLock,
  IconMail,
  IconShield,
  IconToggleRight,
  IconEye,
  IconEyeOff,
  IconBrandFirebase,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import userService, { User, CreateUserDto, UpdateUserDto, UserRole } from "@/services/user.service"

interface UserFormProps {
  mode: 'create' | 'edit'
  initialData?: User
  title: string
}

export default function UserForm({ mode, initialData, title }: UserFormProps) {
  // Form state
  const [formState, setFormState] = React.useState({
    email: initialData?.email || "",
    name: initialData?.name || "",
    password: "", // Only used for create mode
    confirmPassword: "", // Only used for create mode
    firebaseUid: initialData?.firebaseUid || "",
    role: initialData?.role || UserRole.EDITOR,
    isActive: initialData?.isActive !== false, // Default to true if not specified
    createFirebaseUser: true, // Default to true for new users
  })

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)

  // Password validation for Firebase user creation
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // Validate password match
  React.useEffect(() => {
    if (mode === 'create' && formState.createFirebaseUser && formState.password && formState.confirmPassword) {
      if (formState.password !== formState.confirmPassword) {
        setPasswordError("Passwords do not match")
      } else {
        setPasswordError(null)
      }
    }
  }, [formState.password, formState.confirmPassword, formState.createFirebaseUser, mode])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (mode === 'create') {
        if (!formState.email) {
          throw new Error("Email is required")
        }
        if (!formState.name) {
          throw new Error("Name is required")
        }
        // Validate password if creating Firebase user
        if (formState.createFirebaseUser) {
          if (!formState.password) {
            throw new Error("Password is required when creating a Firebase user")
          }
          if (formState.password !== formState.confirmPassword) {
            throw new Error("Passwords do not match")
          }
          if (formState.password.length < 6) {
            throw new Error("Password must be at least 6 characters long")
          }
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formState.email)) {
          throw new Error("Please enter a valid email address")
        }
      }

      // Prepare the data
      let userData: CreateUserDto | UpdateUserDto

      if (mode === 'create') {
        userData = {
          email: formState.email,
          name: formState.name,
          password: formState.createFirebaseUser ? formState.password : undefined,
          firebaseUid: formState.firebaseUid || undefined,
          role: formState.role,
          isActive: formState.isActive,
          createFirebaseUser: formState.createFirebaseUser,
        }
      } else {
        userData = {
          name: formState.name || undefined,
          firebaseUid: formState.firebaseUid || undefined,
          role: formState.role,
          isActive: formState.isActive,
        }
      }

      console.log('Submitting user data:', JSON.stringify(userData, null, 2))

      let result
      if (mode === 'create') {
        // Create new user
        result = await userService.createUser(userData as CreateUserDto)
        console.log('User created successfully:', result)
        toast.success("User created successfully", {
          description: `${formState.email} has been added as a ${formState.role.toLowerCase().replace('_', ' ')}.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      } else {
        // Update existing user
        if (!initialData?.id) {
          throw new Error("User ID is missing for update")
        }
        result = await userService.updateUser(initialData.id, userData as UpdateUserDto)
        console.log('User updated successfully:', result)
        toast.success("User updated successfully", {
          description: `${initialData.email} has been updated.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      }

      // Redirect to users list
      router.push("/users")
    } catch (err: any) {
      console.error(`Failed to ${mode} user:`, err)
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)

        // Handle array of error messages
        let errorMessage = err.response.data?.message;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(', ');
        }

        setError(`Failed to ${mode} user: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} user: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} user: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
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
        <SiteHeader title={title} />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/users")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (mode === 'create' && formState.createFirebaseUser && !!passwordError)}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save User"}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Basic information about the user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <IconMail className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="user@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        disabled={mode === 'edit'} // Email can't be changed in edit mode
                        required={mode === 'create'}
                        className="border-0 focus-visible:ring-0"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The user's email address will be used for login
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <IconUser className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                        className="border-0 focus-visible:ring-0"
                        required={mode === 'create'}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The user's full name
                    </p>
                  </div>

                  {mode === 'create' && (
                    <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <IconBrandFirebase className="mr-2 h-4 w-4 text-orange-500" />
                          <Label htmlFor="createFirebaseUser">Create Firebase User</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Create a corresponding user in Firebase Authentication
                        </p>
                      </div>
                      <Switch
                        id="createFirebaseUser"
                        checked={formState.createFirebaseUser}
                        onCheckedChange={(checked) => setFormState({...formState, createFirebaseUser: checked})}
                      />
                    </div>
                  )}

                  {mode === 'create' && formState.createFirebaseUser && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                            <IconLock className="ml-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={formState.password}
                              onChange={(e) => setFormState({...formState, password: e.target.value})}
                              required
                              className="border-0 focus-visible:ring-0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <IconEyeOff className="h-4 w-4" />
                            ) : (
                              <IconEye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Password must be at least 6 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                            <IconLock className="ml-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={formState.confirmPassword}
                              onChange={(e) => setFormState({...formState, confirmPassword: e.target.value})}
                              required
                              className="border-0 focus-visible:ring-0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <IconEyeOff className="h-4 w-4" />
                            ) : (
                              <IconEye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                        {passwordError && (
                          <p className="text-sm text-destructive">{passwordError}</p>
                        )}
                      </div>
                    </>
                  )}

                  {mode === 'edit' && (
                    <div className="space-y-2">
                      <Label htmlFor="firebaseUid">Firebase UID (Optional)</Label>
                      <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                        <IconLock className="ml-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firebaseUid"
                          placeholder="Firebase User ID"
                          value={formState.firebaseUid}
                          onChange={(e) => setFormState({...formState, firebaseUid: e.target.value})}
                          className="border-0 focus-visible:ring-0"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The Firebase User ID if available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Settings</CardTitle>
                  <CardDescription>
                    Role and status settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <IconShield className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={formState.role}
                        onValueChange={(value) => setFormState({...formState, role: value as UserRole})}
                      >
                        <SelectTrigger className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                          <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                          <SelectItem value={UserRole.CONTRIBUTOR}>Contributor</SelectItem>
                          <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Super Admin: Full access to all features and settings<br />
                      Admin: Access to most features and settings<br />
                      Contributor: Can create and edit content<br />
                      Editor: Limited editing capabilities
                    </p>
                  </div>



                  <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {formState.isActive ? "User is active and can log in" : "User is inactive and cannot log in"}
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formState.isActive}
                      onCheckedChange={(checked) => setFormState({...formState, isActive: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || (mode === 'create' && formState.createFirebaseUser && !!passwordError)}
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save User"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
