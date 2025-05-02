"use client"

import * as React from "react"
import {
  IconDeviceFloppy,
  IconPalette,
  IconPhoto,
  IconUpload,
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

export default function AppearanceSettingsPage() {
  // Form state for the UI demonstration
  const [formState, setFormState] = React.useState({
    primaryColor: "#FFC701",
    secondaryColor: "#FF9800",
    backgroundColor: "#121212",
    textColor: "#FFFFFF",
    fontFamily: "Inter",
    fontSize: "16px",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    enableDarkMode: true,
    defaultTheme: "dark",
    customCss: "",
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
      alert("Appearance settings saved successfully!")
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
          <Tabs defaultValue="appearance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="font-medium" onClick={() => window.location.href = "/settings/general"}>General</TabsTrigger>
              <TabsTrigger value="appearance" className="font-medium">Appearance</TabsTrigger>
              <TabsTrigger value="firebase" className="font-medium" onClick={() => window.location.href = "/settings/firebase"}>Firebase</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="mt-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>
                      Customize the colors of your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color"
                            value={formState.primaryColor}
                            onChange={(e) => setFormState({...formState, primaryColor: e.target.value})}
                            className="w-16 h-10 p-1"
                          />
                          <Input 
                            type="text"
                            value={formState.primaryColor}
                            onChange={(e) => setFormState({...formState, primaryColor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Main accent color for buttons and links
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color"
                            value={formState.secondaryColor}
                            onChange={(e) => setFormState({...formState, secondaryColor: e.target.value})}
                            className="w-16 h-10 p-1"
                          />
                          <Input 
                            type="text"
                            value={formState.secondaryColor}
                            onChange={(e) => setFormState({...formState, secondaryColor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Secondary accent color for highlights
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Background Color</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color"
                            value={formState.backgroundColor}
                            onChange={(e) => setFormState({...formState, backgroundColor: e.target.value})}
                            className="w-16 h-10 p-1"
                          />
                          <Input 
                            type="text"
                            value={formState.backgroundColor}
                            onChange={(e) => setFormState({...formState, backgroundColor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Main background color for the application
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Text Color</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color"
                            value={formState.textColor}
                            onChange={(e) => setFormState({...formState, textColor: e.target.value})}
                            className="w-16 h-10 p-1"
                          />
                          <Input 
                            type="text"
                            value={formState.textColor}
                            onChange={(e) => setFormState({...formState, textColor: e.target.value})}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Main text color for the application
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>
                      Customize the fonts and text styles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Font Family</label>
                      <Select 
                        onValueChange={(value) => setFormState({...formState, fontFamily: value})} 
                        value={formState.fontFamily}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Base Font Size</label>
                      <Select 
                        onValueChange={(value) => setFormState({...formState, fontSize: value})} 
                        value={formState.fontSize}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14px">Small (14px)</SelectItem>
                          <SelectItem value="16px">Medium (16px)</SelectItem>
                          <SelectItem value="18px">Large (18px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>
                      Upload your logo and favicon
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md border flex items-center justify-center bg-muted">
                          <IconPhoto className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <Input 
                            placeholder="Enter logo URL or upload" 
                            value={formState.logoUrl}
                            onChange={(e) => setFormState({...formState, logoUrl: e.target.value})}
                            className="mb-2"
                          />
                          <Button variant="outline" size="sm">
                            <IconUpload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recommended size: 200x50 pixels, PNG or SVG format
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Favicon</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md border flex items-center justify-center bg-muted">
                          <IconPhoto className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <Input 
                            placeholder="Enter favicon URL or upload" 
                            value={formState.faviconUrl}
                            onChange={(e) => setFormState({...formState, faviconUrl: e.target.value})}
                            className="mb-2"
                          />
                          <Button variant="outline" size="sm">
                            <IconUpload className="mr-2 h-4 w-4" />
                            Upload Favicon
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recommended size: 32x32 pixels, ICO or PNG format
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Settings</CardTitle>
                    <CardDescription>
                      Configure theme options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Enable Dark Mode</label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to switch between light and dark mode
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableDarkMode} 
                        onCheckedChange={(checked) => setFormState({...formState, enableDarkMode: checked})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Theme</label>
                      <Select 
                        onValueChange={(value) => setFormState({...formState, defaultTheme: value})} 
                        value={formState.defaultTheme}
                        disabled={!formState.enableDarkMode}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Custom CSS</CardTitle>
                    <CardDescription>
                      Add custom CSS to further customize your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <textarea
                        placeholder="Enter custom CSS code"
                        className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formState.customCss}
                        onChange={(e) => setFormState({...formState, customCss: e.target.value})}
                      />
                      <p className="text-sm text-muted-foreground">
                        Advanced: Add custom CSS to override default styles
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
