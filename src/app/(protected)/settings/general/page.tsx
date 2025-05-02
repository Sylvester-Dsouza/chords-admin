"use client"

import * as React from "react"
import {
  IconDeviceFloppy,
  IconSettings,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function GeneralSettingsPage() {
  // Form state for the UI demonstration
  const [formState, setFormState] = React.useState({
    siteName: "Christian Chords",
    siteDescription: "Find and play your favorite Christian songs with chord sheets",
    contactEmail: "support@christianchords.com",
    supportPhone: "+1 (555) 123-4567",
    defaultLanguage: "en",
    timeZone: "UTC",
    enableRegistration: true,
    enableContactForm: true,
    enableSongRequests: true,
    maintenanceMode: false,
  })
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Here you would typically send the data to your API
    console.log("Form data:", formState)
    
    // Simulate API call
    setTimeout(() => {
      // Show success message
      alert("Settings saved successfully!")
      setIsSubmitting(false)
    }, 1000)
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
        <SiteHeader title="Settings" />
        <div className="space-y-6 p-6">
          {/* Header with page name */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage application settings and configurations
              </p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {/* Settings tabs */}
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="font-medium">General</TabsTrigger>
              <TabsTrigger value="appearance" className="font-medium" onClick={() => window.location.href = "/settings/appearance"}>Appearance</TabsTrigger>
              <TabsTrigger value="firebase" className="font-medium" onClick={() => window.location.href = "/settings/firebase"}>Firebase</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Information</CardTitle>
                    <CardDescription>
                      Basic information about your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Site Name</label>
                      <Input 
                        placeholder="Enter site name" 
                        value={formState.siteName}
                        onChange={(e) => setFormState({...formState, siteName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Site Description</label>
                      <textarea
                        placeholder="Enter site description"
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formState.siteDescription}
                        onChange={(e) => setFormState({...formState, siteDescription: e.target.value})}
                      />
                      <p className="text-sm text-muted-foreground">
                        This description will be used for SEO and when sharing your site
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      How users can reach you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input 
                        type="email"
                        placeholder="Enter contact email" 
                        value={formState.contactEmail}
                        onChange={(e) => setFormState({...formState, contactEmail: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Support Phone (Optional)</label>
                      <Input 
                        placeholder="Enter support phone number" 
                        value={formState.supportPhone}
                        onChange={(e) => setFormState({...formState, supportPhone: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Settings</CardTitle>
                    <CardDescription>
                      Language and time zone settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Language</label>
                      <Select 
                        onValueChange={(value) => setFormState({...formState, defaultLanguage: value})} 
                        value={formState.defaultLanguage}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Zone</label>
                      <Select 
                        onValueChange={(value) => setFormState({...formState, timeZone: value})} 
                        value={formState.timeZone}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Site Features</CardTitle>
                    <CardDescription>
                      Enable or disable site features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">User Registration</label>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to register on the site
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableRegistration} 
                        onCheckedChange={(checked) => setFormState({...formState, enableRegistration: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Contact Form</label>
                        <p className="text-sm text-muted-foreground">
                          Enable the contact form for user inquiries
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableContactForm} 
                        onCheckedChange={(checked) => setFormState({...formState, enableContactForm: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Song Requests</label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to request new songs
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableSongRequests} 
                        onCheckedChange={(checked) => setFormState({...formState, enableSongRequests: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Maintenance Mode</label>
                        <p className="text-sm text-muted-foreground">
                          Put the site in maintenance mode (only admins can access)
                        </p>
                      </div>
                      <Switch 
                        checked={formState.maintenanceMode} 
                        onCheckedChange={(checked) => setFormState({...formState, maintenanceMode: checked})}
                      />
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
                    {isSubmitting ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
