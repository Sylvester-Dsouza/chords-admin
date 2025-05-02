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

import data from "./data.json"

export default function Page() {
  // Add debugging
  React.useEffect(() => {
    console.log("Dashboard page mounted");

    // Add a cleanup function to detect unmounting
    return () => {
      console.log("Dashboard page unmounted");
    };
  }, []);
  // Add a state to track if this is the initial render
  const [isInitialRender, setIsInitialRender] = React.useState(true);
  
  // Use this effect to set isInitialRender to false after the component mounts
  React.useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [isInitialRender]);
  
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
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
