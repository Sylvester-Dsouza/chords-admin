"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import * as React from "react"
import { AnalyticsService } from "@/services/analytics.service"
import { toast } from "sonner"

// Mock data for DataTable until we have real task/project data
import data from "./data.json"

export default function Page() {
  // State for analytics data
  const [analyticsData, setAnalyticsData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch analytics data on component mount
  React.useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch analytics data with rate limiting
        const data = await AnalyticsService.getAllAnalytics('month')
        setAnalyticsData(data)

        console.log("Dashboard analytics data loaded:", data)
      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err)

        if (err.message === 'AUTH_ERROR') {
          setError('Authentication failed. Please check your permissions.')
          toast.error('Authentication Error', {
            description: 'Unable to load analytics data. Please refresh and try again.'
          })
        } else {
          setError('Failed to load analytics data')
          toast.error('Loading Error', {
            description: 'Unable to load dashboard data. Using fallback data.'
          })
        }

        // Set fallback data
        setAnalyticsData({
          userActivity: { activeUsers: 0, newUsers: 0, totalSessions: 0 },
          contentEngagement: { viewsByType: { song: 0, artist: 0, collection: 0 }, totalLikes: 0 }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  return (
    <SidebarProvider
      // Prevent automatic navigation on mount
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                analyticsData={analyticsData}
                isLoading={isLoading}
                error={error}
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  analyticsData={analyticsData}
                  isLoading={isLoading}
                />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
