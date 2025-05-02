"use client"

import * as React from "react"
import {
  IconDeviceFloppy,
  IconBrandFirebase,
  IconEye,
  IconEyeOff,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function FirebaseSettingsPage() {
  // Form state for the UI demonstration
  const [formState, setFormState] = React.useState({
    apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
    authDomain: "christian-chords.firebaseapp.com",
    projectId: "christian-chords",
    storageBucket: "christian-chords.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0",
    measurementId: "G-ABC123DEF45",
    enableEmailAuth: true,
    enableGoogleAuth: true,
    enableFacebookAuth: false,
    enableAppleAuth: false,
    googleClientId: "",
    facebookAppId: "",
    appleServiceId: "",
  })
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSecrets, setShowSecrets] = React.useState(false)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Here you would typically send the data to your API
    console.log("Form data:", formState)
    
    // Simulate API call
    setTimeout(() => {
      // Show success message
      alert("Firebase settings saved successfully!")
      setIsSubmitting(false)
    }, 1000)
  }

  // Toggle password visibility
  const toggleShowSecrets = () => {
    setShowSecrets(!showSecrets)
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
          <Tabs defaultValue="firebase">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="font-medium" onClick={() => window.location.href = "/settings/general"}>General</TabsTrigger>
              <TabsTrigger value="appearance" className="font-medium" onClick={() => window.location.href = "/settings/appearance"}>Appearance</TabsTrigger>
              <TabsTrigger value="firebase" className="font-medium">Firebase</TabsTrigger>
            </TabsList>
            
            <TabsContent value="firebase" className="mt-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-8">
                <Alert>
                  <IconBrandFirebase className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    These settings connect your application to Firebase for authentication and other services. 
                    Be careful when changing these values as it may affect user login functionality.
                  </AlertDescription>
                </Alert>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Firebase Configuration</CardTitle>
                    <CardDescription>
                      Firebase project configuration details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-end mb-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleShowSecrets}
                      >
                        {showSecrets ? (
                          <>
                            <IconEyeOff className="mr-2 h-4 w-4" />
                            Hide Secrets
                          </>
                        ) : (
                          <>
                            <IconEye className="mr-2 h-4 w-4" />
                            Show Secrets
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <Input 
                        type={showSecrets ? "text" : "password"}
                        placeholder="Enter Firebase API key" 
                        value={formState.apiKey}
                        onChange={(e) => setFormState({...formState, apiKey: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Auth Domain</label>
                      <Input 
                        placeholder="Enter Firebase auth domain" 
                        value={formState.authDomain}
                        onChange={(e) => setFormState({...formState, authDomain: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project ID</label>
                      <Input 
                        placeholder="Enter Firebase project ID" 
                        value={formState.projectId}
                        onChange={(e) => setFormState({...formState, projectId: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Storage Bucket</label>
                      <Input 
                        placeholder="Enter Firebase storage bucket" 
                        value={formState.storageBucket}
                        onChange={(e) => setFormState({...formState, storageBucket: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Messaging Sender ID</label>
                      <Input 
                        placeholder="Enter Firebase messaging sender ID" 
                        value={formState.messagingSenderId}
                        onChange={(e) => setFormState({...formState, messagingSenderId: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">App ID</label>
                      <Input 
                        type={showSecrets ? "text" : "password"}
                        placeholder="Enter Firebase app ID" 
                        value={formState.appId}
                        onChange={(e) => setFormState({...formState, appId: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Measurement ID (Optional)</label>
                      <Input 
                        placeholder="Enter Firebase measurement ID" 
                        value={formState.measurementId}
                        onChange={(e) => setFormState({...formState, measurementId: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Methods</CardTitle>
                    <CardDescription>
                      Configure authentication providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Email/Password Authentication</label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to sign in with email and password
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableEmailAuth} 
                        onCheckedChange={(checked) => setFormState({...formState, enableEmailAuth: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Google Authentication</label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to sign in with Google
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableGoogleAuth} 
                        onCheckedChange={(checked) => setFormState({...formState, enableGoogleAuth: checked})}
                      />
                    </div>
                    
                    {formState.enableGoogleAuth && (
                      <div className="space-y-2 ml-6 mt-2">
                        <label className="text-sm font-medium">Google Client ID</label>
                        <Input 
                          type={showSecrets ? "text" : "password"}
                          placeholder="Enter Google client ID" 
                          value={formState.googleClientId}
                          onChange={(e) => setFormState({...formState, googleClientId: e.target.value})}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Facebook Authentication</label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to sign in with Facebook
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableFacebookAuth} 
                        onCheckedChange={(checked) => setFormState({...formState, enableFacebookAuth: checked})}
                      />
                    </div>
                    
                    {formState.enableFacebookAuth && (
                      <div className="space-y-2 ml-6 mt-2">
                        <label className="text-sm font-medium">Facebook App ID</label>
                        <Input 
                          type={showSecrets ? "text" : "password"}
                          placeholder="Enter Facebook app ID" 
                          value={formState.facebookAppId}
                          onChange={(e) => setFormState({...formState, facebookAppId: e.target.value})}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Apple Authentication</label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to sign in with Apple
                        </p>
                      </div>
                      <Switch 
                        checked={formState.enableAppleAuth} 
                        onCheckedChange={(checked) => setFormState({...formState, enableAppleAuth: checked})}
                      />
                    </div>
                    
                    {formState.enableAppleAuth && (
                      <div className="space-y-2 ml-6 mt-2">
                        <label className="text-sm font-medium">Apple Service ID</label>
                        <Input 
                          type={showSecrets ? "text" : "password"}
                          placeholder="Enter Apple service ID" 
                          value={formState.appleServiceId}
                          onChange={(e) => setFormState({...formState, appleServiceId: e.target.value})}
                        />
                      </div>
                    )}
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
