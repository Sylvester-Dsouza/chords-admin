"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconCreditCard,
  IconFilter,
  IconSearch,
  IconTrash,
  IconDotsVertical,
  IconUser,
  IconCalendar,
  IconCrown,
  IconCurrencyDollar,
  IconDeviceMobile,
  IconAd,
  IconCheck,
  IconX,
  IconPlus,
  IconPencil,
  IconDownload,
  IconRefresh,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import subscriptionPlanService, { SubscriptionPlan } from "@/services/subscription-plan.service"
import subscriptionService, { Subscription } from "@/services/subscription.service"
import transactionService from "@/services/transaction.service"
import { BillingCycle, SubscriptionStatus } from "@/types/enums"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SubscriptionsPage() {
  return <SubscriptionsPageContent />
}

// Sample data for subscribers
const subscribers = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "alex@example.com",
    plan: "Premium Annual",
    startDate: new Date("2023-01-15"),
    renewalDate: new Date("2024-01-15"),
    status: "Active",
    paymentMethod: "Visa ending in 4242",
    amount: 99.99,
  },
  {
    id: "2",
    name: "Emily Davis",
    email: "emily@example.com",
    plan: "Premium Monthly",
    startDate: new Date("2023-03-10"),
    renewalDate: new Date("2023-04-10"),
    status: "Active",
    paymentMethod: "PayPal",
    amount: 9.99,
  },
  {
    id: "3",
    name: "Robert Wilson",
    email: "robert@example.com",
    plan: "Ad-Free Only",
    startDate: new Date("2023-02-22"),
    renewalDate: new Date("2023-03-22"),
    status: "Active",
    paymentMethod: "Mastercard ending in 5678",
    amount: 4.99,
  },
  {
    id: "4",
    name: "Lisa Brown",
    email: "lisa@example.com",
    plan: "Premium Monthly",
    startDate: new Date("2023-01-05"),
    renewalDate: new Date("2023-02-05"),
    status: "Canceled",
    paymentMethod: "Visa ending in 9876",
    amount: 9.99,
  },
  {
    id: "5",
    name: "Michael Clark",
    email: "michael@example.com",
    plan: "Premium Annual",
    startDate: new Date("2022-11-15"),
    renewalDate: new Date("2023-11-15"),
    status: "Active",
    paymentMethod: "Apple Pay",
    amount: 99.99,
  },
  {
    id: "6",
    name: "Jennifer Lee",
    email: "jennifer@example.com",
    plan: "Ad-Free Only",
    startDate: new Date("2023-03-01"),
    renewalDate: new Date("2023-04-01"),
    status: "Active",
    paymentMethod: "Google Pay",
    amount: 4.99,
  },
  {
    id: "7",
    name: "David Martinez",
    email: "david@example.com",
    plan: "Premium Annual",
    startDate: new Date("2022-12-10"),
    renewalDate: new Date("2023-12-10"),
    status: "Active",
    paymentMethod: "Amex ending in 1234",
    amount: 99.99,
  },
  {
    id: "8",
    name: "Jessica Taylor",
    email: "jessica@example.com",
    plan: "Premium Monthly",
    startDate: new Date("2023-02-15"),
    renewalDate: new Date("2023-03-15"),
    status: "Past Due",
    paymentMethod: "Visa ending in 5432",
    amount: 9.99,
  },
]

// Sample data for transactions
const transactions = [
  {
    id: "1",
    customer: "Alex Thompson",
    email: "alex@example.com",
    plan: "Premium Annual",
    date: new Date("2023-01-15"),
    amount: 99.99,
    status: "Completed",
    paymentMethod: "Visa ending in 4242",
  },
  {
    id: "2",
    customer: "Emily Davis",
    email: "emily@example.com",
    plan: "Premium Monthly",
    date: new Date("2023-03-10"),
    amount: 9.99,
    status: "Completed",
    paymentMethod: "PayPal",
  },
  {
    id: "3",
    customer: "Robert Wilson",
    email: "robert@example.com",
    plan: "Ad-Free Only",
    date: new Date("2023-02-22"),
    amount: 4.99,
    status: "Completed",
    paymentMethod: "Mastercard ending in 5678",
  },
  {
    id: "4",
    customer: "Emily Davis",
    email: "emily@example.com",
    plan: "Premium Monthly",
    date: new Date("2023-02-10"),
    amount: 9.99,
    status: "Completed",
    paymentMethod: "PayPal",
  },
  {
    id: "5",
    customer: "Michael Clark",
    email: "michael@example.com",
    plan: "Premium Annual",
    date: new Date("2022-11-15"),
    amount: 99.99,
    status: "Completed",
    paymentMethod: "Apple Pay",
  },
  {
    id: "6",
    customer: "Jennifer Lee",
    email: "jennifer@example.com",
    plan: "Ad-Free Only",
    date: new Date("2023-03-01"),
    amount: 4.99,
    status: "Completed",
    paymentMethod: "Google Pay",
  },
  {
    id: "7",
    customer: "Jessica Taylor",
    email: "jessica@example.com",
    plan: "Premium Monthly",
    date: new Date("2023-02-15"),
    amount: 9.99,
    status: "Failed",
    paymentMethod: "Visa ending in 5432",
  },
  {
    id: "8",
    customer: "Robert Wilson",
    email: "robert@example.com",
    plan: "Ad-Free Only",
    date: new Date("2023-01-22"),
    amount: 4.99,
    status: "Completed",
    paymentMethod: "Mastercard ending in 5678",
  },
]

function SubscriptionsPageContent() {
  const router = useRouter()

  // State for subscription plans
  const [subscriptionPlans, setSubscriptionPlans] = React.useState<SubscriptionPlan[]>([])
  const [loadingPlans, setLoadingPlans] = React.useState(true)
  const [plansError, setPlansError] = React.useState<string | null>(null)

  // Fetch subscription plans
  React.useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoadingPlans(true)
        const data = await subscriptionPlanService.getAllPlans(true) // Include inactive plans
        setSubscriptionPlans(data)
      } catch (err: any) {
        console.error('Failed to fetch subscription plans:', err)
        setPlansError(`Failed to load subscription plans: ${err.message || 'Unknown error'}`)
      } finally {
        setLoadingPlans(false)
      }
    }

    fetchSubscriptionPlans()
  }, [])

  // We're not using subscriptions data yet, so we've removed the fetch
  const [activeTab, setActiveTab] = React.useState("plans")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [planFilter, setPlanFilter] = React.useState("all")

  // Calculate total revenue
  const totalMonthlyRevenue = subscriptionPlans.reduce((total, plan) => {
    if (plan.isActive) {
      if (plan.billingCycle === BillingCycle.MONTHLY) {
        return total + (plan.revenue || 0);
      } else if (plan.billingCycle === BillingCycle.ANNUAL) {
        return total + ((plan.revenue || 0) / 12);
      }
    }
    return total;
  }, 0);

  const totalSubscribers = subscriptionPlans.reduce((total, plan) => total + (plan.subscriberCount || 0), 0);

  // Show loading state
  if (loadingPlans) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Subscriptions" />
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading subscription data...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show error state
  if (plansError) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Subscriptions" />
          <div className="p-6">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{plansError}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Filter subscribers based on search query and filters
  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      (searchQuery === "" ||
        subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscriber.plan.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || subscriber.status.toLowerCase() === statusFilter.toLowerCase()) &&
      (planFilter === "all" || subscriber.plan === planFilter)
  );

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(
    (transaction) =>
      searchQuery === "" ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Toggle all items selection
  const toggleAllItems = (items: any[]) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((item) => item.id))
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
        <SiteHeader title="Subscriptions" />
        <div className="space-y-6 p-6">
          {/* Header with page name and action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
              <p className="text-muted-foreground">
                Manage subscription plans and subscribers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="default" size="sm" onClick={() => router.push("/subscriptions/new")}>
                <IconPlus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubscribers}</div>
                <p className="text-xs text-muted-foreground">
                  +24 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionPlans.filter(plan => plan.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of {subscriptionPlans.length} total plans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ad-Free Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscribers.filter(sub => sub.status === "Active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  All subscribers get ad-free experience
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for plans, subscribers, and transactions */}
          <Tabs defaultValue="plans" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={!plan.isActive ? "opacity-70" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{plan.name}</CardTitle>
                        {plan.isActive ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {formatCurrency(plan.price)} / {plan.billingCycle.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Features</h3>
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <IconCheck className="mr-2 h-4 w-4 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Subscribers</h3>
                            <p className="text-lg font-medium">{plan.subscriberCount || 0}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
                            <p className="text-lg font-medium">{formatCurrency(plan.revenue || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/subscriptions/${plan.id}/edit`)}>
                          <IconPencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/subscriptions/${plan.id}/subscribers`)}>
                          <IconUser className="mr-2 h-4 w-4" />
                          Subscribers
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/subscriptions/${plan.id}/transactions`)}>
                          <IconCreditCard className="mr-2 h-4 w-4" />
                          Transactions
                        </Button>
                      </div>
                      <Switch
                        checked={plan.isActive}
                        aria-label={`${plan.isActive ? "Deactivate" : "Activate"} ${plan.name}`}
                        onCheckedChange={async (checked) => {
                          try {
                            // Toggle plan active status
                            await subscriptionPlanService.togglePlanActive(plan.id, checked);

                            // Update the plan in the list
                            setSubscriptionPlans(subscriptionPlans.map(p =>
                              p.id === plan.id ? { ...p, isActive: checked } : p
                            ));

                            toast.success(`Plan ${checked ? "activated" : "deactivated"}`, {
                              description: `${plan.name} has been ${checked ? "activated" : "deactivated"}.`,
                              icon: <IconCheck className="h-4 w-4" />,
                            });
                          } catch (err: any) {
                            console.error(`Failed to ${checked ? "activate" : "deactivate"} plan:`, err);
                            toast.error(`Failed to ${checked ? "activate" : "deactivate"} plan`, {
                              description: err.message || `An error occurred while ${checked ? "activating" : "deactivating"} the plan.`,
                              icon: <IconAlertCircle className="h-4 w-4" />,
                            });
                          }
                        }}
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscribers</CardTitle>
                  <CardDescription>
                    Manage your subscription customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and filters */}
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search subscribers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full sm:w-[300px]"
                      />
                      <Button variant="outline" size="sm" className="h-9">
                        <IconSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        defaultValue="all"
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                          <SelectItem value="past due">Past Due</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        defaultValue="all"
                        value={planFilter}
                        onValueChange={setPlanFilter}
                      >
                        <SelectTrigger className="h-9 w-[180px]">
                          <SelectValue placeholder="Filter by plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Plans</SelectItem>
                          {subscriptionPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedItems.length > 0 && (
                        <Button variant="destructive" size="sm" className="h-9">
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete ({selectedItems.length})
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                filteredSubscribers.length > 0 &&
                                selectedItems.length === filteredSubscribers.length
                              }
                              onCheckedChange={() => toggleAllItems(filteredSubscribers)}
                              aria-label="Select all subscribers"
                            />
                          </TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Renewal Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubscribers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No subscribers found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubscribers.map((subscriber) => (
                            <TableRow key={subscriber.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedItems.includes(subscriber.id)}
                                  onCheckedChange={() => toggleItemSelection(subscriber.id)}
                                  aria-label={`Select ${subscriber.name}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="font-medium">{subscriber.name}</div>
                                  <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                                  <IconCrown className="mr-1 h-3 w-3" />
                                  {subscriber.plan}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(subscriber.startDate)}</TableCell>
                              <TableCell>{formatDate(subscriber.renewalDate)}</TableCell>
                              <TableCell>{formatCurrency(subscriber.amount)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    subscriber.status === "Active"
                                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                                      : subscriber.status === "Canceled"
                                      ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                      : "bg-red-500/10 text-red-500 border-red-500/20"
                                  }
                                >
                                  {subscriber.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <IconDotsVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuCheckboxItem>
                                      View Details
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                      Edit Subscription
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                      <IconRefresh className="mr-2 h-4 w-4" />
                                      Renew
                                    </DropdownMenuCheckboxItem>
                                    <Separator />
                                    <DropdownMenuCheckboxItem>
                                      <IconX className="mr-2 h-4 w-4" />
                                      Cancel Subscription
                                    </DropdownMenuCheckboxItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View all subscription payments and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="mb-4 flex items-center gap-2">
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full sm:w-[300px]"
                    />
                    <Button variant="outline" size="sm" className="h-9">
                      <IconSearch className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No transactions found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">#{transaction.id}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div>{transaction.customer}</div>
                                  <div className="text-sm text-muted-foreground">{transaction.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{transaction.plan}</TableCell>
                              <TableCell>{formatDate(transaction.date)}</TableCell>
                              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>{transaction.paymentMethod}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    transaction.status === "Completed"
                                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                                      : "bg-red-500/10 text-red-500 border-red-500/20"
                                  }
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
