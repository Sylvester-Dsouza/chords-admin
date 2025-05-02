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
  IconCurrencyDollar,
  IconReceipt,
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
import transactionService, { Transaction } from "@/services/transaction.service"
import { TransactionStatus } from "@/types/enums"

export default function SubscriptionPlanTransactionsPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch plan and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch plan details
        const planData = await subscriptionPlanService.getPlanById(planId)
        setPlan(planData)
        
        // Fetch transactions for this plan
        const transactionsData = await transactionService.getAllTransactions(undefined, undefined, planId)
        setTransactions(transactionsData)
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

  // Filter transactions based on search query and status filter
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paymentIntentId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      transaction.status === statusFilter;
    
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

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Get status badge color
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-300";
      case TransactionStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case TransactionStatus.FAILED:
        return "bg-red-100 text-red-800 border-red-300";
      case TransactionStatus.REFUNDED:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case TransactionStatus.DISPUTED:
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  // Update transaction status
  const updateTransactionStatus = async (transactionId: string, status: TransactionStatus) => {
    if (confirm(`Are you sure you want to mark this transaction as ${status.toLowerCase()}?`)) {
      try {
        const updatedTransaction = await transactionService.updateTransaction(transactionId, {
          status,
        });
        
        // Update the transaction in the list
        setTransactions(transactions.map(tx => 
          tx.id === transactionId ? updatedTransaction : tx
        ));
        
        toast.success("Transaction updated", {
          description: `The transaction has been marked as ${status.toLowerCase()}.`,
          icon: <IconCheck className="h-4 w-4" />,
        });
      } catch (err: any) {
        console.error('Failed to update transaction:', err);
        toast.error("Failed to update transaction", {
          description: err.message || "An error occurred while updating the transaction.",
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
          <SiteHeader title="Plan Transactions" />
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading transactions...</span>
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
          <SiteHeader title="Plan Transactions" />
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
          <SiteHeader title="Plan Transactions" />
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

  // Calculate total revenue
  const totalRevenue = transactions
    .filter(tx => tx.status === TransactionStatus.COMPLETED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={`${plan.name} - Transactions`} />
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
              <h1 className="text-3xl font-bold tracking-tight">{plan.name} Transactions</h1>
            </div>
          </div>

          {/* Analytics cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transactions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time transactions for this plan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transactions.filter(tx => tx.status === TransactionStatus.COMPLETED).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From completed transactions
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
                  placeholder="Search transactions..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter(TransactionStatus.COMPLETED)}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(TransactionStatus.PENDING)}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(TransactionStatus.FAILED)}>
                    Failed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(TransactionStatus.REFUNDED)}>
                    Refunded
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter(TransactionStatus.DISPUTED)}>
                    Disputed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Transactions table */}
          <div className="relative w-full overflow-auto">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <IconReceipt className="h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {transactions.length === 0 
                    ? "This plan doesn't have any transactions yet." 
                    : "No transactions match your search criteria."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.customer?.name || "Unknown"}</span>
                          <span className="text-sm text-muted-foreground">{transaction.customer?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IconCurrencyDollar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {formatCurrency(transaction.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(transaction.status)}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell>
                        {transaction.paymentMethod || (
                          <span className="text-muted-foreground italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {transaction.status !== TransactionStatus.COMPLETED && (
                              <DropdownMenuItem 
                                onClick={() => updateTransactionStatus(transaction.id, TransactionStatus.COMPLETED)}
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {transaction.status !== TransactionStatus.FAILED && (
                              <DropdownMenuItem 
                                onClick={() => updateTransactionStatus(transaction.id, TransactionStatus.FAILED)}
                              >
                                Mark as Failed
                              </DropdownMenuItem>
                            )}
                            {transaction.status !== TransactionStatus.REFUNDED && (
                              <DropdownMenuItem 
                                onClick={() => updateTransactionStatus(transaction.id, TransactionStatus.REFUNDED)}
                              >
                                Mark as Refunded
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
