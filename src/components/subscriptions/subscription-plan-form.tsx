"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
  IconCrown,
  IconCurrencyDollar,
  IconCalendarTime,
  IconListDetails,
  IconPlus,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import subscriptionPlanService, { SubscriptionPlan, CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from "@/services/subscription-plan.service"
import { BillingCycle } from "@/types/enums"

interface SubscriptionPlanFormProps {
  mode: 'create' | 'edit'
  initialData?: SubscriptionPlan
  title: string
}

export default function SubscriptionPlanForm({ mode, initialData, title }: SubscriptionPlanFormProps) {
  // Form state
  const [formState, setFormState] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    billingCycle: initialData?.billingCycle || BillingCycle.MONTHLY,
    features: initialData?.features || [""],
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  })
  
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formState.name) {
        throw new Error("Plan name is required")
      }

      if (!formState.price || isNaN(parseFloat(formState.price)) || parseFloat(formState.price) < 0) {
        throw new Error("Price must be a valid positive number")
      }

      // Filter out empty features
      const features = formState.features.filter(feature => feature.trim() !== "")
      
      if (features.length === 0) {
        throw new Error("At least one feature is required")
      }

      // Prepare the data
      const planData: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto = {
        name: formState.name,
        description: formState.description || undefined,
        price: parseFloat(formState.price),
        billingCycle: formState.billingCycle,
        features: features,
        isActive: formState.isActive,
      }

      console.log('Submitting plan data:', JSON.stringify(planData, null, 2))

      let result
      if (mode === 'create') {
        // Create new plan
        result = await subscriptionPlanService.createPlan(planData as CreateSubscriptionPlanDto)
        console.log('Plan created successfully:', result)
        toast.success("Plan created successfully", {
          description: `${formState.name} has been added.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      } else {
        // Update existing plan
        if (!initialData?.id) {
          throw new Error("Plan ID is missing for update")
        }
        result = await subscriptionPlanService.updatePlan(initialData.id, planData as UpdateSubscriptionPlanDto)
        console.log('Plan updated successfully:', result)
        toast.success("Plan updated successfully", {
          description: `${initialData.name} has been updated.`,
          icon: <IconCheck className="h-4 w-4" />,
        })
      }

      // Redirect to plans list
      router.push("/subscriptions")
    } catch (err: any) {
      console.error(`Failed to ${mode} plan:`, err)
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)
        
        // Handle array of error messages
        let errorMessage = err.response.data?.message;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(', ');
        }
        
        setError(`Failed to ${mode} plan: ${errorMessage || err.message || 'Server error'}`)
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request:', err.request)
        setError(`Failed to ${mode} plan: No response from server. Please check your connection.`)
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to ${mode} plan: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a new feature field
  const addFeature = () => {
    setFormState({
      ...formState,
      features: [...formState.features, ""]
    })
  }

  // Remove a feature field
  const removeFeature = (index: number) => {
    const newFeatures = [...formState.features]
    newFeatures.splice(index, 1)
    setFormState({
      ...formState,
      features: newFeatures.length > 0 ? newFeatures : [""]
    })
  }

  // Update a feature field
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formState.features]
    newFeatures[index] = value
    setFormState({
      ...formState,
      features: newFeatures
    })
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
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
        <SiteHeader title={title} />
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
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Plan"}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Plan Information</CardTitle>
                <CardDescription>
                  Basic information about the subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                    <IconCrown className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Premium Monthly"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      className="border-0 focus-visible:ring-0"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The name of the subscription plan that will be displayed to users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Get access to all premium features"
                    value={formState.description}
                    onChange={(e) => setFormState({...formState, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional description of what this plan offers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <IconCurrencyDollar className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="9.99"
                        value={formState.price}
                        onChange={(e) => setFormState({...formState, price: e.target.value})}
                        className="border-0 focus-visible:ring-0"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The price of the subscription plan
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <IconCalendarTime className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={formState.billingCycle}
                        onValueChange={(value) => setFormState({...formState, billingCycle: value as BillingCycle})}
                      >
                        <SelectTrigger className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BillingCycle.MONTHLY}>Monthly</SelectItem>
                          <SelectItem value={BillingCycle.QUARTERLY}>Quarterly</SelectItem>
                          <SelectItem value={BillingCycle.ANNUAL}>Annual</SelectItem>
                          <SelectItem value={BillingCycle.LIFETIME}>Lifetime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      How often the subscription will be billed
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="features">Features</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formState.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                          <IconListDetails className="ml-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ad-free experience"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="border-0 focus-visible:ring-0"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          disabled={formState.features.length === 1 && feature === ""}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List of features included in this subscription plan
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Switch
                    id="isActive"
                    checked={formState.isActive}
                    onCheckedChange={(checked) => setFormState({...formState, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-muted-foreground ml-2">
                    {formState.isActive ? "This plan is visible to customers" : "This plan is hidden from customers"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Plan"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
