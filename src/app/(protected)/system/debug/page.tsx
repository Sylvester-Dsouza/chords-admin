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
import { getAuth } from "firebase/auth"
import { apiClient } from "@/lib/api-client"

export default function DebugPage() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get Firebase auth info
      const auth = getAuth()
      const currentUser = auth.currentUser

      let idToken: string | null = null
      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken(true)
        } catch (tokenError) {
          console.error('Error getting token:', tokenError)
        }
      }

      // Get stored token
      const storedToken: string | null = typeof window !== 'undefined' ? sessionStorage.getItem('firebaseIdToken') : null

      // Get auth cookie
      const isAuthCookie = document.cookie.includes('isAuthenticated=true')

      // Get localStorage auth flag
      const isAuthLocalStorage = localStorage.getItem('isAuthenticated') === 'true'

      setAuthInfo({
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified,
          isAnonymous: currentUser.isAnonymous,
          metadata: {
            creationTime: currentUser.metadata.creationTime,
            lastSignInTime: currentUser.metadata.lastSignInTime,
          },
          providerData: currentUser.providerData,
        } : null,
        idToken: idToken ? `${idToken.substring(0, 10)}...` : null,
        idTokenLength: idToken ? idToken.length : 0,
        storedToken: storedToken ? `${storedToken.substring(0, 10)}...` : null,
        storedTokenLength: storedToken ? storedToken.length : 0,
        isAuthCookie,
        isAuthLocalStorage,
      })
    } catch (error) {
      console.error('Error checking auth:', error)
      setError('Error checking auth: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  const testApi = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test both endpoints
      const debugResponse = await apiClient.get('/debug/auth/protected')
      const performanceResponse = await apiClient.get('/admin/system/performance')

      setApiResponse({
        debug: debugResponse.data,
        performance: performanceResponse.data
      })
    } catch (error) {
      console.error('API test error:', error)
      setError('API test error: ' + (error instanceof Error ? error.message : String(error)))

      // Try to extract response data from error
      if (error && (error as any).response) {
        setApiResponse({
          error: true,
          status: (error as any).response.status,
          statusText: (error as any).response.statusText,
          data: (error as any).response.data,
          url: (error as any).config?.url
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    setLoading(true)
    setError(null)

    try {
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (currentUser) {
        const newToken: string = await currentUser.getIdToken(true)
        sessionStorage.setItem('firebaseIdToken', newToken)
        alert(`Token refreshed: ${newToken.substring(0, 10)}...`)

        // Refresh auth info
        await checkAuth()
      } else {
        setError('No current user found')
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      setError('Error refreshing token: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  // Check auth on mount
  useEffect(() => {
    checkAuth()
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
        <SiteHeader title="Debug" />
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Authentication Debug</h1>
              <p className="text-muted-foreground">
                Debug authentication and API connectivity
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={checkAuth} disabled={loading}>
                {loading ? "Checking..." : "Check Auth"}
              </Button>
              <Button variant="outline" size="sm" onClick={testApi} disabled={loading}>
                {loading ? "Testing..." : "Test API"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const response = await apiClient.get('/admin/system');
                    setApiResponse({
                      endpoint: '/admin/system',
                      data: response.data
                    });
                  } catch (error) {
                    console.error('System API error:', error);
                    setError('System API error: ' + (error instanceof Error ? error.message : String(error)));
                    if (error && (error as any).response) {
                      setApiResponse({
                        error: true,
                        endpoint: '/admin/system',
                        status: (error as any).response.status,
                        statusText: (error as any).response.statusText,
                        data: (error as any).response.data
                      });
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? "Testing..." : "Test System API"}
              </Button>
              <Button variant="outline" size="sm" onClick={refreshToken} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh Token"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-600">
              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Info</CardTitle>
                <CardDescription>
                  Current authentication state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                  {authInfo ? JSON.stringify(authInfo, null, 2) : "Loading..."}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Response</CardTitle>
                <CardDescription>
                  Response from the API debug endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                  {apiResponse ? JSON.stringify(apiResponse, null, 2) : "Not tested yet"}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
