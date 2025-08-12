'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accountDeletionService, AccountDeletionRequest } from '@/services/account-deletion.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AccountDeletionRequestsPage() {
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await accountDeletionService.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading account deletion requests:', error);
      toast.error('Failed to load account deletion requests');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (id: string) => {
    // In Next.js App Router, route groups like (protected) are not included in the URL
    // The correct path is still /account-deletion/[id]
    const detailsPath = `/account-deletion/${id}`;
    
    console.log('Current URL:', window.location.href);
    console.log('Target URL:', detailsPath);
    
    try {
      // Navigate to the details page
      router.push(detailsPath);
      console.log(`Navigating to account deletion details: ${detailsPath}`);
    } catch (error) {
      console.error('Navigation error:', error);
      // Try an alternative approach with full URL
      window.location.href = `${window.location.origin}${detailsPath}`;
    }
  };

  return (
    <SidebarProvider
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
        <SiteHeader title="Account Deletion Requests" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Account Deletion Requests</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage customer account deletion requests.
                  </p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push('/test')}
                    >
                      Test Dynamic Routes
                    </Button>
                  </div>
                </div>
                <Button onClick={loadRequests} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Requests</CardTitle>
                  <CardDescription>
                    View and manage all account deletion requests from customers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No account deletion requests found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Requested</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={request.customer?.profilePicture || undefined} />
                                    <AvatarFallback>
                                      {request.customer?.name?.[0] || request.customer?.email?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{request.customer?.name}</div>
                                    <div className="text-xs text-muted-foreground">{request.customer?.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {request.reason || 'No reason provided'}
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(request.id)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}