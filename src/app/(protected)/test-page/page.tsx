"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function TestPage() {
  const router = useRouter()
  
  // Add debugging
  React.useEffect(() => {
    console.log("Test page mounted");
    
    // Add a cleanup function to detect unmounting
    return () => {
      console.log("Test page unmounted");
    };
  }, []);
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Test Page" />
        <div className="space-y-6 p-6">
          <h1 className="text-3xl font-bold">Test Page</h1>
          <p>This is a test page to debug routing issues.</p>
          
          <div className="flex flex-col gap-4 mt-8">
            <h2 className="text-xl font-semibold">Navigation Tests</h2>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push('/songs')}>
                Go to Songs
              </Button>
              <Button onClick={() => {
                console.log('Navigating to /songs with window.location');
                window.location.href = '/songs';
              }}>
                Go to Songs (window.location)
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
