"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Auth check using the auth context
  useEffect(() => {
    // Only redirect after auth state is loaded and user is not authenticated
    if (!loading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, loading, router, pathname])

  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
