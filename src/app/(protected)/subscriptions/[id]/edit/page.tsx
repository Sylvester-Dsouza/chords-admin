"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import SubscriptionPlanForm from "@/components/subscriptions/subscription-plan-form"
import subscriptionPlanService, { SubscriptionPlan } from "@/services/subscription-plan.service"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle } from "@tabler/icons-react"

export default function EditSubscriptionPlanPage() {
  const params = useParams()
  const planId = params.id as string
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true)
        const data = await subscriptionPlanService.getPlanById(planId)
        setPlan(data)
      } catch (err: any) {
        console.error('Failed to fetch subscription plan:', err)
        setError(`Failed to load subscription plan: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (planId) {
      fetchPlan()
    }
  }, [planId])

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Subscription Plan" />
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading subscription plan...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Subscription Plan" />
          <div className="p-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!plan) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Edit Subscription Plan" />
          <div className="p-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>Subscription plan not found</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return <SubscriptionPlanForm mode="edit" initialData={plan} title={`Edit Plan: ${plan.name}`} />
}
