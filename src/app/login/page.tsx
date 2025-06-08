"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconEye, IconEyeOff, IconLogin, IconMusic, IconAlertCircle } from "@tabler/icons-react"

import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading, error, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [tokenExpiredMessage, setTokenExpiredMessage] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Check for token expiration or refresh failure
  useEffect(() => {
    // Check URL parameters for token expiration
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('expired') === 'true') {
      setTokenExpiredMessage('Your session has expired. Please sign in again.');
    } else if (searchParams.get('refresh_failed') === 'true') {
      setTokenExpiredMessage('Unable to refresh your session. Please sign in again.');
    }

    // Check session storage for token expiration
    const tokenExpired = sessionStorage.getItem('tokenExpired');
    const tokenRefreshFailed = sessionStorage.getItem('tokenRefreshFailed');

    if (tokenExpired) {
      setTokenExpiredMessage('Your session has expired. Please sign in again.');
      sessionStorage.removeItem('tokenExpired');
    } else if (tokenRefreshFailed) {
      setTokenExpiredMessage('Unable to refresh your session. Please sign in again.');
      sessionStorage.removeItem('tokenRefreshFailed');
    }

    // Clear any expired tokens
    sessionStorage.removeItem('firebaseIdToken');
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="rounded-full bg-primary/10 p-4 mb-2">
            <IconMusic className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Stuthi</h1>
          <p className="text-muted-foreground">Admin Dashboard</p>
        </div>

        <Card className="w-full border-2 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {tokenExpiredMessage && (
                <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{tokenExpiredMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
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
              </div>
              <div className="flex items-center space-x-2 pt-2 pb-4">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-medium">
                  Remember me for 30 days
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <IconLogin className="h-4 w-4" />
                    <span>Sign in</span>
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <span>Don't have an account? Contact your administrator</span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
