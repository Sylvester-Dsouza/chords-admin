'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accountDeletionService, AccountDeletionRequest, UpdateAccountDeletionRequestDto } from '@/services/account-deletion.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AccountDeletionRequestDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<AccountDeletionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [notes, setNotes] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (params.id) {
      loadRequest();
    }
  }, [params.id]);

  const loadRequest = async () => {
    try {
      setIsLoading(true);
      const data = await accountDeletionService.getRequestById(params.id);
      setRequest(data);
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Error loading account deletion request:', error);
      toast.error('Failed to load account deletion request');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    if (!request) return;

    try {
      setIsUpdating(true);
      const updateData: UpdateAccountDeletionRequestDto = {
        status,
        notes,
      };

      const updatedRequest = await accountDeletionService.updateRequest(request.id, updateData);
      setRequest(updatedRequest);
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error updating request status to ${status}:`, error);
      toast.error(`Failed to update request status to ${status}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const executeAccountDeletion = async () => {
    if (!request) return;

    try {
      setIsExecuting(true);
      await accountDeletionService.executeAccountDeletion(request.id);
      toast.success('Account deletion executed successfully');
      // Reload the request to get updated status
      await loadRequest();
    } catch (error) {
      console.error('Error executing account deletion:', error);
      toast.error('Failed to execute account deletion');
    } finally {
      setIsExecuting(false);
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!request) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Request not found.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Account Deletion Request</h1>
            <p className="text-sm text-muted-foreground">
              Manage account deletion request details.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/account-deletion')}>
              Back to List
            </Button>
            <Button onClick={loadRequest} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Request Details</TabsTrigger>
            <TabsTrigger value="customer">Customer Information</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Request Information</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  Details about this account deletion request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Request ID</h3>
                    <p>{request.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p>{request.status}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Requested At</h3>
                    <p>{format(new Date(request.requestedAt), 'PPpp')}</p>
                  </div>
                  {request.processedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Processed At</h3>
                      <p>{format(new Date(request.processedAt), 'PPpp')}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                  <p className="p-3 bg-muted rounded-md mt-1">
                    {request.reason || 'No reason provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>
                  Add notes about this account deletion request.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={4}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => updateRequestStatus('REJECTED')}
                    disabled={isUpdating || request.status === 'REJECTED' || request.status === 'COMPLETED'}
                  >
                    Reject Request
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => updateRequestStatus('APPROVED')}
                    disabled={isUpdating || request.status === 'APPROVED' || request.status === 'COMPLETED'}
                  >
                    Approve Request
                  </Button>
                </div>

                {request.status === 'APPROVED' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isExecuting}>
                        Execute Deletion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the customer account
                          and all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeAccountDeletion}>
                          Yes, Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="customer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.customer?.profilePicture || undefined} />
                    <AvatarFallback>
                      {request.customer?.name?.[0] || request.customer?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{request.customer?.name}</CardTitle>
                    <CardDescription>{request.customer?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Customer ID</h3>
                    <p>{request.customerId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{request.customer?.email}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/customers/${request.customerId}`)}
                >
                  View Customer Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
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
        <SiteHeader title="Account Deletion Request Details" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}