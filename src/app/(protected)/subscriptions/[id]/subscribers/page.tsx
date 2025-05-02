"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconSearch,
  IconFilter,
  IconUser,
  IconCalendar,
  IconCreditCard,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import subscriptionPlanService, { SubscriptionPlan } from "@/services/subscription-plan.service"
import subscriptionService, { Subscription } from "@/services/subscription.service"
import { SubscriptionStatus } from "@/types/enums"

export default function SubscriptionPlanSubscribersPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch plan and subscriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch plan details
        const planData = await subscriptionPlanService.getPlanById(planId)
        setPlan(planData)
        
        // Fetch subscriptions for this plan
        const subscriptionsData = await subscriptionService.getAllSubscriptions(undefined, planId)
        setSubscriptions(subscriptionsData)
      } catch (err: any) {
        console.error('Failed to fetch data:', err)
        setError(`Failed to load data: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (planId) {
      fetchData()
    }
  }, [planId])

  // Filter subscriptions based on search query and status filter
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Get status badge color
  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return "bg-green-100 text-green-800 border-green-300";
      case SubscriptionStatus.CANCELED:
        return "bg-orange-100 text-orange-800 border-orange-300";
      case SubscriptionStatus.PAST_DUE:
        return "bg-red-100 text-red-800 border-red-300";
      case SubscriptionStatus.UNPAID:
        return "bg-red-100 text-red-800 border-red-300";
      case SubscriptionStatus.TRIAL:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case SubscriptionStatus.EXPIRED:
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  // Cancel a subscription
  const cancelSubscription = async (subscriptionId: string) => {
    if (confirm("Are you sure you want to cancel this subscription?")) {
      try {
        await subscriptionService.cancelSubscription(subscriptionId, {
          cancelReason: "Canceled by admin",
        });
        
        // Update the subscription in the list
        setSubscriptions(subscriptions.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: SubscriptionStatus.CANCELED, canceledAt: new Date() } 
            : sub
        ));
        
        toast.success("Subscription canceled", {
          description: "The subscription has been canceled successfully.",
          icon: <IconCheck className="h-4 w-4" />,
        });
      } catch (err: any) {
        console.error('Failed to cancel subscription:', err);
        toast.error("Failed to cancel subscription", {
          description: err.message || "An error occurred while canceling the subscription.",
          icon: <IconAlertCircle className="h-4 w-4" />,
        });
      }
    }
  }

  // Renew a subscription
  const renewSubscription = async (subscriptionId: string) => {
    if (confirm("Are you sure you want to renew this subscription?")) {
      try {
        const updatedSubscription = await subscriptionService.renewSubscription(subscriptionId);
        
        // Update the subscription in the list
        setSubscriptions(subscriptions.map(sub => 
          sub.id === subscriptionId ? updatedSubscription : sub
        ));
        
        toast.success("Subscription renewed", {
          description: `The subscription has been renewed until ${formatDate(updatedSubscription.renewalDate)}.`,
          icon: <IconCheck className="h-4 w-4" />,
        });
      } catch (err: any) {
        console.error('Failed to renew subscription:', err);
        toast.error("Failed to renew subscription", {
          description: err.message || "An error occurred while renewing the subscription.",
          icon: <IconAlertCircle className="h-4 w-4" />,
        });
      }
    }
  }

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
          <SiteHeader title="Plan Subscribers" />
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading subscribers...</span>
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
          <SiteHeader title="Plan Subscribers" />
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
          <SiteHeader title="Plan Subscribers" />
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

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={`${plan.name} - Subscribers`} />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/subscriptions")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Subscriptions
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{plan.name} Subscribers</h1>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plan.subscriberCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customers subscribed to this plan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptions.filter(sub => sub.status === SubscriptionStatus.ACTIVE).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active subscriptions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(plan.price * (subscriptions.filter(sub => sub.status === SubscriptionStatus.ACTIVE).length))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated monthly revenue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and filter */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 md:max-w-sm">
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search subscribers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <IconFilter className="mr-2 h-4 w-4" />
                    {statusFilter === "all" ? "All Statuses" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(SubscriptionStatus.ACTIVE)}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(SubscriptionStatus.CANCELED)}>
                    Canceled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(SubscriptionStatus.PAST_DUE)}>
                    Past Due
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(SubscriptionStatus.TRIAL)}>
                    Trial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(SubscriptionStatus.EXPIRED)}>
                    Expired
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Subscribers table */}
          <div className="relative w-full overflow-auto">
            {filteredSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <IconUser className="h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No subscribers found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {subscriptions.length === 0 
                    ? "This plan doesn't have any subscribers yet." 
                    : "No subscribers match your search criteria."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{subscription.customer?.name || "Unknown"}</span>
                          <span className="text-sm text-muted-foreground">{subscription.customer?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(subscription.status)}
                        >
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription.renewalDate)}</TableCell>
                      <TableCell>
                        {subscription.paymentMethod || (
                          <span className="text-muted-foreground italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {subscription.status === SubscriptionStatus.ACTIVE && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelSubscription(subscription.id)}
                            >
                              <IconX className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => renewSubscription(subscription.id)}
                            disabled={subscription.status !== SubscriptionStatus.ACTIVE}
                          >
                            <IconRefresh className="mr-2 h-4 w-4" />
                            Renew
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
