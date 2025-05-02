"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [initialRender, setInitialRender] = useState(true)
  
  // Check if authenticated via cookie or localStorage as a fallback
  const isAuthenticated = typeof document !== 'undefined' && 
    (document.cookie.includes('isAuthenticated=true') || 
     localStorage.getItem('isAuthenticated') === 'true')

  // Debug the current path and auth state
  useEffect(() => {
    console.log(`Protected Layout - Current path: ${pathname}`)
    console.log(`Protected Layout - Auth state: loading=${loading}, user=${user ? 'authenticated' : 'not authenticated'}, cookie/localStorage=${isAuthenticated}`)
    console.log(`Protected Layout - Initial render: ${initialRender}`)
  }, [pathname, loading, user, initialRender, isAuthenticated])

  // Auth check using the auth context - only redirect to login if not authenticated
  useEffect(() => {
    // Skip redirection on initial render to prevent flash
    if (initialRender) {
      setInitialRender(false)
      return
    }

    // Only redirect if not authenticated via user object AND not authenticated via cookie/localStorage
    if (!loading && !user && !isAuthenticated && pathname !== "/login") {
      console.log(`Protected Layout - Redirecting to login from ${pathname}`)
      router.push("/login")
    }
    // Do not redirect to dashboard if already on a protected page
    // This allows navigation between protected routes
  }, [user, loading, router, pathname, initialRender, isAuthenticated])

  return children
}
